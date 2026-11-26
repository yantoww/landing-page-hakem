/**
 * Backend Google Apps Script untuk website Partai Simpul (simulasi akademik).
 * Menyimpan dan membaca data anggota, voting, aspirasi, dan forum di Google Spreadsheet.
 *
 * KONTRAK API
 *
 * POST (body JSON, kirim dengan Content-Type: text/plain;charset=utf-8 agar browser tidak
 * memicu preflight CORS yang tidak didukung Apps Script):
 *   { "action": "register_member",    "nickname": "Raras", "group": "Mahasiswa atau pelajar", "issues": ["Hak digital"] }
 *   { "action": "submit_vote",        "memberId": "M-...", "topic": "rembuk-12", "choice": "larang" }
 *   { "action": "submit_aspiration",  "memberId": "M-...", "category": "Hak digital", "title": "...", "text": "...", "anonymous": false }
 *   { "action": "support_aspiration", "memberId": "M-...", "aspirationId": "A-..." }
 *   { "action": "submit_comment",     "memberId": "M-...", "topic": "Judul topik forum", "comment": "...", "category": "Hak digital", "anonymous": false }
 *   { "action": "delete_member",      "memberId": "M-..." }   // hak hapus (lihat deleteMember_)
 *
 * ANGGOTA DEMO: register_member dengan group "Anggota demo" membuat anggota sementara. delete_member pada anggota demo
 * menghapus menyeluruh semua jejaknya (suara, dukungan, aspirasi, komentar), dan server membersihkan yang
 * lebih tua dari CONFIG.DEMO_TTL_MIN menit secara otomatis. Anggota terdaftar tidak terpengaruh.
 *
 * Respons selalu JSON: { "status": "success" | "error", "message": "...", "data": ... }
 * (Apps Script selalu membalas HTTP 200, jadi periksa field status.)
 *
 * GET: mengembalikan total anggota, rekap suara per topik dan opsi, aspirasi terbaru beserta
 * dukungannya, dan komentar forum terbaru. MemberID tidak pernah ikut dikembalikan.
 *
 * CATATAN KEAMANAN
 * - Endpoint ini publik (siapa pun yang tahu URL-nya bisa mengirim data). MemberID acak dibuat
 *   server dan berfungsi sebagai kunci anggota, jadi jangan dipublikasikan atau diurutkan.
 * - Tab Voting menyimpan MemberID bersama Pilihan (sesuai rancangan kolom). Artinya pilihan bisa
 *   ditelusuri ke anggota oleh siapa pun yang punya akses edit Spreadsheet. Batasi akses edit
 *   Spreadsheet, dan jangan menyebut suara "rahasia" di situs bila memakai penyimpanan ini.
 * - Teks berawalan = + - @ diberi awalan apostrof saat ditulis (neutralize_), jadi isi seperti "=IMPORTDATA(...)"
 *   tidak dijalankan sebagai rumus. Pengujian di Google Sheets menunjukkan format teks saja TIDAK cukup.
 */

var CONFIG = {
  TIMEZONE: 'Asia/Jakarta', // dipakai untuk format waktu di JSON
  ASPIRATION_LIMIT: 50, // jumlah aspirasi terbaru yang dikembalikan doGet
  FORUM_LIMIT: 100, // jumlah komentar terbaru yang dikembalikan doGet
  LOCK_WAIT_MS: 30000, // tunggu giliran tulis agar tidak terjadi double-voting saat dua permintaan bersamaan
  // Topik dan opsi voting yang diterima (id sama dengan ballots di src/data/site.js). Permintaan di luar daftar
  // ditolak, jadi tidak ada topik acak yang bisa dibuat dari luar. Kosongkan ({}) untuk menerima semua topik.
  VOTING_OPTIONS: { 'rembuk-12': ['larang', 'lapor', 'bebas'] },
  // Anggota demo bersifat sementara: dihapus menyeluruh saat selesai, atau otomatis setelah DEMO_TTL_MIN menit.
  DEMO_TTL_MIN: 30,
  DEMO_PURGE_EVERY_S: 60, // seberapa sering pembersihan kedaluwarsa dijalankan (dipicu permintaan, tanpa trigger)
  DEMO_BATCH: 20, // maksimal anggota demo yang dibersihkan per putaran agar tidak menahan penulisan lain
};

// KategoriKelompok yang menandai anggota demo. Server yang memutuskan siapa demo dari baris Anggota,
// bukan dari permintaan klien, jadi anggota terdaftar tidak bisa meminta penghapusan suaranya.
var DEMO_GROUP = 'Anggota demo';

// Kolom A sampai G pada Aspirasi sesuai rancangan. Kolom H (AspirasiID) dan I (Pendukung) adalah
// tambahan yang diperlukan agar dukungan bisa menunjuk satu aspirasi dan satu anggota tidak bisa
// mendukung dua kali. Forum punya kolom tambahan F (Kategori) karena forum di situs dikelompokkan per kategori.
var SHEETS = {
  MEMBERS: { name: 'Anggota', headers: ['Timestamp', 'MemberID', 'NamaPanggilan', 'KategoriKelompok', 'MinatIsu'] },
  VOTES: { name: 'Voting', headers: ['Timestamp', 'MemberID', 'TopikVoting', 'Pilihan'] },
  ASPIRATIONS: {
    name: 'Aspirasi',
    headers: ['Timestamp', 'MemberID', 'Nama', 'Kategori', 'JudulAspirasi', 'IsiAspirasi', 'Dukungan', 'AspirasiID', 'Pendukung'],
  },
  FORUM: { name: 'Forum', headers: ['Timestamp', 'MemberID', 'Nama', 'Topik', 'Komentar', 'Kategori'] },
};

var ACTIONS = {
  register_member: registerMember_,
  submit_vote: submitVote_,
  submit_aspiration: submitAspiration_,
  support_aspiration: supportAspiration_,
  submit_comment: submitComment_,
  delete_member: deleteMember_,
};

// ---------- Titik masuk Web App ----------

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var body = parseBody_(e);
    var handler = ACTIONS[body.action];
    if (!handler) {
      throw new UserError('Action tidak dikenal. Pilihan: ' + Object.keys(ACTIONS).join(', ') + '.');
    }
    lock.waitLock(CONFIG.LOCK_WAIT_MS);
    purgeDemosIfDue_(true);
    var result = handler(body);
    SpreadsheetApp.flush(); // pastikan tulisan terlihat oleh GET berikutnya sebelum membalas
    return respond_({ status: 'success', message: result.message, data: result.data });
  } catch (err) {
    return respond_({ status: 'error', message: errorMessage_(err), data: null });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function doGet() {
  try {
    purgeDemosIfDue_(false);
    var members = rows_(sheet_(SHEETS.MEMBERS));
    var votes = rows_(sheet_(SHEETS.VOTES));
    var aspirations = rows_(sheet_(SHEETS.ASPIRATIONS));
    var comments = rows_(sheet_(SHEETS.FORUM));

    var byTopic = Object.create(null);
    var order = [];
    votes.forEach(function (r) {
      var topic = plain_(r[2]);
      var choice = plain_(r[3]);
      if (!byTopic[topic]) {
        byTopic[topic] = { topic: topic, total: 0, options: Object.create(null) };
        order.push(topic);
      }
      byTopic[topic].total += 1;
      byTopic[topic].options[choice] = (byTopic[topic].options[choice] || 0) + 1;
    });

    var data = {
      generatedAt: iso_(new Date()),
      totalMembers: members.length,
      voting: order.map(function (t) {
        return byTopic[t];
      }),
      aspirations: newest_(aspirations, CONFIG.ASPIRATION_LIMIT).map(function (r) {
        return {
          id: String(r[7] || ''),
          timestamp: iso_(r[0]),
          name: plain_(r[2]),
          category: plain_(r[3]),
          title: plain_(r[4]),
          text: plain_(r[5]),
          support: Number(r[6]) || 0,
        };
      }),
      forum: newest_(comments, CONFIG.FORUM_LIMIT).map(function (r) {
        return { timestamp: iso_(r[0]), name: plain_(r[2]), topic: plain_(r[3]), comment: plain_(r[4]), category: plain_(r[5] || '') };
      }),
    };
    return respond_({ status: 'success', message: 'Data berhasil dibaca.', data: data });
  } catch (err) {
    return respond_({ status: 'error', message: errorMessage_(err), data: null });
  }
}

// Jalankan sekali dari editor (tombol Run) untuk memberi izin dan membuat semua tab beserta header.
function setup() {
  Object.keys(SHEETS).forEach(function (k) {
    sheet_(SHEETS[k]);
  });
  Logger.log('Tab siap: ' + Object.keys(SHEETS).map(function (k) { return SHEETS[k].name; }).join(', '));
}

// ---------- Aksi ----------

function registerMember_(b) {
  var nickname = publicText_(b.nickname, 'Nama panggilan', 2, 30);
  var group = text_(b.group, 'Kategori kelompok', 1, 80);
  var issues = list_(b.issues, 'Minat isu');
  var id = 'M-' + Utilities.getUuid().replace(/-/g, '').slice(0, 10).toUpperCase();
  appendRow_(sheet_(SHEETS.MEMBERS), [new Date(), id, nickname, group, issues.join(', ')]);
  return { message: 'Pendaftaran berhasil.', data: { memberId: id, nickname: nickname, group: group, issues: issues } };
}

function submitVote_(b) {
  var member = requireMember_(b.memberId, 'memberi suara');
  var topic = text_(b.topic, 'Topik voting', 1, 120);
  var choice = text_(b.choice, 'Pilihan', 1, 80);
  var allowed = CONFIG.VOTING_OPTIONS[topic];
  if (CONFIG.VOTING_OPTIONS && Object.keys(CONFIG.VOTING_OPTIONS).length) {
    if (!allowed) throw new UserError('Topik voting tidak dikenal.');
    if (allowed.indexOf(choice) === -1) throw new UserError('Pilihan tidak valid untuk topik ini.');
  }

  var sheet = sheet_(SHEETS.VOTES);
  var already = rows_(sheet).some(function (r) {
    return String(r[1]).toUpperCase() === member.id && plain_(r[2]) === topic;
  });
  if (already) {
    throw new UserError('Anda sudah memberi suara pada topik ini. Satu anggota hanya memiliki satu suara.');
  }
  appendRow_(sheet, [new Date(), member.id, topic, choice]);
  return { message: 'Suara Anda tercatat.', data: { topic: topic, choice: choice } };
}

function submitAspiration_(b) {
  var member = requireMember_(b.memberId, 'mengajukan aspirasi');
  var category = publicText_(b.category || 'Lainnya', 'Kategori', 1, 60);
  var title = publicText_(b.title, 'Judul aspirasi', 8, 90);
  var content = publicText_(b.text, 'Isi aspirasi', 20, 400);
  var id = 'A-' + Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
  var name = b.anonymous === true ? 'Anonim' : member.nickname;
  // Pengaju otomatis menjadi pendukung pertama.
  appendRow_(sheet_(SHEETS.ASPIRATIONS), [new Date(), member.id, name, category, title, content, 1, id, member.id]);
  return { message: 'Aspirasi diajukan.', data: { aspirationId: id, support: 1 } };
}

function supportAspiration_(b) {
  var member = requireMember_(b.memberId, 'mendukung aspirasi');
  var aspirationId = text_(b.aspirationId, 'ID aspirasi', 1, 40);
  var sheet = sheet_(SHEETS.ASPIRATIONS);
  var rows = rows_(sheet);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][7]) !== aspirationId) continue;
    var supporters = String(rows[i][8]).split(',').filter(Boolean);
    if (supporters.indexOf(member.id) !== -1) throw new UserError('Anda sudah mendukung usulan ini.');
    var sheetRow = i + 2; // baris 1 adalah header
    var total = (Number(rows[i][6]) || 0) + 1;
    supporters.push(member.id);
    sheet.getRange(sheetRow, 7).setValue(total);
    sheet.getRange(sheetRow, 9).setValue(supporters.join(','));
    return { message: 'Dukungan Anda tercatat.', data: { aspirationId: aspirationId, support: total } };
  }
  throw new UserError('Aspirasi tidak ditemukan.');
}

function submitComment_(b) {
  var member = requireMember_(b.memberId, 'menulis di forum');
  var topic = publicText_(b.topic, 'Topik', 3, 120);
  var comment = publicText_(b.comment, 'Komentar', 10, 600);
  var category = publicText_(b.category || 'Lainnya', 'Kategori', 1, 60);
  var name = b.anonymous === true ? 'Anonim' : member.nickname;
  appendRow_(sheet_(SHEETS.FORUM), [new Date(), member.id, name, topic, comment, category]);
  return { message: 'Komentar terkirim.', data: { topic: topic } };
}

// Hak hapus. Anggota demo: dihapus menyeluruh (anggota, suara, dukungan, aspirasi, dan komentarnya), tanpa jejak.
// Anggota terdaftar: baris anggota dihapus dan nama pada aspirasi dan forum diganti. Jejak "sudah memilih"
// di tab Voting tetap ada (tanpa nama) agar satu orang tidak bisa memilih dua kali.
function deleteMember_(b) {
  var id = String(b.memberId || '').trim().toUpperCase();
  if (!id) throw new UserError('MemberID wajib diisi.');
  var members = sheet_(SHEETS.MEMBERS);
  var rows = rows_(members);
  var index = -1;
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][1]).toUpperCase() === id) {
      index = i;
      break;
    }
  }
  if (index === -1) throw new UserError('Anggota tidak ditemukan atau sudah dihapus.');
  if (plain_(rows[index][3]) === DEMO_GROUP) {
    purgeMembers_([id]);
    return { message: 'Data demo dihapus.', data: { memberId: id, purged: true } };
  }
  members.deleteRow(index + 2); // baris 1 adalah header
  [SHEETS.ASPIRATIONS, SHEETS.FORUM].forEach(function (def) {
    var sheet = sheet_(def);
    rows_(sheet).forEach(function (r, k) {
      if (String(r[1]).toUpperCase() === id) sheet.getRange(k + 2, 3).setValue('Anggota terhapus');
    });
  });
  return { message: 'Data Anda sudah dihapus.', data: { memberId: id } };
}

// Hapus menyeluruh semua jejak sekumpulan anggota (dipakai untuk anggota demo): tulisan aspirasi mereka dihapus,
// dukungan mereka pada aspirasi lain dicabut, lalu suara, komentar, dan baris anggotanya dihapus.
// Dibaca sekali per tab dan dihapus dari bawah ke atas agar nomor baris tidak bergeser.
function purgeMembers_(ids) {
  var set = Object.create(null);
  ids.forEach(function (id) {
    set[String(id).toUpperCase()] = true;
  });
  var inSet = function (v) {
    return set[String(v).toUpperCase()] === true;
  };

  var asp = sheet_(SHEETS.ASPIRATIONS);
  var aRows = rows_(asp);
  for (var i = aRows.length - 1; i >= 0; i--) {
    var r = aRows[i];
    if (inSet(r[1])) {
      asp.deleteRow(i + 2);
      continue;
    }
    var supporters = String(r[8]).split(',').filter(Boolean);
    var kept = supporters.filter(function (s) {
      return !inSet(s);
    });
    if (kept.length !== supporters.length) {
      asp.getRange(i + 2, 7).setValue(Math.max(0, (Number(r[6]) || 0) - (supporters.length - kept.length)));
      asp.getRange(i + 2, 9).setValue(kept.join(','));
    }
  }
  [SHEETS.VOTES, SHEETS.FORUM, SHEETS.MEMBERS].forEach(function (def) {
    var sheet = sheet_(def);
    var rows = rows_(sheet);
    for (var j = rows.length - 1; j >= 0; j--) {
      if (inSet(rows[j][1])) sheet.deleteRow(j + 2);
    }
  });
}

// Bersihkan anggota demo yang melewati DEMO_TTL_MIN. Dipicu permintaan (tanpa trigger), paling sering sekali per
// DEMO_PURGE_EVERY_S. haveLock: true bila pemanggil (doPost) sudah memegang kunci tulis.
function purgeDemosIfDue_(haveLock) {
  try {
    var cache = CacheService.getScriptCache();
    if (cache.get('demoPurge')) return;
    cache.put('demoPurge', '1', CONFIG.DEMO_PURGE_EVERY_S);
    var lock = null;
    if (!haveLock) {
      lock = LockService.getScriptLock();
      if (!lock.tryLock(3000)) return;
    }
    try {
      var cutoff = Date.now() - CONFIG.DEMO_TTL_MIN * 60000;
      var ids = [];
      rows_(sheet_(SHEETS.MEMBERS)).forEach(function (r) {
        if (ids.length < CONFIG.DEMO_BATCH && plain_(r[3]) === DEMO_GROUP && new Date(r[0]).getTime() < cutoff) {
          ids.push(String(r[1]).toUpperCase());
        }
      });
      if (ids.length) purgeMembers_(ids);
    } finally {
      if (lock) lock.releaseLock();
    }
  } catch (err) {
    console.error(err && err.stack ? err.stack : String(err)); // pembersihan tidak boleh menggagalkan permintaan utama
  }
}

// ---------- Pembantu ----------

function UserError(message) {
  this.name = 'UserError';
  this.message = message;
}
UserError.prototype = Object.create(Error.prototype);
UserError.prototype.constructor = UserError;

function errorMessage_(err) {
  if (err instanceof UserError) return err.message;
  console.error(err && err.stack ? err.stack : String(err));
  return 'Terjadi kesalahan di server. Coba lagi sebentar lagi.';
}

function respond_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function parseBody_(e) {
  var raw = e && e.postData && e.postData.contents;
  if (!raw) throw new UserError('Body kosong. Kirim JSON yang memuat field action.');
  var body;
  try {
    body = JSON.parse(raw);
  } catch (x) {
    throw new UserError('Body bukan JSON yang valid.');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new UserError('Body harus berupa objek JSON.');
  return body;
}

var ss_ = null;
function spreadsheet_() {
  if (ss_) return ss_;
  ss_ = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss_) {
    var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (id) ss_ = SpreadsheetApp.openById(id);
  }
  if (!ss_) {
    throw new Error(
      'Spreadsheet tidak ditemukan. Buat script lewat Extensions > Apps Script di dalam Spreadsheet, ' +
        'atau isi Script Property SPREADSHEET_ID.',
    );
  }
  return ss_;
}

// Ambil tab; buat tab dan baris header bila belum ada atau headernya tidak sesuai.
function sheet_(def) {
  var ss = spreadsheet_();
  var sheet = ss.getSheetByName(def.name) || ss.insertSheet(def.name);
  var current = sheet.getRange(1, 1, 1, def.headers.length).getValues()[0];
  if (current.join('|') !== def.headers.join('|')) {
    var head = sheet.getRange(1, 1, 1, def.headers.length);
    head.setNumberFormat('@').setValues([def.headers]).setFontWeight('bold').setBackground('#E7EAF8');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Semua baris data (tanpa header) sebagai array dua dimensi.
function rows_(sheet) {
  var last = sheet.getLastRow();
  if (last < 2) return [];
  return sheet.getRange(2, 1, last - 1, sheet.getLastColumn()).getValues();
}

// setValues membaca teks berawalan = + - @ sebagai rumus, dan format teks ("@") tidak mencegahnya. Rumus seperti
// IMPORTDATA bisa membocorkan isi Spreadsheet, jadi teks semacam itu diberi awalan apostrof. plain_ melepasnya
// lagi saat dibaca, sehingga isi yang dikembalikan tetap sama dengan yang dikirim pengguna.
function neutralize_(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function plain_(v) {
  var s = String(v);
  return /^'[=+\-@]/.test(s) ? s.slice(1) : s;
}

// Tulis satu baris. Teks diberi format "@" agar angka dan tanggal tidak diubah, dan dinetralkan dari rumus.
function appendRow_(sheet, values) {
  var range = sheet.getRange(sheet.getLastRow() + 1, 1, 1, values.length);
  var formats = values.map(function (v) {
    return v instanceof Date ? 'yyyy-mm-dd hh:mm:ss' : typeof v === 'number' ? '0' : '@';
  });
  range.setNumberFormats([formats]);
  range.setValues([
    values.map(function (v) {
      return typeof v === 'string' ? neutralize_(v) : v;
    }),
  ]);
}

function requireMember_(memberId, doing) {
  var id = String(memberId || '').trim().toUpperCase();
  if (!id) throw new UserError('MemberID wajib diisi. Daftar dulu sebagai anggota.');
  var rows = rows_(sheet_(SHEETS.MEMBERS));
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][1]).toUpperCase() === id) return { id: id, nickname: plain_(rows[i][2]) };
  }
  throw new UserError('Hanya anggota terdaftar yang bisa ' + doing + '. MemberID tidak ditemukan.');
}

function text_(value, label, min, max) {
  var s = value === undefined || value === null ? '' : String(value);
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
  if (!s) throw new UserError(label + ' wajib diisi.');
  if (s.length < min) throw new UserError(label + ' terlalu pendek. Tulis minimal ' + min + ' karakter.');
  if (s.length > max) throw new UserError(label + ' terlalu panjang. Batasnya ' + max + ' karakter.');
  return s;
}

// Teks yang tampil ke publik: selain panjangnya, ditolak bila memuat kata kasar. Cek ini di server karena
// URL Web App publik, jadi penyaring di situs saja bisa dilewati. Daftar dan aturan disalin dari
// src/lib/moderation.js; bila mengubah salah satu, ubah keduanya.
var BAD_WORDS = [
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
var BAD_PATTERNS = BAD_WORDS.map(function (w) {
  return new RegExp('^' + w.split('').map(function (c) { return c + '+'; }).join('') + '(?:nya|lah|kah|mu|ku|lu|lo)?$');
});
var LOOKALIKE = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', 8: 'b', 9: 'g', '@': 'a', $: 's' };

function isBad_(token) {
  if (!/[a-z]/.test(token)) return false;
  var word = token.replace(/2+$/, '').replace(/[0134789@$5]/g, function (c) { return LOOKALIKE[c]; });
  return BAD_PATTERNS.some(function (re) { return re.test(word); });
}

// Kata kasar pertama yang ditemukan, atau '' bila bersih.
function findBadWord_(text) {
  var tokens = String(text)
    .normalize('NFKD')
    .replace(/[̀-ͯ­​-‏⁠﻿]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9@$]+/)
    .filter(Boolean)
    .concat(['']);
  var spelled = ''; // huruf yang dipisah-pisah: "k o n t o l"
  for (var i = 0; i < tokens.length; i++) {
    var t = tokens[i];
    if (t.length === 1) {
      spelled += t;
      continue;
    }
    if (spelled.length >= 3 && isBad_(spelled)) return spelled;
    spelled = '';
    if (t && isBad_(t)) return t;
  }
  return '';
}

function publicText_(value, label, min, max) {
  var s = text_(value, label, min, max);
  var bad = findBadWord_(s);
  if (bad) throw new UserError(label + ' memuat kata kasar atau menghina ("' + bad + '"). Ubah dulu sebelum dikirim.');
  return s;
}

function list_(value, label) {
  if (value === undefined || value === null || value === '') return [];
  var items = Array.isArray(value) ? value : String(value).split(',');
  if (items.length > 10) throw new UserError(label + ' terlalu banyak. Batasnya 10 pilihan.');
  return items
    .map(function (x) {
      return String(x).trim();
    })
    .filter(Boolean)
    .map(function (x) {
      return text_(x, label, 1, 40);
    });
}

function iso_(v) {
  return v instanceof Date ? Utilities.formatDate(v, CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX") : String(v);
}

// Baris terbaru lebih dulu (berdasarkan Timestamp), dibatasi sebanyak limit.
function newest_(rows, limit) {
  return rows
    .slice()
    .sort(function (a, b) {
      return new Date(b[0]).getTime() - new Date(a[0]).getTime();
    })
    .slice(0, limit);
}
