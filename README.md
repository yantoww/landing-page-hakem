# Partai Simpul (simulasi akademik)

Website partai digital fiktif untuk proyek akhir Politik Digital. Dibuat dengan Astro; React hanya dipakai untuk fitur yang bisa dicoba (voting, forum, aspirasi, pendaftaran). Semua data tersimpan di browser (localStorage), tanpa server.

## Menjalankan

```
npm install
npm run dev      # http://localhost:4321
npm run build    # hasil statis di dist/
npm test         # uji aturan satu anggota satu suara, kuorum, dukungan aspirasi
```

## Yang wajib diisi tim sebelum dikumpulkan

Semua isi ada di `src/data/site.js` kecuali yang disebut lain.

1. `social`: akun Instagram/TikTok proyek. Isi `handle` dan `href` (URL lengkap). Selama `href` kosong, kartunya tampil sebagai placeholder berlabel, bukan tautan.
2. `council` dan `bodies`: isi `name` dengan nama anggota kelompok pemegang kursi. Kolom "Peran proyek" sudah memetakan peran di panduan.
3. `news`: ganti tanggal bertanda `[...]` dan tambahkan kegiatan nyata kelompok.
4. `src/components/Contact.astro`: pastikan pengungkapan penggunaan AI sesuai kenyataan.

Mengganti identitas: Find & Replace `Simpul`; warna di `:root` pada `src/styles/global.css`; logo di `public/logo.svg` dan `public/favicon.svg`.

## Publikasi (supaya "website aktif" bisa dibuka penguji)

- Vercel, Netlify, atau Cloudflare Pages: hubungkan repositori, build command `npm run build`, folder output `dist`.
- GitHub Pages: tambahkan `base: '/nama-repo'` di `astro.config.mjs`, lalu publikasikan isi `dist`.

## Efek dan gerak

Satu tema: sinyal berjalan di jalur menuju simpul. Hero dibuka berurutan, aksi (memilih, mendukung, membalas) mengirim token lewat jalurnya di peta, dan suara yang melengkapi kuorum menyalakan stasiun "Keputusan ditetapkan". Rel, rute, dan bagan digambar saat dicapai. Semua gerak mengikuti pengaturan "kurangi gerakan" di sistem pengguna, dan teks tidak pernah disembunyikan oleh animasi.

- Mematikan semua efek gulir: hapus `import '../lib/motion.js'` di `src/layouts/Base.astro`.
- Menurunkan efek lain: blok `GERAK` di akhir `src/styles/global.css` (semuanya ada di dalam `prefers-reduced-motion: no-preference`).

## Untuk pameran dan bukti simulasi

- Tombol "Reset data simulasi" (bagian Digital Participation) menghapus data di perangkat itu.
- Data awal voting, aspirasi, forum, dan anggota aktif dimulai dari 0. Data yang ditambahkan pengguna disimpan di browser masing-masing.
- Ambil tangkapan layar hasil voting, forum, dan aspirasi sebagai bukti simulasi partisipasi.

## Berkas penyerta

Proposal, slide, paket media sosial, bukti simulasi, dan daftar kontribusi ada di folder `deliverables/`. Daftar isi dan hal yang harus dilengkapi tim ada di `deliverables/README.md`.

## Menyimpan data di Google Spreadsheet (opsional)

Tanpa pengaturan apa pun, situs berjalan sendiri dan menyimpan data di browser masing-masing. Untuk pameran, data bisa
dibagi lewat Google Spreadsheet sehingga angka anggota, hasil voting, aspirasi, dan forum tampil sama di semua perangkat.

1. Pasang `google-apps-script/Code.gs` sebagai Web App (langkahnya ada di komentar atas berkas itu dan di balasan penyusunnya:
   buka Spreadsheet, Extensions > Apps Script, tempel kode, jalankan `setup`, lalu Deploy > Web app dengan akses Anyone).
2. Salin alamat Web App yang berakhiran `/exec`.
3. Lokal: salin `.env.example` menjadi `.env` dan isi `VITE_GAS_WEBAPP_URL=<alamat tadi>`. Vercel: Project Settings >
   Environment Variables, tambahkan `VITE_GAS_WEBAPP_URL` untuk Production dan Preview.
4. Build ulang (`npm run build`). Nilainya tertanam saat build, jadi mengubahnya selalu butuh build ulang.

Perilaku bila variabel terisi:

- Pendaftaran menunggu server memberi MemberID, lalu kartu tampil dan tersimpan di localStorage agar sesi bertahan saat refresh.
- Suara, aspirasi, dukungan, dan komentar langsung tampil di layar, lalu dikirim di latar belakang. Bila server menolak, tampilannya
  dibatalkan dan pesan tampil.
- Data dibaca ulang tiap 10 detik tanpa memuat ulang halaman (berhenti saat tab tersembunyi). Bila koneksi putus, data terakhir tetap
  tampil dan muncul penanda.
- Semua POST memakai `Content-Type: text/plain;charset=utf-8` agar browser tidak mengirim preflight CORS yang tidak didukung Apps Script.

Yang perlu diketahui:

- **Suara tidak sepenuhnya rahasia di Spreadsheet.** Tab Voting menyimpan MemberID acak (bukan nama) di samping Pilihan, jadi siapa
  pun dengan akses edit Spreadsheet bisa melihat pilihan per ID. Teks di situs otomatis menyesuaikan ("tanpa nama", bukan "rahasia").
  Batasi akses edit Spreadsheet.
- **Anggota demo bersifat sementara.** "Beri suara sebagai anggota demo" dan "Coba sebagai anggota demo" membuat anggota dengan
  kelompok `Anggota demo`. Tombol "Selesai dan hapus data demo" menghapus **semua** jejaknya di Spreadsheet (suara, dukungan,
  aspirasi, komentar, dan baris anggotanya), dan server membersihkan sendiri yang lebih tua dari 30 menit (`DEMO_TTL_MIN` di
  `Code.gs` dan `site.js`). Pembersihan dipicu permintaan, tanpa trigger. Karena itu demo berulang tidak menumpuk suara. Anggota
  yang mendaftar lewat formulir tidak terpengaruh: suaranya tetap sebagai jejak tanpa nama setelah hak hapus.
- **Endpoint dibatasi.** `Code.gs` hanya menerima topik voting `rembuk-12` dan opsinya (`CONFIG.VOTING_OPTIONS`). Bila menambah Rembuk
  baru di `site.js`, tambahkan juga di `Code.gs`, lalu deploy versi baru. Endpoint tetap publik: siapa pun yang tahu alamatnya bisa
  mengirim data, dan MemberID acak berfungsi sebagai kunci anggota.
- **Laporan forum hanya berlaku di perangkat itu.** Apps Script tidak punya tab moderasi.
- Di produksi tidak ada tombol "Reset data" (hanya muncul di `npm run dev`). "Hapus data saya" menghapus baris anggota di
  Spreadsheet dan menganonimkan namanya pada aspirasi dan forum.
- Setiap perubahan `Code.gs` baru berlaku setelah ditempel ke editor Apps Script dan di-deploy sebagai versi baru.

Pengujian: `npm test` menjalankan 27 uji (aturan inti, integrasi dengan `Code.gs` memakai tiruan layanan Google termasuk anggota demo
sementara dan kedaluwarsa, dan balapan antara polling dan konfirmasi aksi). Perilaku `Code.gs` di Google sungguhan perlu dicoba sekali
setelah setiap deploy.
