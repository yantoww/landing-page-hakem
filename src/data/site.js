// Semua isi yang perlu diedit tim ada di berkas ini.
// Bagian bertanda "ISI:" adalah placeholder yang harus diganti sebelum dikumpulkan.

export const STORAGE_KEY = 'simpul.sim.v1';

// Aturan simulasi (dipakai logika voting dan aspirasi).
export const MEMBER_BASE = 240; // anggota aktif simulasi (data simulasi, bukan anggota nyata)
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
    handle: '@isi-akun-instagram',
    href: '',
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
    seed: { larang: 31, lapor: 29, bebas: 11 },
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
    seed: { tolak: 104, batas: 51, terima: 9 },
    rule: 'Sah jika kuorum 30% anggota aktif terpenuhi. Opsi dengan suara terbanyak menjadi sikap partai.',
    outcome: {
      decision: 'Simpul menolak seluruh donasi dari perusahaan platform digital.',
      followUp:
        'Dimuat di Kebijakan Pendanaan dalam 3 hari. Komite Integritas mencatat pelaksanaannya di laporan bulanan.',
    },
  },
];

export const forumCategories = ['Kerja layak platform', 'Anggaran terbuka', 'Hak digital', 'Organisasi'];

// Utas awal (data simulasi, ditulis oleh "anggota simulasi").
export const forumSeed = [
  {
    id: 't-algoritma',
    title: 'Apa yang paling perlu dibuka dari algoritma aplikasi ojek?',
    cat: 'Kerja layak platform',
    posts: [
      {
        id: 'p1',
        author: 'Anggota simulasi 07',
        at: '2026-11-16T09:12:00+07:00',
        text: 'Kalau hanya boleh menuntut satu hal: alasan tertulis kenapa sebuah akun dinonaktifkan. Setuju?',
      },
      {
        id: 'p2',
        author: 'Anggota simulasi 12',
        at: '2026-11-16T10:40:00+07:00',
        text: 'Setuju, tetapi tarif per perjalanan juga perlu terbuka. Tanpa itu kita tidak punya bahan pembanding.',
      },
      {
        id: 'p3',
        author: 'Anggota simulasi 03',
        at: '2026-11-17T08:05:00+07:00',
        text: 'Bisa kita gabungkan dengan aspirasi transparansi komisi supaya hitungan dukungannya jadi satu?',
      },
    ],
  },
  {
    id: 't-ktp',
    title: 'Bagaimana memverifikasi anggota tanpa menyimpan data KTP?',
    cat: 'Hak digital',
    posts: [
      {
        id: 'p1',
        author: 'Anggota simulasi 21',
        at: '2026-11-15T19:30:00+07:00',
        text: 'Verifikasi itu perlu supaya tidak ada akun ganda, tetapi menyimpan KTP anggota terlalu berisiko. Ada opsi lain?',
      },
      {
        id: 'p2',
        author: 'Anggota simulasi 05',
        at: '2026-11-15T20:02:00+07:00',
        text: 'Email kampus atau pendamping dari Simpul Wilayah bisa memverifikasi, lalu buktinya dibuang setelah akun aktif.',
      },
    ],
  },
  {
    id: 't-apbd',
    title: 'Format apa yang paling berguna untuk data APBD?',
    cat: 'Anggaran terbuka',
    posts: [
      {
        id: 'p1',
        author: 'Anggota simulasi 14',
        at: '2026-11-14T13:20:00+07:00',
        text: 'Saya usul CSV per program dan satu halaman ringkasan yang bisa dibaca orang yang tidak terbiasa dengan istilah anggaran.',
      },
    ],
  },
  {
    id: 't-jubir',
    title: 'Apakah masa jabatan juru bicara tiga bulan terlalu singkat?',
    cat: 'Organisasi',
    posts: [
      {
        id: 'p1',
        author: 'Anggota simulasi 09',
        at: '2026-11-13T16:45:00+07:00',
        text: 'Tiga bulan membuat tidak ada figur tunggal, tetapi juru bicara baru butuh waktu belajar. Bagaimana menjaga kesinambungan?',
      },
      {
        id: 'p2',
        author: 'Anggota simulasi 18',
        at: '2026-11-13T17:30:00+07:00',
        text: 'Serah terima tertulis dan pendampingan satu bulan oleh juru bicara sebelumnya mungkin cukup.',
      },
    ],
  },
];

export const aspCategories = [...forumCategories.slice(0, 3), 'Pengaduan integritas', 'Lainnya'];

// Aspirasi awal (data simulasi). base = jumlah dukungan awal.
export const aspSeed = [
  {
    id: 'a-komisi',
    title: 'Komisi aplikasi ojek online wajib dipublikasikan per perjalanan',
    cat: 'Kerja layak platform',
    author: 'Anggota simulasi 07',
    text: 'Pengemudi dan penumpang perlu tahu berapa persen dari setiap perjalanan yang menjadi komisi aplikasi.',
    base: 112,
    note: 'Melewati ambang 100 dukungan, masuk agenda Rembuk Pekanan #13.',
  },
  {
    id: 'a-apbd',
    title: 'Ringkasan APBD kota dalam CSV dan bahasa sederhana',
    cat: 'Anggaran terbuka',
    author: 'Anggota simulasi 14',
    text: 'Setiap program anggaran punya satu baris data dan satu paragraf penjelasan yang tidak memakai istilah teknis.',
    base: 64,
    note: 'Dikaji Kursi Kebijakan, jawaban tertulis dijanjikan dalam 7 hari.',
  },
  {
    id: 'a-literasi',
    title: 'Kelas literasi data pribadi untuk mahasiswa baru',
    cat: 'Hak digital',
    author: 'Anggota simulasi 21',
    text: 'Dua jam pengenalan pengaturan privasi, cara mengenali phishing, dan hak atas data pribadi.',
    base: 38,
  },
  {
    id: 'a-banding',
    title: 'Kanal banding untuk akun pengemudi yang dinonaktifkan sepihak',
    cat: 'Kerja layak platform',
    author: 'Anggota simulasi 12',
    text: 'Pengemudi mengisi satu formulir dan mendapat balasan tertulis beserta alasan dalam 7 hari kerja.',
    base: 19,
  },
  {
    id: 'a-pengamat',
    title: 'Rembuk Pekanan terbuka bagi simpatisan sebagai pengamat',
    cat: 'Organisasi',
    author: 'Anggota simulasi 03',
    text: 'Simpatisan boleh melihat jalannya pembahasan, tetapi tidak memegang hak suara.',
    base: 140,
    decided: true,
    note: 'Diputuskan pada Rembuk Pekanan #10 dan berlaku sejak Rembuk #11.',
  },
];

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
        'Hanya anggota aktif. Satu anggota satu suara, rahasia.',
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
        'Kotak suara dipisah dari daftar pemilih, sehingga pilihan tidak terhubung dengan identitas.',
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
      'Verifikasi anggota, masa tunggu 7 hari sebelum hak suara aktif, dan audit Komite Integritas. Pada simulasi ini satu perangkat bisa membuat banyak anggota demo, jadi hasilnya tidak mewakili sistem nyata.',
  },
  {
    title: 'Penyalahgunaan data',
    risk: 'Data anggota dipakai di luar tujuan atau jatuh ke pihak ketiga.',
    handling:
      'Data seminimal mungkin, hak hapus kapan saja, aturan platform dibuka untuk audit, dan kotak suara dipisah dari identitas.',
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

// ISI: ganti tanggal bertanda [..] dan tambahkan kegiatan nyata kelompok.
export const news = [
  {
    id: 'n-pameran',
    type: 'kegiatan',
    date: '[tanggal menyusul]',
    title: 'Pameran dan Workshop Partai Digital di FISIP Universitas Airlangga',
    text: 'Coba daftar, memilih, berdiskusi, dan mengajukan aspirasi langsung di stan Simpul. Lima sesi: pengenalan partai dan masalah politik, demo website dan membership, simulasi fitur partisipasi, media sosial dan keunggulan, serta tanya jawab dan refleksi.',
    featured: true,
  },
  {
    id: 'n-uji',
    type: 'berita',
    date: '[tanggal publikasi]',
    title: 'Platform partisipasi Simpul dibuka untuk uji coba',
    text: 'Voting, forum, dan aspirasi di halaman ini bisa dicoba tanpa akun. Semua data tersimpan di browser masing-masing dan bisa direset kapan saja.',
  },
  {
    id: 'n-donasi',
    type: 'berita',
    date: 'Data simulasi',
    title: 'Rembuk Pekanan #11: anggota menolak donasi dari perusahaan platform',
    text: '104 dari 164 suara memilih menolak seluruh donasi. Keputusan ditetapkan sebagai Kebijakan Pendanaan.',
  },
  {
    id: 'n-komisi',
    type: 'berita',
    date: 'Data simulasi',
    title: 'Aspirasi transparansi komisi aplikasi masuk agenda Rembuk',
    text: 'Usulan mencapai 112 dukungan, melewati ambang 100, sehingga wajib dibahas di Rembuk Pekanan #13.',
  },
  {
    id: 'n-medsos',
    type: 'kegiatan',
    date: '[tautan menyusul]',
    title: 'Enam konten pertama di media sosial',
    text: 'Pengenalan partai, dua konten edukasi isu, pengenalan kepemimpinan, ajakan mencoba website, dan satu konten interaktif.',
  },
];
