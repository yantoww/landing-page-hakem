---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: []
---

# Surface brief: halaman utama Partai Simpul

## Scope and mode

Satu halaman (landing) dengan tujuh stasiun wajib poin 5. Mode: Persuade, dengan zona uji fitur partisipasi yang bekerja. Dial: ENERGY 2 / RHYTHM 3 / MOTION 3.

## Motion thesis

Focal moment: pembukaan hero (judul dibuka per baris dari kiri, kartu suara keluar seperti karcis, lalu tiga jalur digambar dan stasiun disinggahi berurutan sampai simpul beriak) dan counterpart interaktifnya: setiap aksi anggota mengirim token sinyal lewat jalurnya (A aspirasi, F forum, S suara) ke simpul; suara yang melengkapi kuorum melanjutkan token ke terminus dan menyalakan stasiun "Keputusan ditetapkan".
Continuity: strip nav terisi dari kiri dan titik mendarat di stasiun baru; bullet judul bagian bersandar sekali; rel utama menyala di bagian yang sudah dilewati; garis rute dan bagan digambar saat dicapai; garis tab meluncur ke jalur terpilih.
Feedback: batang hasil dan meter kuorum tumbuh, angka dukungan berganti dengan tick, kartu anggota terbit dengan strip jalur, sapuan sinyal pada garis tab.
Budget: hanya transform, opacity, clip-path, stroke-dashoffset; tanpa loop abadi; tanpa listener scroll (IntersectionObserver); teks tidak pernah disembunyikan; prefers-reduced-motion mematikan gerak tetapi mempertahankan keadaan (rel menyala, stasiun keputusan, hasil).

## Audience, job, action

Penguji dan pengunjung pameran FISIP Unair serta audiens media sosial. Tugas mereka: paham dalam hitungan detik bahwa ini partai fiktif yang keputusannya ditentukan anggota, mencoba memberi suara tanpa pendaftaran panjang, menemukan tujuh bagian wajib, dan menguji forum serta aspirasi. Aksi utama: memberi suara pada Rembuk yang sedang berlangsung dan mendaftar sebagai anggota simulasi.

## Direction contract

THESIS: Halaman ini adalah peta jalur. Tiga jalur (Aspirasi, Forum, Suara) bertemu di satu simpul tempat masukan anggota menjadi keputusan yang ditetapkan, dan aturan konversinya tercetak di papan petunjuk. Menolak: situs partai generik dengan hero foto, tiga kartu pilar, dan angka statistik.

OWN-WORLD: Papan petunjuk transit. Putih papan kebiruan dan nila pekat sebagai bidang penuh, garis jalur tebal dengan tikungan 45 derajat, lencana jalur huruf A, F, S, stasiun berupa lingkaran bercincin, satu warna aksi kunyit khusus tindakan utama, huruf rambu Overpass, kartu anggota meniru kartu komuter, risiko dan penanganan ditulis sebagai informasi gangguan. Area baca terang untuk laptop dan aula yang terang; hero, ruang partisipasi, dan penutup berupa bidang nila penuh.

STORY: Pengunjung melihat judul dan Peron Suara yang bisa dipakai di layar pertama, memberi suara, lalu melihat kuorum, aturan, dan hasilnya berubah. Ia menjelajah tujuh stasiun yang sama dengan halaman wajib, dan keluar yakin bahwa suara anggota punya konsekuensi tertulis.

FIRST VIEWPORT: Pita label wajib kunyit di atas, bar navigasi peta jalur dengan tujuh stasiun, lalu hero nila. Kiri: judul besar, satu paragraf, aksi "Daftar anggota simulasi". Kanan: Peron Suara, kartu pemungutan suara yang bekerja. Bagian bawah layar pertama: peta horizontal tiga jalur yang bertemu di stasiun Simpul dan berujung di terminus "Keputusan ditetapkan".

FORM: Jalur Simpul (peta transit), posisi 1 pada daftar saya (kartu pick; indeks yang dibagikan dadu adalah 4), seed:7ffde6c276b551a6.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved decisions

Tanggal pameran, akun media sosial proyek, nama pengisi kursi pengurus, dan alamat kontak kelompok masih placeholder yang harus diisi tim.
