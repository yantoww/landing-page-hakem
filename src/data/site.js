// Semua isi yang perlu diedit tim ada di berkas ini.
// Bagian bertanda "ISI:" adalah placeholder yang harus diganti sebelum dikumpulkan.

import { gasEnabled } from '../lib/gas.js';

export const STORAGE_KEY = 'simpul.sim.v2';

// Mode Google Spreadsheet: tab Voting menyimpan ID anggota acak di samping pilihan (bukan nama). Teks tentang
// kerahasiaan suara mengikuti mode itu supaya tidak menjanjikan hal yang tidak benar.
const gas = gasEnabled();

// Aturan simulasi (dipakai logika voting dan aspirasi).
export const MEMBER_BASE = 0; // basis awal kosong; anggota bertambah lewat pendaftaran simulasi
export const DEMO_GROUP = 'Anggota demo'; // penanda anggota demo (sama dengan DEMO_GROUP di google-apps-script/Code.gs)
export const DEMO_TTL_MIN = 30; // anggota demo dihapus otomatis setelah sekian menit (mode Google Spreadsheet)
export const QUORUM = 0.3; // 30% anggota aktif
export const ASP_REVIEW = 25; // dukungan agar aspirasi dikaji Komite Kebijakan
export const ASP_AGENDA = 100; // dukungan agar aspirasi wajib masuk agenda Rembuk

export const party = {
  name: 'Partai Simpul',
  short: 'Simpul',
  slogan: 'Terhubung, Berembuk, Memutuskan',
  tagline: 'Politik yang bisa kamu ikut putuskan.',
  // Label wajib dari panduan. Satu-satunya em dash di situs ini.
  label: 'Simulasi Akademik — Bukan Partai Politik Resmi',
  course: 'Proyek akhir mata kuliah Politik Digital 2026',
  campus: 'FISIP Universitas Airlangga',
};

// short = nama pendek untuk tombol Peta di layar sempit.
export const stations = [
  { id: 'home', name: 'Home', short: 'Home' },
  { id: 'about', name: 'About Us', short: 'About' },
  { id: 'leadership', name: 'Leadership & Membership', short: 'Leadership' },
  { id: 'agenda', name: 'Political Agenda', short: 'Agenda' },
  { id: 'participation', name: 'Digital Participation', short: 'Participation' },
  { id: 'news', name: 'News & Activities', short: 'News' },
  { id: 'contact', name: 'Contact & Social Media', short: 'Contact' },
];

// ISI: tulis handle dan href (URL lengkap akun, mis. 'https://www.instagram.com/akunkelompok').
// Selama href kosong, kartu tampil sebagai placeholder berlabel dan bukan tautan.
export const social = [
  {
    name: 'Instagram',
    handle: '@partai.simpul',
    href: 'https://www.instagram.com/partai.simpul',
    use: 'Konten edukasi isu, pengenalan kepemimpinan, dan ajakan mencoba website.',
  },
  {
    name: 'TikTok',
    handle: '@isi-akun-tiktok',
    href: '',
    use: 'Video pendek pengenalan partai dan konten interaktif.',
  },
];

export const groups = [
  'Mahasiswa atau pelajar',
  'Pekerja platform (ojol, kurir, freelancer, kreator)',
  'Pelaku UMKM digital',
  'Pekerja formal',
  'Lainnya',
];

// ISI: name diisi nama anggota kelompok yang memegang kursi. Kosongkan (null) bila belum ada.
export const council = [
  {
    seat: 'Juru Bicara Bergilir',
    role: 'Political Strategist / Party Leader',
    duty: 'Mewakili Dewan di depan publik selama tiga bulan, lalu bergilir. Tidak boleh memutuskan sendiri hal yang menjadi wewenang Rembuk.',
    name: null,
  },
  {
    seat: 'Kursi Kebijakan',
    role: 'Policy Researcher',
    duty: 'Menyusun kajian tiga agenda dan menjawab aspirasi yang mencapai 25 dukungan dalam 7 hari.',
    name: null,
  },
  {
    seat: 'Kursi Keanggotaan dan Partisipasi',
    role: 'Membership & Participation Designer',
    duty: 'Merancang pendaftaran, voting, dan forum, serta memastikan aturan keputusan dijalankan.',
    name: null,
  },
  {
    seat: 'Kursi Platform dan Data',
    role: 'Website Developer',
    duty: 'Membangun dan merawat platform, menjaga data anggota seminimal mungkin.',
    name: null,
  },
  {
    seat: 'Kursi Media dan Kreatif',
    role: 'Social Media Strategist + Creative & Content Designer',
    duty: 'Mengelola akun, kalender konten, dan identitas visual.',
    name: null,
  },
];

export const bodies = [
  {
    body: 'Komite Integritas dan Data',
    role: 'Governance & Evaluation',
    duty: 'Merumuskan pertanyaan Rembuk secara netral, mengaudit pemungutan suara, menangani pengaduan, dan menegakkan perlindungan data. Anggotanya tidak boleh duduk di Dewan.',
    name: null,
  },
  {
    body: 'Sekretariat',
    role: 'Project Coordinator',
    duty: 'Dokumentasi, notulen Rembuk, dan penggabungan laporan.',
    name: null,
  },
];

export const issues = [
  {
    id: 'kerja',
    num: 1,
    short: 'Kerja layak platform',
    title: 'Kerja layak di ekonomi platform',
    problem:
      'Pengemudi, kurir, dan pekerja lepas berstatus mitra, sehingga jaminan sosial dan kepastian pendapatan mereka bergantung pada kebijakan platform. Tarif dan penonaktifan akun diputuskan algoritma yang tidak bisa mereka periksa.',
    affected: 'Pengemudi ojek dan taksi daring, kurir, pekerja lepas, dan kreator konten.',
    solutions: [
      'Iuran jaminan sosial ketenagakerjaan yang dibagi antara platform dan pekerja menurut pendapatan.',
      'Hak penjelasan algoritma: alasan tertulis atas penonaktifan akun dan banding yang diputus manusia dalam 7 hari kerja.',
      'Forum perundingan kolektif antara perwakilan pekerja, platform, dan pemerintah.',
    ],
    digital:
      'Peta Tarif Warga: pekerja melaporkan tarif per perjalanan secara anonim, sehingga data publik bisa dibandingkan. Petisi digital dan Rembuk khusus pekerja platform menentukan tuntutan yang didahulukan.',
    indicators: [
      'Cakupan jaminan sosial ketenagakerjaan pekerja platform mencapai 60% dalam 3 tahun.',
      'Banding penonaktifan akun selesai paling lama 7 hari kerja (median).',
      'Sedikitnya 10.000 laporan tarif terverifikasi masuk Peta Tarif Warga.',
    ],
  },
  {
    id: 'anggaran',
    num: 2,
    short: 'Anggaran terbuka',
    title: 'Anggaran terbuka dan layanan publik yang bisa diawasi',
    problem:
      'Dokumen anggaran daerah sulit dibaca dan jarang tersedia dalam format yang bisa diolah. Usulan warga dalam musyawarah perencanaan sering tidak jelas nasibnya setelah rapat selesai.',
    affected:
      'Warga kota dan desa, pengurus RT dan RW, jurnalis dan peneliti, mahasiswa, serta kelompok rentan yang jarang hadir di musyawarah.',
    solutions: [
      'Kewajiban mempublikasikan APBD dalam format terbuka (CSV) beserta ringkasan berbahasa sederhana.',
      'Alokasi sebagian belanja modal untuk anggaran partisipatif yang diputuskan lewat pemungutan suara warga.',
      'Pelacak usulan: setiap usulan warga punya status dan alasan keputusan yang bisa dilihat publik.',
    ],
    digital:
      'Simpul menerapkannya dulu pada dirinya sendiri: anggaran partai dibuka per kegiatan dan anggota memutuskan pos kegiatan lewat Rembuk. Pelacak aspirasi di situs ini memakai alur status yang sama.',
    indicators: [
      'Sedikitnya 5% belanja modal dialokasikan lewat anggaran partisipatif.',
      '100% usulan warga mendapat status dan alasan tertulis dalam 30 hari.',
      '100% dokumen APBD tersedia dalam format terbuka.',
    ],
  },
  {
    id: 'data',
    num: 3,
    short: 'Hak digital',
    title: 'Hak digital dan ruang digital yang sehat',
    problem:
      'Platform, instansi, dan kampanye politik mengumpulkan data pribadi warga dalam jumlah besar. UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi sudah ada, tetapi warga perlu kepastian lembaga pengawas yang independen dan sanksi yang ditegakkan. Iklan politik yang menarget kelompok tertentu juga sulit dilacak pembayarnya.',
    affected:
      'Pengguna media sosial, pemilih pemula, lansia dan warga dengan literasi digital rendah, serta pegiat dan jurnalis.',
    solutions: [
      'Mendorong lembaga pengawas pelindungan data yang independen, berdaya, dan melapor secara terbuka.',
      'Registri publik iklan politik daring: siapa pembayar, berapa dana, dan kelompok sasarannya.',
      'Program literasi digital dan cek fakta di kampus dan komunitas.',
    ],
    digital:
      'Cek Fakta Warga: anggota menandai klaim yang perlu diperiksa, relawan terlatih memverifikasinya dengan sumber terbuka. Platform Simpul menjadi contoh: data minimal, akun bisa dihapus kapan saja, dan aturan platform dibuka untuk audit.',
    indicators: [
      '100% iklan politik daring partai tercatat di registri publik.',
      'Laporan kebocoran data dari anggota ditindaklanjuti secara tertulis dalam 14 hari.',
      'Sedikitnya 20 kelas literasi digital per tahun di kampus dan komunitas mitra.',
    ],
  },
];

// Data awal untuk voting adalah data simulasi.
export const ballots = [
  {
    id: 'rembuk-12',
    title: 'Rembuk Pekanan #12',
    status: 'open',
    closes: 'Ditutup Jumat pukul 20.00 WIB (jadwal simulasi)',
    question:
      'Bagaimana posisi Simpul terhadap iklan politik daring yang menarget kelompok pemilih tertentu?',
    options: [
      { id: 'larang', label: 'Dilarang' },
      { id: 'lapor', label: 'Boleh jika dilaporkan terbuka' },
      { id: 'bebas', label: 'Tidak perlu diatur' },
    ],
    seed: { larang: 0, lapor: 0, bebas: 0 },
    rule: 'Sah jika kuorum 30% anggota aktif terpenuhi. Opsi dengan suara terbanyak menjadi sikap partai.',
  },
  {
    id: 'rembuk-11',
    title: 'Rembuk Pekanan #11',
    status: 'closed',
    closes: 'Sudah ditutup (data simulasi)',
    question: 'Bolehkah Simpul menerima donasi dari perusahaan platform digital?',
    options: [
      { id: 'tolak', label: 'Tolak seluruh donasi' },
      { id: 'batas', label: 'Terima dengan batas dan laporan terbuka' },
      { id: 'terima', label: 'Terima tanpa batas' },
    ],
    seed: { tolak: 0, batas: 0, terima: 0 },
    rule: 'Sah jika kuorum 30% anggota aktif terpenuhi. Opsi dengan suara terbanyak menjadi sikap partai.',
  },
];

export const forumCategories = ['Kerja layak platform', 'Anggaran terbuka', 'Hak digital', 'Organisasi'];

// Mulai tanpa utas contoh; topik muncul saat anggota mengirimkannya.
export const forumSeed = [];

export const aspCategories = [...forumCategories.slice(0, 3), 'Pengaduan integritas', 'Lainnya'];

// Mulai tanpa aspirasi atau dukungan contoh.
export const aspSeed = [];

export const rulesMatrix = {
  columns: [
    { id: 'aspirasi', code: 'A', name: 'Aspirasi' },
    { id: 'forum', code: 'F', name: 'Forum' },
    { id: 'suara', code: 'S', name: 'Voting' },
  ],
  rows: [
    {
      label: 'Hak akses',
      cells: [
        'Pengunjung membaca. Anggota mengajukan dan mendukung, satu dukungan per anggota untuk tiap usulan.',
        'Pengunjung membaca. Anggota menulis dan membalas. Relawan moderator meninjau laporan.',
        gas
          ? 'Hanya anggota aktif. Satu anggota satu suara, tanpa nama (hanya ID anggota acak).'
          : 'Hanya anggota aktif. Satu anggota satu suara, rahasia.',
      ],
    },
    {
      label: 'Prosedur keputusan',
      cells: [
        '25 dukungan: dikaji Kursi Kebijakan dalam 7 hari. 100 dukungan: wajib masuk agenda Rembuk Pekanan berikutnya.',
        'Forum tidak memutuskan, ia menyusun pertimbangan. Ringkasan diskusi dilampirkan pada usulan yang masuk Rembuk.',
        'Sah bila kuorum 30% anggota aktif terpenuhi dan satu opsi unggul. Perubahan statuta butuh dua pertiga suara.',
      ],
    },
    {
      label: 'Moderasi',
      cells: [
        'Duplikat dan ujaran kebencian disaring sebelum tayang. Alasan penolakan dicatat.',
        'Aturan tertulis. Laporan anggota menyembunyikan unggahan sementara, moderator memutuskan dalam 24 jam dan mencatatnya di log.',
        'Pertanyaan dirumuskan netral oleh Komite Integritas. Kampanye untuk sebuah opsi hanya di forum, bukan di bilik suara.',
      ],
    },
    {
      label: 'Transparansi hasil',
      cells: [
        'Jumlah dukungan dan status tampil langsung. Alasan setiap keputusan dipublikasikan.',
        'Log moderasi dan jumlah laporan dipublikasikan tiap bulan.',
        'Partisipasi dan kuorum tampil langsung. Hasil per opsi tampil untuk yang sudah memilih dan untuk semua orang saat ditutup, disusul audit Komite Integritas.',
      ],
    },
    {
      label: 'Perlindungan data',
      cells: [
        'Memakai nama panggilan. Penulis boleh memilih tampil anonim.',
        'Memakai nama panggilan, tanpa pelacak lintas situs.',
        gas
          ? 'Catatan suara memakai ID anggota acak, bukan nama. Hanya pengelola spreadsheet yang bisa melihat pilihan per ID.'
          : 'Kotak suara dipisah dari daftar pemilih, sehingga pilihan tidak terhubung dengan identitas.',
      ],
    },
  ],
};

export const risks = [
  {
    title: 'Dominasi pemimpin (hyperleadership)',
    risk: 'Satu juru bicara menjadi wajah tunggal dan agenda mengikuti figur, bukan keputusan anggota.',
    handling:
      'Juru bicara bergilir tiap tiga bulan, batas dua periode berturut-turut, dan penarikan mandat bila 10% anggota meminta.',
  },
  {
    title: 'Manipulasi voting',
    risk: 'Akun ganda atau pendaftaran massal menjelang pemungutan suara mengubah hasil.',
    handling:
      gas
        ? `Verifikasi anggota, masa tunggu 7 hari sebelum hak suara aktif, dan audit Komite Integritas. Pada simulasi ini anggota demo hanya sementara: suara dan tulisannya dihapus saat selesai atau setelah ${DEMO_TTL_MIN} menit, jadi tidak membentuk hasil. Hasil tetap tidak mewakili sistem nyata.`
        : 'Verifikasi anggota, masa tunggu 7 hari sebelum hak suara aktif, dan audit Komite Integritas. Pada simulasi ini satu perangkat bisa membuat banyak anggota demo, jadi hasilnya tidak mewakili sistem nyata.',
  },
  {
    title: 'Penyalahgunaan data',
    risk: 'Data anggota dipakai di luar tujuan atau jatuh ke pihak ketiga.',
    handling:
      gas
        ? 'Data seminimal mungkin, hak hapus kapan saja, aturan platform dibuka untuk audit, dan catatan suara hanya memakai ID anggota acak, bukan nama.'
        : 'Data seminimal mungkin, hak hapus kapan saja, aturan platform dibuka untuk audit, dan kotak suara dipisah dari identitas.',
  },
  {
    title: 'Ketimpangan akses',
    risk: 'Anggota tanpa perangkat, sinyal, atau kemampuan digital tertinggal dari proses keputusan.',
    handling:
      'Antarmuka ringan, titik akses dan pendamping di Simpul Wilayah, dan pemungutan suara dibuka selama 3 hari.',
  },
  {
    title: 'Partisipasi simbolis',
    risk: 'Suara dikumpulkan tetapi tidak mengubah keputusan.',
    handling:
      'Ambang yang mengikat (kuorum, mayoritas, 100 dukungan) dan batas waktu tindak lanjut, dengan laporan kepatuhan tiap bulan.',
  },
];

// ISI: tambahkan kegiatan nyata kelompok bila ada.
export const news = [
  {
    id: 'n-pameran',
    type: 'kegiatan',
    date: '27 November 2026',
    title: 'Pameran dan Workshop Partai Digital di FISIP Universitas Airlangga',
    text: 'Coba daftar, memilih, berdiskusi, dan mengajukan aspirasi langsung di stan Simpul. Lima sesi: pengenalan partai dan masalah politik, demo website dan membership, simulasi fitur partisipasi, media sosial dan keunggulan, serta tanya jawab dan refleksi.',
    featured: true,
  },
  {
    id: 'n-uji',
    type: 'berita',
    date: '27 November 2026',
    title: 'Platform partisipasi Simpul dibuka untuk uji coba',
    text: 'Voting, forum, dan aspirasi di halaman ini bisa dicoba dengan mendaftar sebagai anggota simulasi atau masuk sebagai anggota demo. Data yang kamu kirim bisa dihapus kapan saja lewat tombol Hapus data saya.',
  },
  {
    id: 'n-medsos',
    type: 'kegiatan',
    date: '27 November 2026',
    title: 'Enam konten pertama di media sosial',
    text: 'Pengenalan partai, dua konten edukasi isu, pengenalan kepemimpinan, ajakan mencoba website, dan satu konten interaktif.',
  },
];
