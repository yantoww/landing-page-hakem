// Balapan antara polling dan konfirmasi aksi: hitungan tidak boleh dobel dan tidak boleh tertahan.
// Jaringan ditiru dengan permintaan yang diproses dan dijawab satu per satu sesuai urutan yang diatur uji.
import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = new EventTarget();
globalThis.document = Object.assign(new EventTarget(), { hidden: false });
const { setGasUrl } = await import('../src/lib/gas.js');
const S = await import('../src/lib/store.js');
const { startRealtime, POLL_MS } = await import('../src/hooks/useRealtimeData.js');
setGasUrl('https://script.google.com/macros/s/TEST/exec');

// ---- server mini: satu aspirasi dengan 1 dukungan, satu anggota (diri sendiri) ----
const server = { members: 1, support: 1, nextId: 1 };
const snapshot = () => ({
  totalMembers: server.members,
  voting: [],
  aspirations: [{ id: 'A-1', timestamp: '2026-11-22T10:00:00+07:00', name: 'Raras', category: 'Hak digital', title: 'Kelas literasi data pribadi', text: 'Dua jam pengenalan pengaturan privasi.', support: server.support }],
  forum: [],
});

// Setiap fetch menunggu: handle.process() menjalankan efek di server, handle.deliver() menjawab klien.
const queue = [];
globalThis.fetch = (_u, init) =>
  new Promise((resolve) => {
    const h = { init, out: null, process() { this.out = this.run(); }, deliver() { resolve({ json: async () => this.out }); } };
    h.run = () => {
      if (init.method === 'POST') {
        const b = JSON.parse(init.body);
        if (b.action === 'register_member') { server.members++; return { status: 'success', message: 'ok', data: { memberId: `M-${server.nextId++}`, nickname: b.nickname } }; }
        if (b.action === 'support_aspiration') { server.support++; return { status: 'success', message: 'ok', data: { support: server.support } }; }
      }
      return { status: 'success', message: 'ok', data: snapshot() };
    };
    queue.push(h);
  });
const tick = () => new Promise((r) => setTimeout(r, 5));
const take = (pred) => {
  const i = queue.findIndex(pred);
  assert.ok(i >= 0, 'permintaan yang diharapkan tidak ada');
  return queue.splice(i, 1)[0];
};
const isGet = (h) => h.init.method === 'GET';
const isPost = (action) => (h) => h.init.method === 'POST' && JSON.parse(h.init.body).action === action;
const count = () => S.supportCount(S.getState(), S.aspView(S.getState())[0]);

let stop;
test('siapkan: data awal dari polling pertama', async () => {
  stop = startRealtime();
  await tick();
  const g = take(isGet);
  g.process();
  g.deliver();
  await tick();
  assert.equal(S.getState().remote.ready, true);
  assert.equal(count(), 1);
});

test('aksi dikonfirmasi saat polling lain sedang berjalan: hitungan tidak dobel dan tidak tertahan', async () => {
  // Anggota yang akan mendukung (didaftarkan lewat jalur server palsu).
  const joining = S.joinMember({ nick: 'Budi', group: 'Lainnya' });
  await tick();
  const reg = take(isPost('register_member'));
  reg.process();
  reg.deliver();
  const { member } = await joining;
  await tick();
  // Polling-polling yang dipicu pendaftaran dijawab dulu agar keadaan bersih.
  while (queue.length) { const h = queue.shift(); h.process(); h.deliver(); await tick(); }
  assert.equal(S.getState().pending.length, 0);

  const p = S.supportAspiration(member.id, 'A-1');
  assert.equal(count(), 2, 'optimistic: langsung 2');
  await tick();
  // Polling dimulai SEBELUM dukungan dikonfirmasi ke klien.
  window.dispatchEvent(new Event('online'));
  await tick();
  const post = take(isPost('support_aspiration'));
  const get1 = take(isGet);
  post.process(); // server menulis dukungan lebih dulu...
  get1.process(); // ...lalu GET membaca (sudah memuat dukungan baru)
  get1.deliver(); // jawaban GET tiba lebih dulu di klien
  await tick();
  assert.equal(count(), 2, 'GET yang sudah memuat dukungan tiba saat aksi masih terkirim: tidak boleh dihitung dua kali');
  post.deliver(); // lalu konfirmasi aksi tiba
  assert.equal((await p).ok, true);
  await tick();
  // Pemulihan: semua permintaan lanjutan dijawab.
  for (let i = 0; i < 5 && queue.length; i++) { const h = queue.shift(); h.process(); h.deliver(); await tick(); }
  assert.equal(count(), 2, 'tetap 2 setelah semua polling selesai');
  assert.equal(S.getState().pending.length, 0, 'aksi tertunda sudah dibersihkan');
});

test('GET yang dimulai sebelum konfirmasi tetapi tiba sesudahnya juga tidak menghasilkan dobel', async () => {
  const C = (await (async () => { const j = S.joinMember({ nick: 'Citra', group: 'Lainnya' }); await tick(); const r = take(isPost('register_member')); r.process(); r.deliver(); return j; })()).member;
  while (queue.length) { const h = queue.shift(); h.process(); h.deliver(); await tick(); }
  const before = count();
  const p = S.supportAspiration(C.id, 'A-1');
  await tick();
  window.dispatchEvent(new Event('online'));
  await tick();
  const post = take(isPost('support_aspiration'));
  const get1 = take(isGet);
  post.process();
  post.deliver(); // konfirmasi tiba dulu
  assert.equal((await p).ok, true);
  get1.process(); // GET (dimulai sebelum konfirmasi) membaca sesudah tulisan
  get1.deliver();
  await tick();
  assert.equal(count(), before + 1, 'tidak dobel meski GET lama tiba setelah konfirmasi');
  for (let i = 0; i < 5 && queue.length; i++) { const h = queue.shift(); h.process(); h.deliver(); await tick(); }
  assert.equal(count(), before + 1);
  assert.equal(S.getState().pending.length, 0);
});

test('pemantau berhenti saat tidak ada pemakai', async () => {
  stop();
  const n = queue.length;
  window.dispatchEvent(new Event('online'));
  await tick();
  assert.equal(queue.length, n, 'tidak ada permintaan baru setelah berhenti');
  assert.ok(POLL_MS === 10000);
});
