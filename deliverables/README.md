# Berkas penyerta proyek Partai Simpul

Simulasi Akademik — Bukan Partai Politik Resmi

Folder ini memuat lima luaran di luar website: proposal, slide, media sosial, bukti simulasi, dan daftar kontribusi. Website ada di folder induk (lihat `README.md` di sana).

## Isi

| Folder | Berkas | Format | Keterangan |
|---|---|---|---|
| `proposal/` | `Proposal-Partai-Simpul.docx`, `.pdf` | DOCX untuk diedit, PDF untuk dikumpulkan | 8 halaman A4 (ketentuan 5 sampai 8). `gambar/` berisi diagram identitas dan bagan organisasi. |
| `slides/` | `Presentasi-Partai-Simpul.pptx` | PPTX | 12 slide (ketentuan maksimal 12), dengan catatan pembicara di tiap slide. |
| `media-sosial/` | `strategi-dan-konten.md`, folder `gambar/` | Markdown dan PNG | Strategi, enam konten (21 gambar), caption, teks alternatif, jadwal, naskah TikTok, dan log posting. |
| `bukti-simulasi/` | `Bukti-Simulasi-Partisipasi.docx`, `.pdf`, `hasil-uji.json`, `tangkapan/` | DOCX, PDF, JSON, PNG | 12 skenario uji, semuanya lulus pada 22 November 2026. |
| `kontribusi/` | `Daftar-Kontribusi-Anggota.docx` | DOCX | Tabel peran dan kontribusi untuk diisi anggota. |

## Yang harus dilengkapi tim sebelum dikumpulkan

Tidak ada satu pun dari daftar ini yang bisa dikerjakan oleh asisten AI, dan sengaja tidak dikarang.

1. **Nomor kelompok dan nama anggota** di sampul proposal, slide 1, dan daftar kontribusi (cari teks `[isi`).
2. **Daftar kontribusi.** Isi kontribusi nyata setiap anggota dan bukti pendukungnya. Rencana peran sudah terisi, tetapi itu rencana, bukan catatan siapa yang mengerjakan.
3. **Publikasikan website** dan isi tautannya di slide 8, bio media sosial, dan proposal bila perlu. Panduan ada di `README.md` induk.
4. **Buat akun Instagram dan TikTok, lalu unggah konten** sesuai `media-sosial/strategi-dan-konten.md`. Isi log posting di bagian 7 dokumen itu. Konten baru dihitung terpublikasi setelah benar-benar diunggah.
5. **Periksa isi dengan bahan kuliah.** Terutama istilah "connective party" di proposal bagian 7.3: definisinya ditandai sebagai arti kerja karena tidak ditemukan definisi baku di sumber utama yang dipakai. Cocokkan dengan bahan dosen, lalu ubah bila perlu.
6. **Coba semua fitur di perangkat sendiri** dan tambahkan uji pengguna nyata di tabel kosong pada dokumen Bukti Simulasi bila ada.
7. **Isi nama Dewan Rembuk dan Komite Integritas** serta tautan sosial di `src/data/site.js` (kolom bernilai `null` atau kosong), lalu bangun ulang website.

## Catatan kejujuran isi

- Semua angka hasil (240 anggota aktif, 71 suara awal, 77 suara setelah uji, aspirasi dan utas contoh) adalah **data simulasi**. Dokumen bukti menjelaskan bahwa anggota demo dibuat oleh skrip uji.
- Angka pada bagian "target" proposal dan konten media sosial adalah **target kebijakan**, bukan hasil.
- Slide tidak bisa dirender oleh PowerPoint asli di mesin tempat berkas ini dibuat. Tata letak diperiksa dengan pratinjau perkiraan memakai font Arial. **Buka PPTX di PowerPoint atau Google Slides dan periksa sekali sebelum presentasi.**
- Pengujian hanya di Microsoft Edge. Safari dan Firefox belum diuji.
- Desain, kode, dan draf dibantu AI (Claude, Anthropic). Pengungkapan lengkap ada di proposal dan daftar kontribusi.

## Membuat ulang berkas

Gambar media sosial, diagram, dan dokumen dibuat dengan skrip pembantu yang tidak disertakan di repositori ini. Edit langsung berkas DOCX dan PPTX untuk perubahan teks. Gambar PNG dapat diganti dengan hasil desain ulang bila dibutuhkan.
