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
  tagline: 'Politik yang ikut Anda tentukan.',
  // Label wajib dari panduan. Satu-satunya em dash di situs ini.
  label: 'Simulasi Akademik — Bukan Partai Politik Resmi',
  course: 'Proyek akhir mata kuliah Politik Digital 2026',
  campus: 'FISIP Universitas Airlangga',
};

// Lokasi pameran. Koordinat gedung FISIP diambil dari data OpenStreetMap.
export const venue = {
  name: 'FISIP Universitas Airlangga',
  address: 'Jl. Dharmawangsa Dalam, Airlangga, Kecamatan Gubeng, Surabaya, Jawa Timur 60286',
  lat: -7.27203,
  lon: 112.75942,
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
    use: 'Konten edukasi isu, pengenalan kepemimpinan, dan ajakan mencoba situs.',
  },
  {
    name: 'TikTok',
    handle: '@partaisimpul',
    href: 'https://www.tiktok.com/@partaisimpul',
    use: 'Video pendek pengenalan partai dan konten interaktif.',
  },
];

export const groups = [
  'Mahasiswa atau pelajar',
  'Pekerja platform (pengemudi daring, kurir, pekerja lepas, kreator konten)',
  'Pelaku UMKM digital',
  'Pekerja formal',
  'Lainnya',
];

// ISI: name diisi nama anggota kelompok yang memegang jabatan. Biarkan null bila belum ada.
// Pengurus harian Dewan Pimpinan Pusat. role = peran dalam pembagian kerja proyek (panduan bagian C).
export const executives = [
  {
    seat: 'Ketua Umum',
    role: 'Political Strategist / Party Leader',
    duty: 'Memimpin rapat pimpinan dan menjalankan keputusan Rembuk bersama pengurus lain. Tidak memiliki hak veto.',
    name: null,
  },
  {
    seat: 'Wakil Ketua Umum',
    duty: 'Membantu Ketua Umum, menggantikannya bila berhalangan, dan memantau tindak lanjut keputusan Rembuk.',
    name: null,
  },
  {
    seat: 'Sekretaris Jenderal',
    role: 'Project Coordinator',
    duty: 'Mengurus administrasi, notulen Rembuk, dokumentasi, dan penggabungan laporan.',
    name: null,
  },
  {
    seat: 'Bendahara Umum',
    duty: 'Mengelola keuangan partai dan membuka laporan anggaran setiap kegiatan kepada anggota.',
    name: null,
  },
];

export const divisions = [
  {
    seat: 'Ketua Bidang Kebijakan',
    role: 'Policy Researcher',
    duty: 'Menyusun kajian tiga agenda dan menjawab aspirasi yang mencapai 25 dukungan dalam 7 hari.',
    name: null,
  },
  {
    seat: 'Ketua Bidang Keanggotaan dan Partisipasi',
    role: 'Membership & Participation Designer',
    duty: 'Merancang pendaftaran, pemungutan suara, dan forum, serta mengoordinasikan relawan moderator.',
    name: null,
  },
  {
    seat: 'Ketua Bidang Platform dan Data',
    role: 'Website Developer',
    duty: 'Membangun dan merawat situs serta membatasi pengumpulan data anggota seperlunya.',
    name: null,
  },
  {
    seat: 'Ketua Bidang Media dan Kreatif',
    role: 'Social Media Strategist, Creative & Content Designer',
    duty: 'Mengelola akun media sosial, kalender konten, dan identitas visual.',
    name: null,
  },
];

export const bodies = [
  {
    body: 'Komite Integritas dan Data',
    role: 'Governance & Evaluation',
    duty: 'Merumuskan pertanyaan Rembuk secara netral, mengaudit pemungutan suara, menangani pengaduan, dan menegakkan perlindungan data. Anggotanya tidak boleh merangkap sebagai pengurus.',
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
      'Melalui Peta Tarif Warga, pekerja melaporkan tarif per perjalanan secara anonim sehingga datanya dapat dibandingkan. Petisi digital dan Rembuk khusus pekerja platform menentukan tuntutan yang didahulukan.',
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
      'Kewajiban memublikasikan APBD dalam format terbuka (CSV) beserta ringkasan berbahasa sederhana.',
      'Alokasi sebagian belanja modal untuk anggaran partisipatif yang diputuskan lewat pemungutan suara warga.',
      'Setiap usulan warga memiliki status dan alasan keputusan yang dapat dilihat publik.',
    ],
    digital:
      'Partai Simpul lebih dahulu menerapkannya pada diri sendiri. Anggaran partai dibuka per kegiatan dan anggota memutuskan pos kegiatan melalui Rembuk. Pelacak aspirasi di situs ini memakai alur status yang sama.',
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
      'Platform, instansi, dan tim kampanye politik mengumpulkan data pribadi warga dalam jumlah besar. UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi sudah ada, tetapi warga perlu kepastian lembaga pengawas yang independen dan sanksi yang ditegakkan. Pembayar iklan politik yang menargetkan kelompok tertentu juga sulit dilacak.',
    affected:
      'Pengguna media sosial, pemilih pemula, lansia dan warga dengan literasi digital rendah, serta pegiat dan jurnalis.',
    solutions: [
      'Mendorong lembaga pengawas pelindungan data yang independen, berdaya, dan melapor secara terbuka.',
      'Registri publik iklan politik daring yang memuat pembayar, jumlah dana, dan kelompok sasaran.',
      'Program literasi digital dan cek fakta di kampus dan komunitas.',
    ],
    digital:
      'Dalam Cek Fakta Warga, anggota menandai klaim yang perlu diperiksa dan relawan terlatih memverifikasinya dengan sumber terbuka. Platform Simpul juga memberi contoh dengan mengumpulkan data seperlunya, mengizinkan akun dihapus kapan saja, dan membuka aturannya untuk diaudit.',
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
      'Bagaimana sikap Partai Simpul terhadap iklan politik daring yang menargetkan kelompok pemilih tertentu?',
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
        'Pengunjung dapat membaca. Anggota dapat mengajukan usulan dan memberi satu dukungan untuk setiap usulan.',
        'Pengunjung dapat membaca. Anggota dapat menulis dan membalas. Relawan moderator meninjau laporan.',
        gas
          ? 'Hanya anggota aktif. Satu anggota satu suara, dicatat dengan nomor anggota acak tanpa nama.'
          : 'Hanya anggota aktif. Satu anggota satu suara, rahasia.',
      ],
    },
    {
      label: 'Prosedur keputusan',
      cells: [
        'Usulan dengan 25 dukungan dikaji Bidang Kebijakan dalam 7 hari. Usulan dengan 100 dukungan wajib masuk agenda Rembuk Pekanan berikutnya.',
        'Forum tidak mengambil keputusan. Forum menyusun pertimbangan, dan ringkasan diskusinya dilampirkan pada usulan yang masuk Rembuk.',
        'Sah apabila kuorum 30% anggota aktif terpenuhi dan satu opsi unggul. Perubahan statuta memerlukan dua pertiga suara.',
      ],
    },
    {
      label: 'Moderasi',
      cells: [
        'Kata kasar ditolak sebelum terkirim. Moderator meninjau usulan ganda dan ujaran kebencian.',
        'Aturan forum tertulis. Unggahan yang dilaporkan disembunyikan sementara. Moderator memutuskan dalam 24 jam dan mencatat keputusannya.',
        'Komite Integritas merumuskan pertanyaan secara netral. Kampanye untuk suatu opsi hanya boleh dilakukan di forum.',
      ],
    },
    {
      label: 'Transparansi hasil',
      cells: [
        'Jumlah dukungan dan status dapat dilihat langsung. Alasan setiap keputusan dipublikasikan.',
        'Catatan moderasi dan jumlah laporan dipublikasikan setiap bulan.',
        'Partisipasi dan kuorum dapat dilihat langsung. Hasil setiap opsi dapat dilihat oleh pemilih dan, setelah ditutup, oleh semua orang. Komite Integritas kemudian mengauditnya.',
      ],
    },
    {
      label: 'Perlindungan data',
      cells: [
        'Memakai nama panggilan. Penulis boleh memilih tampil anonim.',
        'Memakai nama panggilan tanpa pelacak lintas situs.',
        gas
          ? 'Catatan suara memakai nomor anggota acak, bukan nama. Hanya pengelola Google Spreadsheet yang dapat melihat pilihan setiap nomor.'
          : 'Kotak suara dipisahkan dari daftar pemilih sehingga pilihan tidak terhubung dengan identitas.',
      ],
    },
  ],
};

export const risks = [
  {
    title: 'Dominasi pemimpin (hyperleadership)',
    risk: 'Seorang tokoh, termasuk Ketua Umum, menjadi satu-satunya wajah partai sehingga agenda mengikuti tokoh, bukan keputusan anggota.',
    handling:
      'Kepemimpinan kolektif kolegial tanpa hak veto, juru bicara bergilir setiap tiga bulan, masa jabatan paling lama dua periode berturut-turut, dan penarikan mandat apabila diminta 10% anggota.',
  },
  {
    title: 'Manipulasi voting',
    risk: 'Akun ganda atau pendaftaran massal menjelang pemungutan suara dapat mengubah hasil.',
    handling:
      gas
        ? `Anggota diverifikasi dan menunggu 7 hari sebelum memiliki hak suara, lalu hasilnya diaudit Komite Integritas. Dalam simulasi ini anggota demo hanya sementara. Suara dan tulisannya dihapus setelah selesai atau setelah ${DEMO_TTL_MIN} menit. Hasilnya tetap tidak mewakili sistem nyata.`
        : 'Anggota diverifikasi dan menunggu 7 hari sebelum memiliki hak suara, lalu hasilnya diaudit Komite Integritas. Dalam simulasi ini satu perangkat dapat membuat banyak anggota demo sehingga hasilnya tidak mewakili sistem nyata.',
  },
  {
    title: 'Penyalahgunaan data',
    risk: 'Data anggota dipakai di luar tujuan atau jatuh ke tangan pihak ketiga.',
    handling:
      gas
        ? 'Data dikumpulkan seperlunya dan dapat dihapus kapan saja, aturan platform dibuka untuk diaudit, dan catatan suara hanya memakai nomor anggota acak.'
        : 'Data dikumpulkan seperlunya dan dapat dihapus kapan saja, aturan platform dibuka untuk diaudit, dan kotak suara dipisahkan dari identitas.',
  },
  {
    title: 'Ketimpangan akses',
    risk: 'Anggota tanpa perangkat, sinyal, atau kemampuan digital tertinggal dari proses keputusan.',
    handling:
      'Tampilan situs dibuat ringan, pengurus wilayah menyediakan titik akses dan pendamping, dan pemungutan suara dibuka selama 3 hari.',
  },
  {
    title: 'Partisipasi simbolis',
    risk: 'Suara dikumpulkan tetapi tidak mengubah keputusan.',
    handling:
      'Kuorum, suara terbanyak, dan ambang 100 dukungan bersifat mengikat, disertai batas waktu tindak lanjut dan laporan kepatuhan setiap bulan.',
  },
];

// ISI: tambahkan kegiatan nyata kelompok bila ada. image: berkas di folder public/.
export const news = [
  {
    id: 'n-pameran',
    type: 'kegiatan',
    date: '27 November 2026',
    title: 'Pameran dan Lokakarya Partai Digital di FISIP Universitas Airlangga',
    text: 'Pengunjung stan Partai Simpul dapat mendaftar, memilih, berdiskusi, dan mengajukan aspirasi. Kegiatan terdiri atas lima sesi, yaitu pengenalan partai dan masalah politik, demonstrasi situs dan keanggotaan, simulasi fitur partisipasi, media sosial dan keunggulan partai, serta tanya jawab dan refleksi.',
    image: 'news/pameran.webp',
    featured: true,
  },
  {
    id: 'n-uji',
    type: 'berita',
    date: '27 November 2026',
    title: 'Platform partisipasi Partai Simpul dibuka untuk uji coba',
    text: 'Pemungutan suara, forum, dan aspirasi dapat dicoba dengan mendaftar sebagai anggota simulasi atau masuk sebagai anggota demo. Data yang Anda kirim dapat dihapus kapan saja.',
    image: 'news/uji-coba.webp',
  },
  {
    id: 'n-medsos',
    type: 'kegiatan',
    date: '27 November 2026',
    title: 'Enam konten media sosial Partai Simpul',
    text: 'Konten yang disiapkan mencakup pengenalan partai, dua konten edukasi isu, pengenalan kepemimpinan, ajakan mencoba situs, dan satu konten interaktif.',
    image: 'news/media-sosial.webp',
  },
];
