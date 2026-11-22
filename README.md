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
- Angka awal (240 anggota aktif simulasi, 71 suara awal, aspirasi dan utas contoh) adalah data simulasi dan diberi label di halaman.
- Ambil tangkapan layar hasil voting, forum, dan aspirasi sebagai bukti simulasi partisipasi.

## Berkas penyerta

Proposal, slide, paket media sosial, bukti simulasi, dan daftar kontribusi ada di folder `deliverables/`. Daftar isi dan hal yang harus dilengkapi tim ada di `deliverables/README.md`.
