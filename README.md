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

- **Suara tidak rahasia di Spreadsheet.** Tab Voting menyimpan MemberID di samping Pilihan, jadi siapa pun dengan akses edit
  Spreadsheet bisa menelusuri pilihan tiap anggota. Sesuaikan teks "rahasia" dan "kotak suara dipisah" di situs bila memakai mode ini.
- **Endpoint publik.** Siapa pun yang tahu alamat Web App bisa mengirim data. MemberID acak dibuat server dan berfungsi sebagai kunci anggota.
- **Laporan forum hanya berlaku di perangkat itu.** Apps Script tidak punya tab moderasi.
- Tombol "Reset data" hanya mengosongkan data di perangkat itu, bukan Spreadsheet. "Hapus data saya" menghapus baris anggota di Spreadsheet
  dan menganonimkan namanya pada aspirasi dan forum.

Pengujian: `npm test` menjalankan 20 uji (aturan inti, integrasi dengan `Code.gs` memakai tiruan layanan Google, dan balapan antara
polling dan konfirmasi aksi). Skrip Code.gs di lingkungan Google sungguhan belum diuji otomatis dan perlu dicoba sekali setelah deploy.
