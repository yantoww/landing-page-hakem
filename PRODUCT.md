# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro (halaman statis) dengan pulau React hanya untuk fitur interaktif. CSS biasa, JavaScript tanpa TypeScript, font self-hosted.
Delegated: pengguna memilih "Framework (React/Astro/Next.js)" tanpa menyebut salah satunya. Astro dipilih karena keluarannya statis, bisa di-hosting gratis (Vercel, Netlify, GitHub Pages, Cloudflare Pages), dan JavaScript hanya dikirim untuk fitur partisipasi.

## Users

- Penguji (dosen mata kuliah Politik Digital, FISIP Universitas Airlangga): membuka tautan website aktif, mencari tujuh bagian wajib, mencoba fitur partisipasi, lalu menilai fungsi dan kebermaknaan demokrasi internal.
- Pengunjung pameran/workshop di area FISIP Unair (mahasiswa): mencoba daftar anggota, voting, forum, dan aspirasi selama beberapa menit di laptop atau ponsel.
- Audiens media sosial (mahasiswa dan anak muda yang datang dari konten Instagram/TikTok): ingin paham ini apa dan ikut mencoba.

Pekerjaan bersama: memahami partai fiktif dalam hitungan detik, menemukan tiap bagian yang diwajibkan, dan menguji fitur tanpa proses login yang berbelit.

## Product Purpose

Website partai politik digital fiktif untuk proyek akhir mata kuliah Politik Digital (kelompok 6 sampai 8 mahasiswa). Website berfungsi sebagai etalase (identitas, ideologi, struktur, agenda) sekaligus platform partisipasi yang bisa dicoba.
Keberhasilan: seluruh komponen poin 5 panduan terpenuhi dan mudah ditemukan; fitur partisipasi dapat diuji langsung; label "Simulasi Akademik — Bukan Partai Politik Resmi" selalu terlihat; demokrasi internal terasa bermakna (ada aturan yang mengubah suara menjadi keputusan), bukan sekadar tampilan digital.

## Positioning

Partai berbasis jejaring yang menuliskan aturan keputusannya secara terbuka: setiap fitur partisipasi punya ambang yang mengikat (kuorum, mayoritas, dukungan minimum agar aspirasi wajib dibahas), kepemimpinan kolektif bergilir dengan mekanisme penarikan mandat, dan data anggota seminimal mungkin. Pembeda ini yang dijawab penguji pada pertanyaan "apakah suara anggota memengaruhi keputusan".

## Operating Context

- Pameran/workshop di area FISIP Unair dengan lima kegiatan: pengenalan partai dan masalah politik; demo website dan membership; simulasi fitur partisipasi; media sosial dan keunggulan; tanya jawab dan refleksi. Dipakai di laptop/proyektor dan ponsel pengunjung.
- Bukti simulasi partisipasi (hasil voting, tangkapan layar forum, dokumentasi uji fitur) dikumpulkan memakai data simulasi.
- Panduan bagian G mewajibkan pengungkapan penggunaan AI dan melarang menyamar sebagai partai resmi, mengumpulkan data pribadi sensitif tanpa persetujuan, membeli followers, memakai bot, atau memanipulasi voting.
- Waktu pengerjaan 4 sampai 5 minggu; Website Developer menggabungkan konten dari peran lain.

## Capabilities and Constraints

- Wajib ada tujuh bagian: Home, About Us, Leadership & Membership, Political Agenda, Digital Participation, News & Activities, Contact & Social Media, dengan isi minimal sesuai poin 5.
- Panduan juga mensyaratkan isi dari poin 1 sampai 4 muncul di website: makna identitas, bagan organisasi, hak dan kewajiban, prosedur pemilihan pemimpin, tiga isu dengan lima atribut, tiga mekanisme partisipasi (hak akses, prosedur keputusan, moderasi, transparansi hasil, perlindungan data).
- Data voting, forum, dan aspirasi disimpan di browser pengguna (localStorage). Tanpa server dan akun; hasil tidak digabung antar perangkat (keputusan pengguna). Perlu tombol reset untuk demo.
- Formulir pendaftaran hanya meminta nama panggilan, kelompok yang diwakili, minat isu, dan persetujuan eksplisit. Tidak meminta email, NIK, alamat, atau nomor telepon.
- Belum diputuskan: tanggal pameran, akun media sosial proyek, nama anggota yang mengisi kursi pengurus, alamat kontak resmi kelompok.

## Brand Commitments

Belum ada. Pengguna mendelegasikan identitas ("Belum, usulkan identitas lengkap"). Claude mengusulkan nama "Partai Simpul" (jaringan warga digital) beserta slogan, warna, dan logo; seluruhnya boleh diganti.

## Evidence on Hand

- Panduan Project Politik Digital 2026 Nov (PDF).
- Tidak ada logo, akun media sosial, nama anggota kelompok, tanggal pameran, atau data nyata. Jangan dikarang tanpa penanda.
- Data demonstrasi (suara, aspirasi, forum) bersifat sintetis dan diberi label simulasi di tempat ia tampil. Nama pengisi kursi pengurus ditulis sebagai placeholder yang jelas.

## Product Principles

1. Setiap fitur partisipasi menyatakan aturan yang mengubah masukan menjadi keputusan, karena penilaian menolak partisipasi simbolis.
2. Simulasi harus terbaca sebagai simulasi di tempat data atau tokoh itu muncul, bukan hanya di footer.
3. Dapat diuji dalam satu menit tanpa akun, dengan jalur cepat anggota demo dan tombol reset.
4. Data seminimal mungkin dan tidak keluar dari browser.
5. Akui risiko (dominasi pemimpin, manipulasi voting, penyalahgunaan data, kesenjangan akses) beserta mitigasinya di tempat yang relevan.

## Accessibility & Inclusion

Target WCAG AA. Seluruh fitur dapat dipakai dengan keyboard. Pengunjung pameran banyak memakai ponsel dan sebagian melihat lewat proyektor, jadi tata letak mobile dan kontras tinggi diutamakan. Bahasa Indonesia sederhana; status tidak boleh bergantung pada warna saja.
