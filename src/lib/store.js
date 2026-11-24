// Penyimpanan simulasi. Ada dua mode, dipilih oleh VITE_GAS_WEBAPP_URL:
//  - Tanpa URL (bawaan): satu objek state di localStorage browser, tanpa server. Fungsi aksi sinkron.
//  - Dengan URL: data bersama disimpan di Google Spreadsheet lewat Apps Script (src/lib/gas.js).
//    Aksi langsung mengubah tampilan (optimistic) lalu dikirim di latar belakang dan mengembalikan Promise.
//    Data dari server dibaca berkala oleh src/hooks/useRealtimeData.js.
// Aturan inti (satu anggota satu suara, ambang dukungan) diuji di tests/logic.test.mjs.
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
  issues as issueList,
  DEMO_GROUP,
  DEMO_TTL_MIN,
} from '../data/site.js';
import { emitSignal } from './signal.js';
import { gasEnabled, gasPost } from './gas.js';

const hasWindow = typeof window !== 'undefined';
const clone = (x) => JSON.parse(JSON.stringify(x));
const now = () => new Date().toISOString();
const REMOTE_KEY = `${STORAGE_KEY}.remote`;

const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function code(n = 8) {
  const b = new Uint8Array(n);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(b);
  else for (let i = 0; i < n; i++) b[i] = Math.floor(Math.random() * 256);
  return Array.from(b, (x) => ALPHA[x % ALPHA.length]).join('');
}

// Pengenal stabil untuk topik dan unggahan dari server (server tidak memberi ID untuk komentar forum).
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

// ---------- Data dari server (hanya mode GAS) ----------

const EMPTY_REMOTE = { ready: false, stale: false, error: false, sig: '', totalMembers: 0, voting: {}, aspirations: [], forum: [] };

function buildRemote(body, flags = {}) {
  const voting = {};
  for (const v of body.voting) voting[v.topic] = { total: v.total, options: v.options || {} };
  return {
    ready: true,
    stale: false,
    error: false,
    ...flags,
    sig: JSON.stringify(body),
    totalMembers: body.totalMembers,
    voting,
    aspirations: body.aspirations,
    forum: body.forum,
  };
}

// Data terakhir dari server disimpan agar halaman langsung berisi saat dibuka ulang, lalu diperbarui di latar belakang.
function cachedRemote() {
  if (!hasWindow || !gasEnabled()) return EMPTY_REMOTE;
  try {
    const raw = window.localStorage.getItem(REMOTE_KEY);
    return raw ? buildRemote(JSON.parse(raw), { stale: true }) : EMPTY_REMOTE;
  } catch {
    return EMPTY_REMOTE;
  }
}

function fresh() {
  return {
    v: 1,
    seq: 0,
    members: [], // [{ id, nick, group, issues, role, joined }]
    currentId: null,
    box: {}, // kotak suara (mode lokal): { [ballotId]: [{ option, at }] }, tanpa identitas
    roll: {}, // daftar pemilih: { [ballotId]: { [memberId]: kodeBukti } }, tanpa pilihan
    forum: forumSeed.map((t) => ({
      ...clone(t),
      posts: t.posts.map((p) => ({ ...p, memberId: null, sim: true })),
    })),
    reports: [],
    hidden: {}, // unggahan forum yang dilaporkan di perangkat ini (mode GAS): { [postId]: true }
    asp: aspSeed.map((a) => ({ ...clone(a), memberId: null, sim: true })),
    supports: {}, // { [aspId]: [memberId] }, dukungan dari perangkat ini
    remote: EMPTY_REMOTE, // tidak disimpan ke localStorage kecuali sebagai cache terpisah
    pending: [], // aksi yang sedang dikirim ke server (tidak disimpan)
  };
}

let storageOk = true;
export const storageAvailable = () => storageOk;

const persistable = ({ remote, pending, ...rest }) => rest;

function load() {
  if (!hasWindow) return fresh();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...fresh(), remote: cachedRemote() };
    const saved = JSON.parse(raw);
    if (!saved || saved.v !== 1) return { ...fresh(), remote: cachedRemote() };
    // Buang dukungan sementara yang tertinggal bila halaman ditutup saat pengiriman.
    const supports = Object.fromEntries(Object.entries(saved.supports || {}).filter(([id]) => !id.startsWith('a-tmp-')));
    return { ...fresh(), ...saved, supports, pending: [], remote: cachedRemote() };
  } catch {
    storageOk = false;
    return fresh();
  }
}

let state = load();
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

function commit(next, { save = true } = {}) {
  state = next;
  if (save && hasWindow) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable(state)));
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
      state = { ...load(), remote: state.remote, pending: state.pending };
      emit();
    }
  });
}

export const currentMember = (s) => s.members.find((m) => m.id === s.currentId) || null;

// Anggota demo (mode Google Spreadsheet) bersifat sementara: dihapus menyeluruh di server saat selesai atau
// setelah DEMO_TTL_MIN menit. Di mode lokal penanda ini hanya label.
export const isDemo = (m) => Boolean(m?.demo);

// Buang anggota dari perangkat beserta catatan suara dan dukungannya di perangkat ini.
function removeMembersLocal(ids) {
  const gone = new Set(ids);
  const roll = Object.fromEntries(
    Object.entries(state.roll).map(([b, v]) => [b, Object.fromEntries(Object.entries(v).filter(([m]) => !gone.has(m)))]),
  );
  const supports = Object.fromEntries(Object.entries(state.supports).map(([a, v]) => [a, v.filter((m) => !gone.has(m))]));
  commit({
    ...state,
    members: state.members.filter((m) => !gone.has(m.id)),
    currentId: gone.has(state.currentId) ? null : state.currentId,
    roll,
    supports,
  });
}

// Kartu demo yang melewati batas waktu dibuang dari perangkat (server membersihkan datanya sendiri).
function pruneDemos() {
  if (!gasEnabled()) return;
  const cutoff = Date.now() - DEMO_TTL_MIN * 60000;
  const gone = state.members.filter((m) => m.demo && new Date(m.joined).getTime() < cutoff).map((m) => m.id);
  if (gone.length) removeMembersLocal(gone);
}

// Bila server tidak lagi mengenal anggota demo (kedaluwarsa), kartunya dibuang dan pesannya dijelaskan.
function failReason(memberId, reason) {
  const m = state.members.find((x) => x.id === memberId);
  if (m?.demo && /MemberID tidak ditemukan|Hanya anggota terdaftar/i.test(reason)) {
    removeMembersLocal([memberId]);
    return `Sesi demo sudah berakhir (dihapus setelah selesai atau ${DEMO_TTL_MIN} menit). Mulai demo baru atau daftar sebagai anggota.`;
  }
  return reason;
}

// ponytail: reset hanya untuk perangkat ini; tidak ada reset jarak jauh karena tidak ada server.
export function resetAll() {
  if (hasWindow) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      storageOk = false;
    }
  }
  state = { ...fresh(), remote: state.remote, pending: state.pending };
  emit();
}

// ---------- Aksi yang sedang dikirim (optimistic) ----------

let opSeq = 0;
const requestRefresh = () => {
  if (hasWindow) window.dispatchEvent(new Event('gas:refresh'));
};
function addOp(op) {
  const o = { id: ++opSeq, status: 'sending', ...op };
  commit({ ...state, pending: [...state.pending, o] }, { save: false });
  return o;
}
const patchOp = (id, patch) =>
  commit({ ...state, pending: state.pending.map((o) => (o.id === id ? { ...o, ...patch } : o)) }, { save: false });
function dropOp(id) {
  commit({ ...state, pending: state.pending.filter((o) => o.id !== id) }, { save: false });
  requestRefresh(); // data yang dibuang selama aksi berjalan perlu diambil ulang
}
// Server sudah menerima. Aksi tetap ditampilkan sampai data yang diminta setelah ini tiba (setRemote).
function confirmOp(id, patch = {}) {
  patchOp(id, { status: 'sent', confirmedAt: performance.now(), ...patch });
  requestRefresh();
}

// Dipanggil oleh useRealtimeData. requestedAt = waktu permintaan GET dimulai.
// Data server hanya diterapkan bila setiap aksi tertunda sudah dikonfirmasi sebelum GET dimulai. Jika tidak,
// data itu mungkin sudah memuat tulisan yang masih ditampilkan sebagai aksi tertunda dan akan terhitung dua kali.
// Data semacam itu dibuang; polling berikutnya (diminta saat aksi selesai) membawa data yang pasti sudah memuatnya.
export function setRemote(data, requestedAt) {
  pruneDemos(); // dipanggil tiap polling, jadi kartu demo yang kedaluwarsa hilang tanpa menunggu aksi
  if (state.pending.some((op) => op.status === 'sending' || op.confirmedAt >= requestedAt)) return;
  const body = {
    totalMembers: Number(data?.totalMembers) || 0,
    voting: Array.isArray(data?.voting) ? data.voting : [],
    aspirations: Array.isArray(data?.aspirations) ? data.aspirations : [],
    forum: Array.isArray(data?.forum) ? data.forum : [],
  };
  const r = state.remote;
  const unchanged = r.ready && !r.stale && !r.error && r.sig === JSON.stringify(body) && state.pending.length === 0;
  if (unchanged) return; // tidak ada yang berubah: tidak perlu render ulang
  commit({ ...state, remote: buildRemote(body), pending: [] }, { save: false });
  if (hasWindow) {
    try {
      window.localStorage.setItem(REMOTE_KEY, JSON.stringify(body));
    } catch {
      /* cache bersifat opsional */
    }
  }
}

export function setRemoteError() {
  if (!state.remote.error) commit({ ...state, remote: { ...state.remote, error: true } }, { save: false });
}

// ---------- Tampilan gabungan (data server + aksi tertunda, atau data lokal) ----------

export function memberTotal(s) {
  if (!gasEnabled()) return Math.max(MEMBER_BASE, s.members.length);
  const added = s.pending.filter((o) => o.type === 'member').length;
  return (s.remote.ready ? s.remote.totalMembers : s.members.length) + added;
}

export function aspView(s) {
  if (!gasEnabled()) return s.asp;
  const extra = {};
  for (const o of s.pending) if (o.type === 'support') extra[o.aspId] = (extra[o.aspId] || 0) + 1;
  const items = s.remote.aspirations.map((a) => ({
    id: a.id,
    title: a.title,
    cat: a.category,
    author: a.name,
    text: a.text,
    at: a.timestamp,
    memberId: null,
    count: (Number(a.support) || 0) + (extra[a.id] || 0),
  }));
  const known = new Set(items.map((a) => a.id));
  for (const o of s.pending) {
    if (o.type !== 'aspiration') continue;
    const id = o.serverId || o.tmpId;
    if (known.has(id)) continue;
    items.unshift({ id, title: o.title, cat: o.cat, author: o.author, text: o.text, at: o.at, memberId: null, count: 1 + (extra[id] || 0), pending: !o.serverId });
  }
  return items;
}

export function forumView(s) {
  if (!gasEnabled()) return s.forum;
  const threads = new Map();
  const add = (title, cat, post) => {
    const id = `t-${hash(title)}`;
    let t = threads.get(id);
    if (!t) {
      t = { id, title, cat, posts: [] };
      threads.set(id, t);
    }
    t.posts.push(post);
  };
  // Server mengirim komentar terbaru lebih dulu; tampilan membutuhkan urutan lama ke baru.
  for (const c of [...s.remote.forum].reverse()) {
    const pid = `p-${hash(`${c.timestamp}|${c.name}|${c.comment}`)}`;
    add(c.topic, c.category || 'Lainnya', { id: pid, author: c.name, at: c.timestamp, text: c.comment, reported: Boolean(s.hidden[pid]) });
  }
  for (const o of s.pending) {
    if (o.type === 'comment') add(o.topic, o.cat, { id: `p-pending-${o.id}`, author: o.author, at: o.at, text: o.text, pending: true });
  }
  return [...threads.values()];
}

// ---------- Keanggotaan ----------

// Mode lokal. Mode GAS memakai joinMember (ID anggota dibuat server).
export function register({ nick, group, issues = [], role = 'Anggota', demo = false }) {
  const seq = state.seq + 1;
  const member = {
    id: `SMP-${String(MEMBER_BASE + seq).padStart(4, '0')}`,
    nick: nick.trim(),
    group,
    issues,
    role,
    joined: now(),
    ...(demo ? { demo: true } : {}),
  };
  commit({ ...state, seq, members: [...state.members, member], currentId: member.id });
  return member;
}

const issueName = (id) => issueList.find((i) => i.id === id)?.short || id;

// Mode lokal: sinkron. Mode GAS: Promise yang selesai setelah server memberi MemberID.
export function joinMember({ nick, group, issues = [], role = 'Anggota', demo = false }) {
  if (!gasEnabled()) return { ok: true, member: register({ nick, group, issues, role, demo }) };
  return gasPost('register_member', { nickname: nick.trim(), group, issues: issues.map(issueName) }).then((r) => {
    if (!r.ok) return { ok: false, reason: r.reason };
    const member = { id: r.data.memberId, nick: r.data.nickname, group, issues, role, joined: now(), ...(demo ? { demo: true } : {}) };
    commit({ ...state, seq: state.seq + 1, members: [...state.members, member], currentId: member.id });
    confirmOp(addOp({ type: 'member' }).id);
    return { ok: true, member };
  });
}

// Mode lokal mengembalikan anggota, mode GAS mengembalikan Promise anggota (atau null bila gagal).
export function demoMember() {
  const n = (gasEnabled() ? memberTotal(state) : state.seq) + 1;
  const data = { nick: `Anggota Demo ${n}`, group: DEMO_GROUP, issues: [], role: 'Anggota', demo: true };
  if (!gasEnabled()) return register(data);
  return joinMember(data).then((r) => (r.ok ? r.member : null));
}

export const signIn = (id) => {
  if (state.members.some((m) => m.id === id)) commit({ ...state, currentId: id });
};
export const signOut = () => commit({ ...state, currentId: null });

// Hak hapus: identitas dihapus dan tulisan anggota dianonimkan. Jejak "sudah memilih" tetap ada
// (tanpa nama) agar satu orang tidak bisa memilih dua kali.
export function deleteMember(id) {
  const anon = 'Anggota terhapus';
  const removeLocal = () =>
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
  if (!gasEnabled()) return removeLocal();
  return gasPost('delete_member', { memberId: id }).then((r) => {
    // "Anggota tidak ditemukan" berarti server sudah tidak menyimpannya: aman dihapus dari perangkat.
    if (!r.ok && !/tidak ditemukan/i.test(r.reason)) return { ok: false, reason: r.reason };
    // Anggota demo dihapus menyeluruh di server, jadi catatan suara dan dukungannya di perangkat ikut dibuang.
    if (isDemo(state.members.find((m) => m.id === id))) removeMembersLocal([id]);
    else removeLocal();
    requestRefresh();
    return { ok: true };
  });
}

// ---------- Voting ----------

export function tally(s, ballot) {
  const counts = { ...ballot.seed };
  if (gasEnabled()) {
    const remote = s.remote.voting[ballot.id]?.options || {};
    for (const o of ballot.options) counts[o.id] = (counts[o.id] || 0) + (remote[o.id] || 0);
    for (const op of s.pending) {
      if (op.type === 'vote' && op.ballotId === ballot.id && op.option in counts) counts[op.option] += 1;
    }
  } else {
    for (const v of s.box[ballot.id] || []) counts[v.option] = (counts[v.option] || 0) + 1;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const electorate = gasEnabled() ? Math.max(memberTotal(s), total) : Math.max(MEMBER_BASE, s.members.length);
  const needed = Math.max(1, Math.ceil(electorate * QUORUM));
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const leader = sorted.length && (sorted.length === 1 || sorted[0][1] > sorted[1][1]) ? sorted[0][0] : null;
  return {
    counts,
    total,
    electorate,
    needed,
    quorumMet: total >= needed,
    missing: Math.max(0, needed - total),
    leader,
    turnout: electorate ? total / electorate : 0,
  };
}

// Mode lokal: sinkron. Mode GAS: tampilan langsung berubah, hasilnya berupa Promise.
export function castVote(ballotId, memberId, optionId) {
  const ballot = ballots.find((b) => b.id === ballotId);
  if (!ballot) return { ok: false, reason: 'Pemungutan suara tidak ditemukan.' };
  if (ballot.status !== 'open') return { ok: false, reason: 'Pemungutan suara ini sudah ditutup.' };
  if (!ballot.options.some((o) => o.id === optionId)) return { ok: false, reason: 'Opsi tidak dikenal. Pilih salah satu opsi yang tersedia.' };
  if (!state.members.some((m) => m.id === memberId)) return { ok: false, reason: 'Hanya anggota yang bisa memberi suara. Daftar atau coba sebagai anggota demo.' };
  if (state.roll[ballotId]?.[memberId]) return { ok: false, reason: 'Kamu sudah memberi suara pada Rembuk ini. Satu anggota hanya punya satu suara.' };
  const receipt = `V-${code(8)}`;
  const wasMet = tally(state, ballot).quorumMet;
  const rollWith = (r) => ({ ...r, [ballotId]: { ...(r[ballotId] || {}), [memberId]: receipt } });

  if (!gasEnabled()) {
    commit({
      ...state,
      box: { ...state.box, [ballotId]: [...(state.box[ballotId] || []), { option: optionId, at: now() }] },
      roll: rollWith(state.roll),
    });
    // decided = suara ini yang melengkapi kuorum: peta menyalakan stasiun "Keputusan ditetapkan".
    emitSignal('s', { decided: !wasMet && tally(state, ballot).quorumMet });
    return { ok: true, receipt };
  }

  const op = addOp({ type: 'vote', ballotId, option: optionId });
  commit({ ...state, roll: rollWith(state.roll) });
  emitSignal('s', { decided: !wasMet && tally(state, ballot).quorumMet });
  return gasPost('submit_vote', { memberId, topic: ballotId, choice: optionId }).then((r) => {
    if (r.ok) {
      confirmOp(op.id);
      return { ok: true, receipt };
    }
    dropOp(op.id);
    const { [memberId]: _gone, ...rest } = state.roll[ballotId] || {};
    commit({ ...state, roll: { ...state.roll, [ballotId]: rest } });
    return { ok: false, reason: failReason(memberId, r.reason) };
  });
}

// ---------- Forum ----------

const lenErr = (text, min, max, what) => {
  const n = text.trim().length;
  if (n < min) return `${what} terlalu pendek. Tulis minimal ${min} karakter.`;
  if (n > max) return `${what} terlalu panjang. Batasnya ${max} karakter.`;
  return '';
};

// Mengirim satu komentar forum; topik baru dan balasan sama-sama satu komentar pada sebuah topik.
function sendComment(m, { topic, cat, text }) {
  const op = addOp({ type: 'comment', topic, cat, text, author: m.nick, at: now() });
  emitSignal('f');
  return gasPost('submit_comment', { memberId: m.id, topic, comment: text, category: cat }).then((r) => {
    if (r.ok) {
      confirmOp(op.id);
      return { ok: true, id: `t-${hash(topic)}` };
    }
    dropOp(op.id);
    return { ok: false, reason: failReason(m.id, r.reason) };
  });
}

export function postThread(memberId, { title, cat, text }) {
  const m = state.members.find((x) => x.id === memberId);
  if (!m) return { ok: false, reason: 'Hanya anggota yang bisa membuka topik.' };
  const reason = lenErr(title, 8, 90, 'Judul') || lenErr(text, 10, 600, 'Isi topik');
  if (reason) return { ok: false, reason };
  if (gasEnabled()) return sendComment(m, { topic: title.trim(), cat, text: text.trim() });
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
  if (gasEnabled()) {
    const t = forumView(state).find((x) => x.id === threadId);
    if (!t) return { ok: false, reason: 'Topik tidak ditemukan.' };
    return sendComment(m, { topic: t.title, cat: t.cat, text: text.trim() });
  }
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

// Laporan hanya berlaku di perangkat ini (Apps Script tidak punya tab moderasi).
export function reportPost(threadId, postId) {
  const t = forumView(state).find((x) => x.id === threadId);
  const p = t?.posts.find((x) => x.id === postId);
  if (!p || p.reported) return;
  const report = { id: `r-${code(6)}`, thread: t.title, at: now(), status: 'Menunggu tinjauan moderator' };
  if (gasEnabled()) {
    commit({ ...state, hidden: { ...state.hidden, [postId]: true }, reports: [report, ...state.reports] });
  } else {
    commit({
      ...state,
      forum: state.forum.map((x) =>
        x.id === threadId ? { ...x, posts: x.posts.map((y) => (y.id === postId ? { ...y, reported: true } : y)) } : x,
      ),
      reports: [report, ...state.reports],
    });
  }
  emitSignal('f');
}

// ---------- Aspirasi ----------

export const supportCount = (s, a) => a.count ?? (a.base || 0) + (s.supports[a.id]?.length || 0);

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

  if (!gasEnabled()) {
    const a = { id: `a-${code(6)}`, title: title.trim(), cat, author: m.nick, memberId: m.id, text: text.trim(), base: 0, at: now() };
    commit({ ...state, asp: [a, ...state.asp], supports: { ...state.supports, [a.id]: [m.id] } });
    emitSignal('a');
    return { ok: true, id: a.id };
  }

  const tmpId = `a-tmp-${code(6)}`;
  const op = addOp({ type: 'aspiration', tmpId, title: title.trim(), cat, text: text.trim(), author: m.nick, at: now() });
  commit({ ...state, supports: { ...state.supports, [tmpId]: [m.id] } });
  emitSignal('a');
  return gasPost('submit_aspiration', { memberId: m.id, category: cat, title: title.trim(), text: text.trim() }).then((r) => {
    const { [tmpId]: mine, ...rest } = state.supports;
    if (!r.ok) {
      dropOp(op.id);
      commit({ ...state, supports: rest });
      return { ok: false, reason: failReason(m.id, r.reason) };
    }
    const id = r.data.aspirationId;
    commit({ ...state, supports: { ...rest, [id]: mine || [m.id] } });
    confirmOp(op.id, { serverId: id });
    return { ok: true, id };
  });
}

export function supportAspiration(memberId, aspId) {
  if (!state.members.some((m) => m.id === memberId)) return { ok: false, reason: 'Hanya anggota yang bisa mendukung.' };
  const a = aspView(state).find((x) => x.id === aspId);
  if (!a) return { ok: false, reason: 'Aspirasi tidak ditemukan.' };
  if (a.decided) return { ok: false, reason: 'Aspirasi ini sudah diputuskan.' };
  if (a.pending) return { ok: false, reason: 'Aspirasi ini masih dikirim. Coba lagi sebentar lagi.' };
  const list = state.supports[aspId] || [];
  if (list.includes(memberId)) return { ok: false, reason: 'Kamu sudah mendukung usulan ini.' };
  const withMine = { ...state.supports, [aspId]: [...list, memberId] };

  if (!gasEnabled()) {
    commit({ ...state, supports: withMine });
    emitSignal('a');
    return { ok: true };
  }

  const op = addOp({ type: 'support', aspId });
  commit({ ...state, supports: withMine });
  emitSignal('a');
  return gasPost('support_aspiration', { memberId, aspirationId: aspId }).then((r) => {
    if (r.ok) {
      confirmOp(op.id);
      return { ok: true };
    }
    dropOp(op.id);
    // Server berkata sudah pernah mendukung: tanda di perangkat tetap, hanya tambahan hitungan dibatalkan.
    if (!/sudah mendukung/i.test(r.reason)) {
      commit({ ...state, supports: { ...state.supports, [aspId]: (state.supports[aspId] || []).filter((x) => x !== memberId) } });
    }
    return { ok: false, reason: failReason(memberId, r.reason) };
  });
}

// Kartu demo yang sudah melewati batas waktu saat halaman dibuka tidak ditampilkan lagi.
pruneDemos();
