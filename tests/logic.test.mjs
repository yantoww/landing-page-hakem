// Jalankan: npm test
// Menguji aturan inti simulasi: satu anggota satu suara, kuorum, dukungan aspirasi, hak hapus.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../src/lib/store.js';
import { ballots, ASP_REVIEW } from '../src/data/site.js';

const open = ballots.find((b) => b.status === 'open');
const closed = ballots.find((b) => b.status === 'closed');

test('data awal kosong, satu anggota satu suara dan kuorum', () => {
  S.resetAll();
  assert.equal(S.tally(S.getState(), open).quorumMet, false);
  assert.equal(S.tally(S.getState(), open).total, 0);
  assert.equal(S.getState().forum.length, 0);
  assert.equal(S.getState().asp.length, 0);

  const m = S.register({ nick: 'Uji', group: 'Lainnya' });
  assert.equal(m.id, 'SMP-0001');

  assert.equal(S.castVote(open.id, m.id, 'lapor').ok, true);
  assert.equal(S.castVote(open.id, m.id, 'larang').ok, false, 'suara kedua harus ditolak');
  assert.equal(S.castVote(open.id, 'SMP-9999', 'larang').ok, false, 'non-anggota harus ditolak');
  assert.equal(S.castVote(closed.id, m.id, 'tolak').ok, false, 'Rembuk tertutup harus ditolak');
  assert.equal(S.castVote(open.id, m.id, 'opsi-palsu').ok, false);

  const t = S.tally(S.getState(), open);
  assert.equal(t.total, 1);
  assert.equal(t.quorumMet, true);
  assert.equal(t.counts.lapor, open.seed.lapor + 1);
  assert.ok(S.getState().box[open.id].every((v) => !('memberId' in v)), 'kotak suara tidak boleh memuat identitas');
});

test('aspirasi: satu dukungan per anggota dan ambang status', () => {
  S.resetAll();
  const m = S.register({ nick: 'Pengaju', group: 'Lainnya' });
  const result = S.submitAspiration(m.id, {
    title: 'Aspirasi tanpa dukungan awal',
    cat: 'Lainnya',
    text: 'Uraian aspirasi yang cukup panjang untuk dikirim.',
  });
  const a = S.getState().asp.find((x) => x.id === result.id);
  assert.equal(S.aspStatus(S.getState(), a).key, 'filed');
  const ids = Array.from({ length: ASP_REVIEW - 1 }, () => S.register({ nick: 'Uji', group: 'Lainnya' }).id);
  for (const id of ids) assert.equal(S.supportAspiration(id, a.id).ok, true);
  assert.equal(S.supportAspiration(ids[0], a.id).ok, false, 'dukungan ganda harus ditolak');
  assert.equal(S.aspStatus(S.getState(), a).key, 'review');
});

test('hak hapus menganonimkan tulisan tetapi tidak membatalkan suara', () => {
  S.resetAll();
  const m = S.register({ nick: 'Rahasia', group: 'Lainnya' });
  S.castVote(open.id, m.id, 'larang');
  const r = S.submitAspiration(m.id, { title: 'Usulan uji coba', cat: 'Lainnya', text: 'Uraian usulan uji coba yang cukup panjang.' });
  assert.equal(r.ok, true);

  S.deleteMember(m.id);
  const s = S.getState();
  assert.equal(s.members.length, 0);
  assert.ok(s.asp.every((a) => a.author !== 'Rahasia'));
  assert.equal(Object.keys(s.roll[open.id]).length, 1, 'jejak sudah memilih tetap ada tanpa nama');
});
