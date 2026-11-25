// Penyaring kata kasar untuk teks yang ditulis pengunjung. Salinan daftar dan aturan yang sama ada di
// google-apps-script/Code.gs (server yang menentukan); tests/gas.test.mjs gagal bila keduanya berbeda.
// ponytail: daftar kata, bukan pemahaman kalimat. Ejaan baru atau sindiran tanpa kata kasar tetap lolos;
// tambahkan kata ke daftar, atau pakai moderasi manusia/layanan klasifikasi bila perlu.
export const BAD_WORDS = [
  // Indonesia dan daerah
  'anjing', 'anjg', 'anj', 'anjir', 'anjrit', 'ajg', 'asu', 'babi', 'monyet', 'bajingan', 'bangsat', 'bgst', 'bacot',
  'bego', 'goblok', 'goblog', 'gblk', 'tolol', 'idiot', 'dungu', 'brengsek', 'keparat', 'kampret', 'sialan', 'bedebah',
  'tai', 'taik', 'kontol', 'kntl', 'memek', 'pepek', 'jembut', 'peler', 'ngentot', 'ngentod', 'entot', 'ngewe',
  'perek', 'lonte', 'pelacur', 'jancok', 'jancuk', 'dancok', 'diancok', 'jncok', 'ndasmu',
  // Ejekan kubu politik
  'cebong', 'kadrun',
  // Inggris
  'fuck', 'fucking', 'fucker', 'motherfucker', 'shit', 'bullshit', 'bitch', 'asshole', 'bastard', 'dick', 'pussy',
  'slut', 'whore', 'nigger', 'nigga', 'faggot', 'retard',
];

// Tiap huruf boleh dipanjangkan ("anjiiing"), dan boleh berakhiran -nya, -lah, -kah, -mu, -ku, -lu, -lo.
// Seluruh kata harus cocok, jadi "asuransi", "santai", atau "Niger" tidak ikut tertolak.
const PATTERNS = BAD_WORDS.map((w) => new RegExp(`^${w.split('').map((c) => `${c}+`).join('')}(?:nya|lah|kah|mu|ku|lu|lo)?$`));
const LOOKALIKE = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', 8: 'b', 9: 'g', '@': 'a', $: 's' };

const isBad = (token) => {
  if (!/[a-z]/.test(token)) return false; // angka murni bukan kata
  const word = token.replace(/2+$/, '').replace(/[0134789@$5]/g, (c) => LOOKALIKE[c]); // "goblok2", "b4ngs4t"
  return PATTERNS.some((re) => re.test(word));
};

// Mengembalikan kata kasar pertama yang ditemukan, atau '' bila teks bersih.
export function findBadWord(text) {
  const tokens = String(text)
    .normalize('NFKD')
    .replace(/[̀-ͯ­​-‏⁠﻿]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9@$]+/)
    .filter(Boolean);
  let spelled = ''; // huruf yang dipisah-pisah: "k o n t o l", "a.s.u"
  for (const t of [...tokens, '']) {
    if (t.length === 1) {
      spelled += t;
      continue;
    }
    if (spelled.length >= 3 && isBad(spelled)) return spelled;
    spelled = '';
    if (t && isBad(t)) return t;
  }
  return '';
}

// fields: pasangan [nama kolom, isi]. Mengembalikan pesan galat, atau '' bila semuanya bersih.
export function badWordError(...fields) {
  for (const [label, text] of fields) {
    const bad = findBadWord(text);
    if (bad) return `${label} memuat kata kasar atau menghina ("${bad}"). Ubah dulu sebelum dikirim.`;
  }
  return '';
}
