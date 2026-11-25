// Penyaring kata kasar: yang kasar tertolak (termasuk ejaan akal-akalan), kalimat biasa lolos.
import test from 'node:test';
import assert from 'node:assert/strict';
import { findBadWord, badWordError } from '../src/lib/moderation.js';
import * as S from '../src/lib/store.js';

test('kata kasar terdeteksi, termasuk ejaan yang diakali', () => {
  for (const t of [
    'Dasar ANJING!', 'anjiiing banget', 'goblok2 semua', 'b4ngs4t kalian', 'k o n t o l', 'a.s.u kamu', 'Jancuk, rek',
    'tololnya kebijakan ini', 'what the f u c k', 'This is bullshit', 'b@bi lu', 'dasar cebong', 'anj​ing',
  ]) {
    assert.notEqual(findBadWord(t), '', `seharusnya tertolak: ${t}`);
  }
});

test('kalimat biasa tidak ikut tertolak', () => {
  for (const t of [
    'Kami santai di pantai sambil membahas asuransi',
    'Tolong perbaiki layanan publik',
    'Anggaran 2026 harus terbuka dalam 7 hari',
    'Niger dan suara yang memekakkan telinga',
    'Pelacuran anak harus dicegah lewat perlindungan',
    'Pengemudi ojek butuh jaminan sosial dan banding yang adil',
    'Kelas literasi data pribadi untuk mahasiswa baru',
    'Raras Uji',
    'Anggota Demo 12',
    'Pasal 1 a b c tentang hak digital',
  ]) {
    assert.equal(findBadWord(t), '', `seharusnya lolos: ${t}`);
  }
});

test('pesan menyebut kolom dan kata yang ditolak', () => {
  assert.equal(badWordError(['Judul', 'Anggaran terbuka'], ['Uraian', 'dasar tolol']), 'Uraian memuat kata kasar atau menghina ("tolol"). Ubah dulu sebelum dikirim.');
  assert.equal(badWordError(['Judul', 'Anggaran terbuka']), '');
});

test('store menolak sebelum menyimpan: nama, aspirasi, topik, dan balasan', () => {
  S.resetAll();
  assert.equal(S.joinMember({ nick: 'Si Goblok', group: 'Lainnya' }).ok, false);
  assert.equal(S.getState().members.length, 0);
  const m = S.joinMember({ nick: 'Raras', group: 'Lainnya' }).member;
  const bersih = 'Usulan tentang transparansi anggaran daerah.';
  assert.equal(S.submitAspiration(m.id, { title: 'Dasar bangsat', cat: 'Lainnya', text: bersih }).ok, false);
  assert.equal(S.postThread(m.id, { title: 'Anggaran terbuka', cat: 'Lainnya', text: 'kalian semua anjing' }).ok, false);
  assert.equal(S.getState().asp.length + S.getState().forum.length, 0);
  const t = S.postThread(m.id, { title: 'Anggaran terbuka', cat: 'Lainnya', text: bersih });
  assert.equal(t.ok, true);
  assert.equal(S.postReply(m.id, t.id, 'balasan yang tolol sekali').ok, false);
  assert.equal(S.getState().forum[0].posts.length, 1);
});
