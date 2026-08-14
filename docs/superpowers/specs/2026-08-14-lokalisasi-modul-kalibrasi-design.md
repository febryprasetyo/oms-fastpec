# Desain Lokalisasi dan Penyelarasan Laporan Kalibrasi

## Tujuan

Menjadikan seluruh antarmuka modul kalibrasi, halaman verifikasi, preview cetak, dan PDF unduhan konsisten dalam bahasa Indonesia profesional. Tanggal dan angka ditampilkan dengan konvensi penulisan Indonesia, tanpa mengubah nilai numerik maupun kontrak data API.

## Cakupan

Perubahan mencakup:

- daftar, pembuatan, penyuntingan, detail, preview, dan tindakan pada modul kalibrasi;
- formulir parameter, koefisien, sampel air, serta catatan;
- pesan validasi, konfirmasi, notifikasi, status, keadaan kosong, dan keadaan pemuatan;
- halaman verifikasi publik;
- tampilan cetak, nama berkas unduhan, dan template/generator PDF;
- formatter tanggal, rentang tanggal, angka desimal, nilai standar/CRM, satuan, tempat, dan status.

Nama internal program, nama properti API, rute, payload, dan nilai status dari server tidak diterjemahkan. Singkatan ilmiah dan satuan baku seperti CRM, pH, DO, COD, BOD, TSS, Amonia. Nitrat dan Nitrit (jangan gunakan singkatan seperti no3, Nh3-n) mg/L, NTU, mV, dan °C tetap digunakan.

## Aturan Bahasa dan Istilah

Semua teks yang terlihat oleh pengguna memakai bahasa Indonesia profesional. Istilah utama diseragamkan sebagai berikut:

| Istilah lama | Istilah tampilan |
| --- | --- |
| Calibration Report | Laporan Kalibrasi |
| Report No | Nomor Laporan |
| Station / Station Name | Stasiun / Nama Stasiun |
| Calibration Date | Tanggal Kalibrasi |
| Address | Alamat |
| Coordinate | Koordinat |
| Standard / CRM atau Standart / CRM | Standar/CRM |
| Calibration Result | Hasil Kalibrasi |
| Reading Result | Hasil Pembacaan |
| Internal Coeff | Koefisien Internal |
| Result | Status |
| Water Sample Measurement & Blank Test | Pengukuran Sampel Air dan Uji Blangko |
| Sample Type | Jenis Sampel |
| Notes | Catatan |
| Place / Date | Tempat/Tanggal |
| Calibration Officer | Petugas Kalibrasi |
| Print | Cetak |
| Download PDF | Unduh PDF |
| Draft / Submitted / Approved | Draf / Diajukan / Disetujui |
| PASS / FAILED / PENDING | Lulus / Tidak Lulus / Menunggu |

Istilah teknis yang berasal dari data master tidak diterjemahkan secara bebas. Label buatan aplikasi seperti `Water Sample (River #1)` diubah menjadi `Sampel Air (Sungai 1)`.

## Formatter Bersama

`src/lib/calibration-format.ts` menjadi satu-satunya sumber format presentasi kalibrasi. Modul ini menyediakan fungsi murni yang dapat digunakan oleh komponen React dan generator PDF:

- tanggal lengkap Indonesia: `12 Agustus 2026`;
- rentang dalam bulan dan tahun yang sama: `10–12 Agustus 2026`;
- rentang lintas bulan/tahun tetap menampilkan bagian yang diperlukan agar tidak ambigu;
- angka pengukuran dengan koma desimal dan dua angka di belakang koma: `0,00`, `5,40`;
- nilai kosong sebagai `-` pada laporan dan sebagai string kosong pada input;
- label standar/CRM beserta satuan dengan angka terlokalisasi;
- normalisasi nama tempat tanpa awalan administratif `Kabupaten` atau `Kota` untuk blok tanda tangan;
- pemetaan status API ke label bahasa Indonesia.

Parsing tanggal berbentuk `YYYY-MM-DD` dilakukan sebagai tanggal kalender lokal, bukan melalui konversi UTC, agar tanggal tidak bergeser karena zona waktu. Nilai angka tetap dikirim ke API menggunakan format numerik standar JSON; koma hanya dipakai pada tampilan.

## Konsistensi Preview dan PDF

Preview dan generator PDF menggunakan formatter bersama dan aturan konten yang sama. Keduanya harus menghasilkan contoh berikut untuk data yang sama:

- Tempat/Tanggal: `Morowali Utara, 12 Agustus 2026`;
- Tanggal Kalibrasi: `10–12 Agustus 2026`;
- Standar/CRM: `0,00 mg/L`.

Tanggal tanda tangan selalu berasal dari tanggal akhir kalibrasi. Nilai standar berasal dari `standardValue`; nama standar dipakai sebagai cadangan jika nilai tidak tersedia. Nilai CRM dan hasil pembacaan tidak boleh kehilangan presisi tampilan yang telah ditetapkan.

Unduhan saat ini memanggil `GET /api/calibrations/{id}/print`. Implementasi harus memeriksa generator yang benar-benar melayani endpoint ini. Jika endpoint dirender di backend, template/generator backend harus memakai aturan identik; perubahan frontend saja tidak dianggap selesai. Kontrak endpoint, payload, respons PDF, QR verifikasi, dan penanganan kesalahan tetap dipertahankan.

## Formulir dan Halaman Verifikasi

Label, bantuan, tombol editor, konfirmasi, toast, serta status pada formulir diterjemahkan tanpa mengubah nama field atau skema validasi. Elemen input bertipe tanggal tetap memakai kontrol tanggal bawaan peramban, sementara nilai tanggal yang disajikan sebagai teks memakai formatter bersama.

Input angka tetap dapat menghasilkan nilai numerik valid untuk API. Pemakaian koma pada input tidak boleh menyebabkan nilai tersimpan sebagai string yang salah; bila kontrol `type="number"` tidak mendukung koma pada peramban tertentu, lokalisasi koma diterapkan pada tampilan laporan, bukan dengan merusak perilaku input numerik.

Halaman verifikasi publik memakai istilah dan formatter yang sama agar sertifikat yang dipindai konsisten dengan preview dan PDF.

## Penanganan Kesalahan

- Nilai tanggal tidak valid ditampilkan apa adanya sebagai fallback dan tidak membuat halaman gagal dirender.
- Nilai angka kosong ditampilkan sebagai `-` dalam dokumen.
- Kegagalan unduhan PDF ditampilkan kepada pengguna dalam bahasa Indonesia, bukan hanya dicatat ke konsol.
- Data API yang belum lengkap tetap dapat ditampilkan pada status draf tanpa menghasilkan teks `undefined` atau `null`.

## Pengujian dan Kriteria Penerimaan

Implementasi mengikuti pengembangan berbasis pengujian. Pengujian unit formatter ditulis lebih dahulu dan harus membuktikan:

1. `2026-08-12` menjadi `12 Agustus 2026` tanpa pergeseran zona waktu.
2. `2026-08-10` sampai `2026-08-12` menjadi `10–12 Agustus 2026`.
3. Rentang lintas bulan dan tahun tidak ambigu.
4. `0`, `5.4`, dan `1.413` menjadi `0,00`, `5,40`, dan `1,41` untuk tampilan pengukuran dua desimal.
5. Nilai kosong menjadi `-` pada laporan.
6. Status server dipetakan ke bahasa Indonesia.
7. Label standar/CRM dan satuannya sama pada preview dan generator PDF.

Pengujian komponen atau integrasi memverifikasi bahwa tidak ada istilah Inggris yang tersisa pada area modul kalibrasi yang terlihat pengguna. Pemeriksaan PDF membandingkan teks hasil render dengan nilai preview untuk tanggal kalibrasi, tempat/tanggal tanda tangan, dan Standar/CRM. Verifikasi akhir menjalankan pengujian terarah, lint, pemeriksaan tipe/build yang tersedia, dan pemeriksaan manual pada satu laporan representatif.

## Batasan

- Tidak mengubah perhitungan kalibrasi, aturan kelulusan, struktur database, atau kontrak API.
- Tidak menerjemahkan seluruh aplikasi di luar modul kalibrasi.
- Tidak mengklaim kepatuhan terhadap nomor SNI tertentu karena tidak ada nomor SNI yang ditetapkan; perubahan mengikuti bahasa Indonesia profesional serta konvensi tanggal dan desimal Indonesia yang telah disepakati.
- Tidak melakukan refaktor umum di luar kode yang diperlukan untuk konsistensi modul kalibrasi dan PDF.
