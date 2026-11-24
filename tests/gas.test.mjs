// Uji integrasi mode Google Spreadsheet: store.js dijalankan terhadap google-apps-script/Code.gs asli.
// Layanan Google (SpreadsheetApp, LockService, dst.) ditiru di memori; fetch diarahkan ke doGet/doPost.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { setGasUrl, gasGet, gasPost } from '../src/lib/gas.js';
import * as S from '../src/lib/store.js';
import { ballots } from '../src/data/site.js';

// ---- tiruan Apps Script ----
class Sheet {
  constructor() { this.cells = new Map(); this.maxR = 0; this.maxC = 0; }
  cell(r, c) { return this.cells.has(`${r},${c}`) ? this.cells.get(`${r},${c}`) : ''; }
  set(r, c, v) { this.cells.set(`${r},${c}`, v); this.maxR = Math.max(this.maxR, r); this.maxC = Math.max(this.maxC, c); }
  getRange(r, c, nr = 1, nc = 1) {
    const sh = this;
    const range = {
      getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => sh.cell(r + i, c + j))),
      setValues(v) { v.forEach((row, i) => row.forEach((x, j) => sh.set(r + i, c + j, x))); return range; },
      setValue(x) { sh.set(r, c, x); return range; },
      setNumberFormat: () => range, setNumberFormats: () => range, setFontWeight: () => range, setBackground: () => range,
    };
    return range;
  }
  getLastRow() { return this.maxR; }
  getLastColumn() { return this.maxC; }
  setFrozenRows() {}
  deleteRow(r) {
    const next = new Map();
    for (const [k, v] of this.cells) {
      const [rr, cc] = k.split(',').map(Number);
      if (rr < r) next.set(k, v); else if (rr > r) next.set(`${rr - 1},${cc}`, v);
    }
    this.cells = next; this.maxR = Math.max(0, this.maxR - 1);
  }
}
const cacheUntil = new Map(); // tiruan CacheService: kunci -> waktu kedaluwarsa
const book = { sheets: new Map(), getSheetByName(n) { return this.sheets.get(n) || null; }, insertSheet(n) { const s = new Sheet(); this.sheets.set(n, s); return s; } };
const gas = vm.createContext({
  SpreadsheetApp: { getActiveSpreadsheet: () => book, flush() {} },
  PropertiesService: { getScriptProperties: () => ({ getProperty: () => null }) },
  LockService: { getScriptLock: () => ({ waitLock() {}, tryLock: () => true, hasLock: () => true, releaseLock() {} }) },
  CacheService: { getScriptCache: () => ({ get: (k) => (cacheUntil.get(k) > Date.now() ? '1' : null), put: (k, _v, sec) => cacheUntil.set(k, Date.now() + sec * 1000) }) },
  ContentService: { MimeType: { JSON: 'JSON' }, createTextOutput(s) { return { s, setMimeType() { return this; } }; } },
  Utilities: { getUuid: () => crypto.randomUUID(), formatDate: (d) => d.toISOString() },
  Logger: { log() {} },
  console: { error() {} },
});
vm.runInContext(fs.readFileSync(new URL('../google-apps-script/Code.gs', import.meta.url), 'utf8'), gas);

let failNext = null; // pesan galat untuk POST berikutnya (simulasi server menolak)
let offline = false;
globalThis.fetch = async (_u, init) => {
  if (offline) throw new TypeError('Failed to fetch');
  if (init.method === 'POST' && failNext) {
    const message = failNext;
    failNext = null;
    return { json: async () => ({ status: 'error', message, data: null }) };
  }
  const out = init.method === 'POST' ? gas.doPost({ postData: { contents: init.body } }) : gas.doGet();
  return { json: async () => JSON.parse(out.s) };
};
setGasUrl('https://script.google.com/macros/s/TEST/exec');

// Meniru satu putaran polling: GET dimulai sekarang, hasilnya diterapkan ke store.
async function poll() {
  const startedAt = performance.now();
  const r = await gasGet();
  assert.equal(r.ok, true);
  S.setRemote(r.data, startedAt);
}
const open = ballots.find((b) => b.status === 'open');
const state = () => S.getState();

test('mode GAS aktif dan data awal kosong', async () => {
  S.resetAll();
  await poll();
  assert.equal(state().remote.ready, true);
  assert.equal(S.memberTotal(state()), 0);
  assert.equal(S.tally(state(), open).total, 0);
  assert.equal(S.tally(state(), open).quorumMet, false);
  assert.equal(S.aspView(state()).length, 0);
  assert.equal(S.forumView(state()).length, 0);
});

let A, B;
test('joinMember: ID dibuat server, kartu tersimpan lokal, total anggota naik', async () => {
  const r = await S.joinMember({ nick: 'Raras', group: 'Mahasiswa atau pelajar', issues: ['data'] });
  assert.equal(r.ok, true);
  A = r.member;
  assert.match(A.id, /^M-[0-9A-F]{10}$/);
  assert.equal(S.currentMember(state()).id, A.id);
  assert.equal(S.memberTotal(state()), 1, 'langsung terhitung (optimistic)');
  await poll();
  assert.equal(S.memberTotal(state()), 1, 'tidak dihitung dua kali setelah data server tiba');
  assert.equal(state().pending.length, 0);
  assert.equal(book.getSheetByName('Anggota').cell(2, 5), 'Hak digital', 'minat isu disimpan sebagai nama, bukan ID');

  const b = await S.joinMember({ nick: 'Budi', group: 'Lainnya' });
  B = b.member;
  await poll();
  assert.equal(S.memberTotal(state()), 2);
  S.signIn(A.id);
});

test('registrasi ditolak server: tidak ada kartu dan pesan jelas', async () => {
  failNext = 'Server menolak.';
  const r = await S.joinMember({ nick: 'Gagal', group: 'Lainnya' });
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'Server menolak.');
  assert.equal(state().members.length, 2);
});

test('castVote: hasil berubah seketika, tidak dobel setelah polling, voting ganda ditolak', async () => {
  const p = S.castVote(open.id, A.id, 'lapor');
  assert.ok(p instanceof Promise, 'mode GAS mengembalikan Promise');
  assert.equal(S.tally(state(), open).counts.lapor, 1, 'tampilan langsung berubah sebelum server menjawab');
  assert.ok(state().roll[open.id][A.id], 'kode bukti langsung tersedia');
  const r = await p;
  assert.equal(r.ok, true);
  assert.equal(S.tally(state(), open).counts.lapor, 1);
  await poll();
  const t = S.tally(state(), open);
  assert.equal(t.counts.lapor, 1, 'suara server menggantikan suara tertunda, tidak dihitung dua kali');
  assert.equal(t.total, 1);
  assert.equal(t.electorate, 2);
  assert.equal(state().pending.length, 0);
  assert.equal(S.castVote(open.id, A.id, 'larang').ok, false, 'suara kedua ditolak di perangkat');
});

test('castVote ditolak server: suara dibatalkan (rollback)', async () => {
  const before = S.tally(state(), open).total;
  failNext = 'Kamu sudah memberi suara pada topik ini. Satu anggota hanya punya satu suara.';
  const p = S.castVote(open.id, B.id, 'larang');
  assert.equal(S.tally(state(), open).total, before + 1, 'sempat tampil optimistic');
  const r = await p;
  assert.equal(r.ok, false);
  assert.match(r.reason, /sudah memberi suara/);
  assert.equal(S.tally(state(), open).total, before, 'dibatalkan');
  assert.equal(state().roll[open.id]?.[B.id], undefined, 'kode bukti dibatalkan');
  assert.equal(state().pending.length, 0);
  // Setelah galat, anggota yang sama masih bisa mencoba lagi.
  assert.equal((await S.castVote(open.id, B.id, 'larang')).ok, true);
  await poll();
  assert.equal(S.tally(state(), open).counts.larang, 1);
  assert.equal(S.tally(state(), open).quorumMet, true, '2 dari 2 anggota');
});

test('aspirasi: muncul seketika, ID server menggantikan ID sementara tanpa duplikat, dukungan tidak dobel', async () => {
  const p = S.submitAspiration(A.id, { title: 'Kelas literasi data pribadi', cat: 'Hak digital', text: 'Dua jam pengenalan pengaturan privasi dan hak atas data pribadi.' });
  let items = S.aspView(state());
  assert.equal(items.length, 1);
  assert.equal(items[0].pending, true);
  assert.equal(S.supportCount(state(), items[0]), 1);
  const r = await p;
  assert.equal(r.ok, true);
  items = S.aspView(state());
  assert.equal(items.length, 1);
  assert.equal(items[0].id, r.id, 'memakai ID server');
  assert.notEqual(items[0].pending, true);
  assert.deepEqual(state().supports[r.id], [A.id], 'tanda "sudah kamu dukung" ikut pindah ke ID server');
  await poll();
  items = S.aspView(state());
  assert.equal(items.length, 1);
  assert.equal(S.supportCount(state(), items[0]), 1);

  // Anggota lain mendukung: hitungan langsung naik, tetap 2 setelah polling.
  const sp = S.supportAspiration(B.id, r.id);
  assert.equal(S.supportCount(state(), S.aspView(state())[0]), 2);
  assert.equal((await sp).ok, true);
  await poll();
  assert.equal(S.supportCount(state(), S.aspView(state())[0]), 2);
  assert.equal(S.supportAspiration(B.id, r.id).ok, false, 'dukungan ganda ditolak di perangkat');
});

test('dukungan ditolak server: hitungan dan tanda dibatalkan; "sudah mendukung" mempertahankan tanda', async () => {
  const id = S.aspView(state())[0].id;
  const C = (await S.joinMember({ nick: 'Citra', group: 'Lainnya' })).member;
  failNext = 'Server sedang sibuk.';
  const r = await S.supportAspiration(C.id, id);
  assert.equal(r.ok, false);
  assert.equal(S.supportCount(state(), S.aspView(state())[0]), 2, 'hitungan kembali');
  assert.equal((state().supports[id] || []).includes(C.id), false, 'tanda dibatalkan');

  failNext = 'Kamu sudah mendukung usulan ini.';
  assert.equal((await S.supportAspiration(C.id, id)).ok, false);
  assert.equal((state().supports[id] || []).includes(C.id), true, 'server berkata sudah: tanda tetap');
  assert.equal(S.supportCount(state(), S.aspView(state())[0]), 2, 'hitungan tidak bertambah');
  S.signIn(A.id);
});

test('forum: topik dan balasan dikelompokkan per topik, kategori terbawa, laporan hanya lokal', async () => {
  const p = S.postThread(A.id, { title: 'Apa yang paling perlu dibuka dari algoritma?', cat: 'Kerja layak platform', text: 'Alasan tertulis atas penonaktifan akun.' });
  let threads = S.forumView(state());
  assert.equal(threads.length, 1);
  assert.equal(threads[0].posts.length, 1);
  const r = await p;
  assert.equal(r.ok, true);
  assert.equal(r.id, threads[0].id, 'ID topik stabil sehingga formulir bisa membukanya');
  // Tiruan layanan Google berjalan dalam hitungan mikrodetik; jeda ini menjamin cap waktu balasan lebih baru.
  // Di Apps Script asli penulisan diserialisasi LockService dan butuh puluhan milidetik, jadi tidak terjadi.
  await new Promise((res) => setTimeout(res, 3));
  const reply = await S.postReply(B.id, r.id, 'Setuju, tarif per perjalanan juga perlu terbuka.');
  assert.equal(reply.ok, true);
  await poll();
  threads = S.forumView(state());
  assert.equal(threads.length, 1);
  assert.equal(threads[0].posts.length, 2);
  assert.equal(threads[0].cat, 'Kerja layak platform');
  assert.deepEqual(threads[0].posts.map((x) => x.author), ['Raras', 'Budi']);
  assert.equal(state().pending.length, 0);

  const before = book.getSheetByName('Forum').getLastRow();
  S.reportPost(threads[0].id, threads[0].posts[1].id);
  assert.equal(S.forumView(state())[0].posts[1].reported, true);
  assert.equal(S.forumView(state())[0].posts[0].reported, false);
  assert.equal(book.getSheetByName('Forum').getLastRow(), before, 'laporan tidak mengirim apa pun ke server');
  assert.equal(state().reports.length, 1);
  await poll();
  assert.equal(S.forumView(state())[0].posts[1].reported, true, 'tanda laporan bertahan setelah polling');
});

test('teks berawalan rumus dinetralkan di sel tetapi tampil apa adanya', async () => {
  const text = '=IMPORTDATA("http://contoh.invalid/x")';
  const r = await S.postThread(A.id, { title: 'Uji awalan rumus', cat: 'Hak digital', text });
  assert.equal(r.ok, true);
  const forum = book.getSheetByName('Forum');
  assert.equal(forum.cell(forum.getLastRow(), 5), "'" + text, 'di sel: diberi apostrof agar bukan rumus');
  await poll();
  const t = S.forumView(state()).find((x) => x.title === 'Uji awalan rumus');
  assert.equal(t.posts[0].text, text, 'di tampilan: teks asli tanpa apostrof');
});

test('polling tanpa perubahan tidak merender ulang', async () => {
  await poll();
  let calls = 0;
  const off = S.subscribe(() => calls++);
  await poll();
  await poll();
  off();
  assert.equal(calls, 0);
});

test('server tidak terjangkau: aksi gagal rapi, tidak melempar, data lama tetap', async () => {
  offline = true;
  const r = await S.joinMember({ nick: 'Offline', group: 'Lainnya' });
  assert.equal(r.ok, false);
  assert.match(r.reason, /Tidak bisa terhubung/);
  const g = await gasGet();
  assert.equal(g.ok, false);
  S.setRemoteError();
  assert.equal(state().remote.error, true);
  assert.equal(state().remote.ready, true, 'data terakhir tetap tersedia');
  assert.equal(S.memberTotal(state()), 3);
  offline = false;
  await poll();
  assert.equal(state().remote.error, false, 'pulih otomatis saat koneksi kembali');
});

test('hak hapus: baris anggota dihapus di server dan nama dianonimkan', async () => {
  const r = await S.deleteMember(B.id);
  assert.equal(r.ok, true);
  assert.equal(state().members.some((m) => m.id === B.id), false);
  await poll();
  assert.equal(S.memberTotal(state()), 2);
  assert.ok(S.forumView(state())[0].posts.some((p) => p.author === 'Anggota terhapus'));
  // Jejak suara tetap ada sehingga hasil tidak berubah.
  assert.equal(S.tally(state(), open).total, 2);
});

test('hak hapus gagal: kartu tetap ada dan pesan kembali', async () => {
  failNext = 'Server sedang sibuk.';
  const r = await S.deleteMember(A.id);
  assert.equal(r.ok, false);
  assert.equal(state().members.some((m) => m.id === A.id), true);
});

const rowsOf = (sheet, id) => { const sh = book.getSheetByName(sheet); let n = 0; for (let r = 2; r <= sh.getLastRow(); r++) if (String(sh.cell(r, 2)).toUpperCase() === id) n++; return n; };
const postsCount = () => S.forumView(state()).reduce((n, t) => n + t.posts.length, 0);

test('server hanya menerima topik dan opsi voting yang dikenal', async () => {
  const bad1 = await gasPost('submit_vote', { memberId: A.id, topic: 'topik-asing', choice: 'larang' });
  assert.equal(bad1.ok, false);
  assert.match(bad1.reason, /Topik voting tidak dikenal/);
  const bad2 = await gasPost('submit_vote', { memberId: A.id, topic: open.id, choice: 'bukan-opsi' });
  assert.equal(bad2.ok, false);
  assert.match(bad2.reason, /Pilihan tidak valid/);
});

test('anggota demo: tertandai, lalu semua jejaknya dihapus menyeluruh saat selesai', async () => {
  S.signIn(A.id);
  await poll();
  const base = { votes: S.tally(state(), open).total, members: S.memberTotal(state()), posts: postsCount(), asp: S.aspView(state()).length };
  const other = S.aspView(state()).find((a) => !a.pending);
  const supportBefore = S.supportCount(state(), other);

  const d = await S.demoMember();
  assert.equal(d.demo, true);
  assert.equal(d.group, 'Anggota demo');
  const anggota = book.getSheetByName('Anggota');
  assert.equal(anggota.cell(anggota.getLastRow(), 4), 'Anggota demo', 'server menandai baris sebagai demo');

  assert.equal((await S.castVote(open.id, d.id, 'bebas')).ok, true);
  assert.equal((await S.supportAspiration(d.id, other.id)).ok, true);
  const mine = await S.submitAspiration(d.id, { title: 'Aspirasi dari anggota demo', cat: 'Lainnya', text: 'Uraian aspirasi demo yang cukup panjang.' });
  assert.equal(mine.ok, true);
  assert.equal((await S.postThread(d.id, { title: 'Topik dari anggota demo', cat: 'Hak digital', text: 'Isi topik dari anggota demo ini.' })).ok, true);
  await poll();
  assert.equal(S.tally(state(), open).total, base.votes + 1, 'suara demo terhitung selama sesi');
  assert.equal(S.supportCount(state(), S.aspView(state()).find((a) => a.id === other.id)), supportBefore + 1);
  assert.equal(S.aspView(state()).length, base.asp + 1);
  assert.equal(postsCount(), base.posts + 1);
  assert.equal(S.isDemo(S.currentMember(state())), true);

  const r = await S.deleteMember(d.id); // "Selesai dan hapus data demo"
  assert.equal(r.ok, true);
  await poll();
  const dId = d.id.toUpperCase();
  assert.equal(S.tally(state(), open).total, base.votes, 'suara demo hilang (tidak ada jejak)');
  assert.equal(S.supportCount(state(), S.aspView(state()).find((a) => a.id === other.id)), supportBefore, 'dukungan demo dicabut');
  assert.equal(S.aspView(state()).some((a) => a.id === mine.id), false, 'aspirasi demo hilang');
  assert.equal(postsCount(), base.posts, 'komentar demo hilang');
  assert.equal(S.memberTotal(state()), base.members, 'anggota demo tidak terhitung lagi');
  for (const tab of ['Anggota', 'Voting', 'Aspirasi', 'Forum']) assert.equal(rowsOf(tab, dId), 0, `tab ${tab} bersih dari jejak demo`);
  assert.equal(S.currentMember(state()), null);
  assert.equal(state().roll[open.id]?.[d.id], undefined, 'catatan suara di perangkat ikut dibuang');
  assert.ok(!JSON.stringify([...book.getSheetByName('Aspirasi').cells]).includes(dId), 'ID demo tidak tersisa di kolom Pendukung');
});

test('demo berulang tidak menumpuk suara: setiap demo hilang saat selesai', async () => {
  await poll();
  const before = S.tally(state(), open).total;
  for (let i = 0; i < 3; i++) {
    const d = await S.demoMember();
    assert.equal((await S.castVote(open.id, d.id, 'larang')).ok, true);
    assert.equal((await S.deleteMember(d.id)).ok, true);
  }
  await poll();
  assert.equal(S.tally(state(), open).total, before, 'tiga putaran demo tidak mengubah hasil');
});

test('anggota terdaftar tidak bisa dihapus menyeluruh (suaranya tetap sebagai jejak anonim)', async () => {
  const reg = (await S.joinMember({ nick: 'Terdaftar', group: 'Lainnya' })).member;
  assert.equal(reg.demo, undefined);
  await S.castVote(open.id, reg.id, 'bebas');
  await poll();
  const total = S.tally(state(), open).total;
  assert.equal((await S.deleteMember(reg.id)).ok, true);
  await poll();
  assert.equal(S.tally(state(), open).total, total, 'suara anggota terdaftar tetap setelah hak hapus');
  assert.equal(rowsOf('Anggota', reg.id.toUpperCase()), 0);
  S.signIn(A.id);
});

test('kedaluwarsa di server: demo lama dibersihkan, anggota terdaftar tidak; klien mendapat pesan yang jelas', async () => {
  const d = await S.demoMember();
  await S.castVote(open.id, d.id, 'larang');
  await poll();
  const total = S.tally(state(), open).total;
  vm.runInContext('CONFIG.DEMO_TTL_MIN = 0;', gas); // paksa semua demo dianggap kedaluwarsa
  cacheUntil.clear();
  await new Promise((r) => setTimeout(r, 5));
  await poll(); // GET memicu pembersihan
  vm.runInContext('CONFIG.DEMO_TTL_MIN = 30;', gas);
  assert.equal(rowsOf('Anggota', d.id.toUpperCase()), 0, 'anggota demo dibersihkan server');
  assert.equal(rowsOf('Voting', d.id.toUpperCase()), 0, 'suaranya ikut hilang');
  assert.equal(rowsOf('Anggota', A.id.toUpperCase()), 1, 'anggota terdaftar tidak tersentuh');
  assert.equal(S.tally(state(), open).total, total - 1);
  // Kartu demo masih ada di perangkat sampai aksi berikutnya, yang gagal dengan pesan jelas.
  const asp = S.aspView(state()).find((a) => !a.pending);
  const res = await S.supportAspiration(d.id, asp.id);
  assert.equal(res.ok, false);
  assert.match(res.reason, /Sesi demo sudah berakhir/);
  assert.equal(state().members.some((m) => m.id === d.id), false, 'kartu demo dibuang dari perangkat');
  S.signIn(A.id);
});

test('kartu demo yang melewati batas waktu dibuang dari perangkat saat polling', async () => {
  const d = await S.demoMember();
  const real = Date.now;
  Date.now = () => real() + 31 * 60000;
  try { await poll(); } finally { Date.now = real; }
  assert.equal(state().members.some((m) => m.id === d.id), false);
  await S.deleteMember(d.id); // baris demo di server dihapus menyeluruh
  S.signIn(A.id);
});

test('tanpa URL, store kembali ke mode lokal sinkron', async () => {
  setGasUrl('');
  S.resetAll();
  const m = S.register({ nick: 'Lokal', group: 'Lainnya' });
  assert.match(m.id, /^SMP-/);
  const r = S.castVote(open.id, m.id, 'lapor');
  assert.equal(r.ok, true, 'hasil sinkron, bukan Promise');
  assert.ok(!(r instanceof Promise));
  assert.equal(S.tally(state(), open).total, 1);
  const dm = S.demoMember();
  assert.equal(dm.demo, true, 'di mode lokal demo hanya label, tanpa server');
});
