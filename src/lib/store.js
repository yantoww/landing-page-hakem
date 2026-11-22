// Penyimpanan simulasi: satu objek state di localStorage browser, tanpa server.
// Aturan inti (satu anggota satu suara, ambang dukungan) ada di sini dan diuji di tests/logic.test.mjs.
import { useSyncExternalStore } from 'react';
import {
  STORAGE_KEY,
  MEMBER_BASE,
  QUORUM,
  ASP_REVIEW,
  ASP_AGENDA,
  ballots,
  forumSeed,
  aspSeed,
} from '../data/site.js';
import { emitSignal } from './signal.js';

const hasWindow = typeof window !== 'undefined';
const clone = (x) => JSON.parse(JSON.stringify(x));
const now = () => new Date().toISOString();

const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function code(n = 8) {
  const b = new Uint8Array(n);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(b);
  else for (let i = 0; i < n; i++) b[i] = Math.floor(Math.random() * 256);
  return Array.from(b, (x) => ALPHA[x % ALPHA.length]).join('');
}

function fresh() {
  return {
    v: 1,
    seq: 0,
    members: [], // [{ id, nick, group, issues, role, joined }]
    currentId: null,
    box: {}, // kotak suara: { [ballotId]: [{ option, at }] }, tanpa identitas
    roll: {}, // daftar pemilih: { [ballotId]: { [memberId]: kodeBukti } }, tanpa pilihan
    forum: forumSeed.map((t) => ({
      ...clone(t),
      posts: t.posts.map((p) => ({ ...p, memberId: null, sim: true })),
    })),
    reports: [],
    asp: aspSeed.map((a) => ({ ...clone(a), memberId: null, sim: true })),
    supports: {}, // { [aspId]: [memberId] }, dukungan dari perangkat ini
  };
}

let storageOk = true;
export const storageAvailable = () => storageOk;

function load() {
  if (!hasWindow) return fresh();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh();
    const saved = JSON.parse(raw);
    return saved && saved.v === 1 ? saved : fresh();
  } catch {
    storageOk = false;
    return fresh();
  }
}

let state = load();
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

function commit(next) {
  state = next;
  if (hasWindow) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      storageOk = false;
    }
  }
  emit();
}

export const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const getState = () => state;
export const useSim = () => useSyncExternalStore(subscribe, getState, getState);

if (hasWindow) {
  // Sinkron antar tab: perubahan di tab lain ikut tampil.
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      state = load();
      emit();
    }
  });
}

export const currentMember = (s) => s.members.find((m) => m.id === s.currentId) || null;

// ponytail: reset hanya untuk perangkat ini; tidak ada reset jarak jauh karena tidak ada server.
export function resetAll() {
  if (hasWindow) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      storageOk = false;
    }
  }
  state = fresh();
  emit();
}

// ---------- Keanggotaan ----------

export function register({ nick, group, issues = [], role = 'Anggota' }) {
  const seq = state.seq + 1;
  const member = {
    id: `SMP-${String(MEMBER_BASE + seq).padStart(4, '0')}`,
    nick: nick.trim(),
    group,
    issues,
    role,
    joined: now(),
  };
  commit({ ...state, seq, members: [...state.members, member], currentId: member.id });
  return member;
}

export const demoMember = () =>
  register({ nick: `Anggota Demo ${state.seq + 1}`, group: 'Lainnya', issues: [], role: 'Anggota' });

export const signIn = (id) => {
  if (state.members.some((m) => m.id === id)) commit({ ...state, currentId: id });
};
export const signOut = () => commit({ ...state, currentId: null });

// Hak hapus: identitas dihapus dan tulisan anggota dianonimkan. Jejak "sudah memilih" tetap ada
// (tanpa nama) agar satu orang tidak bisa memilih dua kali.
export function deleteMember(id) {
  const anon = 'Anggota terhapus';
  commit({
    ...state,
    members: state.members.filter((m) => m.id !== id),
    currentId: state.currentId === id ? null : state.currentId,
    forum: state.forum.map((t) => ({
      ...t,
      posts: t.posts.map((p) => (p.memberId === id ? { ...p, author: anon, memberId: null } : p)),
    })),
    asp: state.asp.map((a) => (a.memberId === id ? { ...a, author: anon, memberId: null } : a)),
  });
}

// ---------- Voting ----------

export function tally(s, ballot) {
  const counts = { ...ballot.seed };
  for (const v of s.box[ballot.id] || []) counts[v.option] = (counts[v.option] || 0) + 1;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const needed = Math.ceil(MEMBER_BASE * QUORUM);
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const leader = sorted.length && (sorted.length === 1 || sorted[0][1] > sorted[1][1]) ? sorted[0][0] : null;
  return {
    counts,
    total,
    needed,
    quorumMet: total >= needed,
    missing: Math.max(0, needed - total),
    leader,
    turnout: total / MEMBER_BASE,
  };
}

export function castVote(ballotId, memberId, optionId) {
  const ballot = ballots.find((b) => b.id === ballotId);
  if (!ballot) return { ok: false, reason: 'Pemungutan suara tidak ditemukan.' };
  if (ballot.status !== 'open') return { ok: false, reason: 'Pemungutan suara ini sudah ditutup.' };
  if (!ballot.options.some((o) => o.id === optionId)) return { ok: false, reason: 'Opsi tidak dikenal. Pilih salah satu opsi yang tersedia.' };
  if (!state.members.some((m) => m.id === memberId)) return { ok: false, reason: 'Hanya anggota yang bisa memberi suara. Daftar atau coba sebagai anggota demo.' };
  if (state.roll[ballotId]?.[memberId]) return { ok: false, reason: 'Kamu sudah memberi suara pada Rembuk ini. Satu anggota hanya punya satu suara.' };
  const receipt = `V-${code(8)}`;
  const wasMet = tally(state, ballot).quorumMet;
  commit({
    ...state,
    box: { ...state.box, [ballotId]: [...(state.box[ballotId] || []), { option: optionId, at: now() }] },
    roll: { ...state.roll, [ballotId]: { ...(state.roll[ballotId] || {}), [memberId]: receipt } },
  });
  // decided = suara ini yang melengkapi kuorum: peta menyalakan stasiun "Keputusan ditetapkan".
  emitSignal('s', { decided: !wasMet && tally(state, ballot).quorumMet });
  return { ok: true, receipt };
}

// ---------- Forum ----------

const lenErr = (text, min, max, what) => {
  const n = text.trim().length;
  if (n < min) return `${what} terlalu pendek. Tulis minimal ${min} karakter.`;
  if (n > max) return `${what} terlalu panjang. Batasnya ${max} karakter.`;
  return '';
};

export function postThread(memberId, { title, cat, text }) {
  const m = state.members.find((x) => x.id === memberId);
  if (!m) return { ok: false, reason: 'Hanya anggota yang bisa membuka topik.' };
  const reason = lenErr(title, 8, 90, 'Judul') || lenErr(text, 10, 600, 'Isi topik');
  if (reason) return { ok: false, reason };
  const thread = {
    id: `t-${code(6)}`,
    title: title.trim(),
    cat,
    posts: [{ id: `p-${code(6)}`, author: m.nick, memberId: m.id, at: now(), text: text.trim() }],
  };
  commit({ ...state, forum: [thread, ...state.forum] });
  emitSignal('f');
  return { ok: true, id: thread.id };
}

export function postReply(memberId, threadId, text) {
  const m = state.members.find((x) => x.id === memberId);
  if (!m) return { ok: false, reason: 'Hanya anggota yang bisa membalas.' };
  const reason = lenErr(text, 10, 600, 'Balasan');
  if (reason) return { ok: false, reason };
  commit({
    ...state,
    forum: state.forum.map((t) =>
      t.id === threadId
        ? { ...t, posts: [...t.posts, { id: `p-${code(6)}`, author: m.nick, memberId: m.id, at: now(), text: text.trim() }] }
        : t,
    ),
  });
  emitSignal('f');
  return { ok: true };
}

export function reportPost(threadId, postId) {
  const t = state.forum.find((x) => x.id === threadId);
  const p = t?.posts.find((x) => x.id === postId);
  if (!p || p.reported) return;
  commit({
    ...state,
    forum: state.forum.map((x) =>
      x.id === threadId ? { ...x, posts: x.posts.map((y) => (y.id === postId ? { ...y, reported: true } : y)) } : x,
    ),
    reports: [{ id: `r-${code(6)}`, thread: t.title, at: now(), status: 'Menunggu tinjauan moderator' }, ...state.reports],
  });
  emitSignal('f');
}

// ---------- Aspirasi ----------

export const supportCount = (s, a) => (a.base || 0) + (s.supports[a.id]?.length || 0);

export function aspStatus(s, a) {
  const n = supportCount(s, a);
  if (a.decided) return { key: 'decided', n };
  if (n >= ASP_AGENDA) return { key: 'agenda', n };
  if (n >= ASP_REVIEW) return { key: 'review', n };
  return { key: 'filed', n };
}

export function submitAspiration(memberId, { title, cat, text }) {
  const m = state.members.find((x) => x.id === memberId);
  if (!m) return { ok: false, reason: 'Hanya anggota yang bisa mengajukan aspirasi.' };
  const reason = lenErr(title, 8, 90, 'Judul') || lenErr(text, 20, 400, 'Uraian');
  if (reason) return { ok: false, reason };
  const a = { id: `a-${code(6)}`, title: title.trim(), cat, author: m.nick, memberId: m.id, text: text.trim(), base: 0, at: now() };
  commit({ ...state, asp: [a, ...state.asp], supports: { ...state.supports, [a.id]: [m.id] } });
  emitSignal('a');
  return { ok: true, id: a.id };
}

export function supportAspiration(memberId, aspId) {
  if (!state.members.some((m) => m.id === memberId)) return { ok: false, reason: 'Hanya anggota yang bisa mendukung.' };
  const a = state.asp.find((x) => x.id === aspId);
  if (!a) return { ok: false, reason: 'Aspirasi tidak ditemukan.' };
  if (a.decided) return { ok: false, reason: 'Aspirasi ini sudah diputuskan.' };
  const list = state.supports[aspId] || [];
  if (list.includes(memberId)) return { ok: false, reason: 'Kamu sudah mendukung usulan ini.' };
  commit({ ...state, supports: { ...state.supports, [aspId]: [...list, memberId] } });
  emitSignal('a');
  return { ok: true };
}
