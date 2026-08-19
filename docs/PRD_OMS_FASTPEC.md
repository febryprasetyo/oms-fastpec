# Product Requirements Document (PRD)
## Fastpec Online Monitoring System

**Status:** As-is baseline dari implementasi workspace  
**Tanggal:** 19 Agustus 2026  
**Repositori:** `oms-fastpec` (frontend) dan `service-iot` (backend)

## 1. Ringkasan Produk

Fastpec Online Monitoring System (OMS) adalah aplikasi operasional untuk memantau kualitas air dari stasiun sensor, menyimpan dan mengekspor data pemantauan, mengelola perangkat dan persediaan, menangani kebutuhan operasional/maintenance, serta membuat laporan kalibrasi sensor yang dapat diverifikasi secara publik.

Produk terdiri dari:

- **Frontend web:** Next.js 14, React, TanStack Query, Zustand, Axios, Tailwind UI.
- **Backend API:** Node.js/Express/TypeScript dengan PostgreSQL melalui Knex.
- **Ingestion dan real-time:** MQTT untuk menerima data sensor dan WebSocket untuk pembaruan monitoring.
- **Dokumen resmi:** PDF laporan kalibrasi yang dibuat backend menggunakan Puppeteer, dilengkapi QR verification.

Dokumen ini mendeskripsikan perilaku yang terlihat pada kode saat ini. Fitur yang ada di backend tetapi belum terlihat pada navigasi utama frontend tetap dicatat sebagai kapabilitas API, bukan dianggap sebagai alur UI yang selesai.

## 2. Masalah Bisnis

1. Data kualitas air dari banyak stasiun perlu dipantau dalam satu tempat.
2. Operator perlu melihat status sensor, histori, dan detail parameter tanpa mengolah data mentah secara manual.
3. Data hasil pengukuran perlu dapat diekspor dan ditelusuri.
4. Perangkat, stok, pengajuan operasional, dan maintenance perlu memiliki jejak administrasi.
5. Laporan kalibrasi perlu memiliki workflow draft-submit-approve dan bukti keaslian yang dapat diperiksa pihak eksternal.

## 3. Tujuan Produk

### Tujuan utama

- Menyediakan satu sumber informasi operasional untuk kondisi stasiun dan kualitas air.
- Mempercepat diagnosis sensor melalui data real-time dan histori.
- Menstandarkan pencatatan maintenance, inventaris, billing, dan pengajuan.
- Menghasilkan laporan kalibrasi resmi, konsisten, dan dapat diverifikasi.

### Indikator keberhasilan

| Indikator | Target baseline yang disarankan |
| --- | --- |
| Stasiun aktif dapat dilihat operator | 100% stasiun terdaftar memiliki halaman monitoring |
| Ketersediaan data real-time | Data baru tampil tanpa refresh manual pada koneksi normal |
| Ketertelusuran histori | Setiap data dapat difilter, dipaginasi, dan diekspor |
| Ketertelusuran kalibrasi | Setiap laporan memiliki nomor laporan, status, officer, dan UUID verifikasi |
| Keamanan akses | Endpoint privat menolak token hilang, invalid, expired, atau role tidak sesuai |
| Keandalan ingestion | Data MQTT tidak hilang saat flush database sementara gagal |

Angka SLA, latency, retention, dan volume produksi belum ditetapkan di source code dan harus diputuskan sebagai target operasional resmi.

## 4. Pengguna dan Hak Akses

Role yang terlihat pada kontrak backend adalah `adm`, `eng`, dan `usr`. Beberapa halaman frontend juga menggunakan nama role bisnis `admin` dan `engineering`; pemetaan nama ini perlu diseragamkan.

| Persona | Kebutuhan | Kapabilitas saat ini |
| --- | --- | --- |
| Admin (`adm`) | Mengelola sistem dan menyetujui hasil | Akses data admin, inventory/pengajuan, user/stasiun/mesin, maintenance, laporan, billing, approve kalibrasi |
| Engineering (`eng`) | Memantau stasiun dan melakukan pekerjaan teknis | Monitoring, database/history, maintenance, laporan, kalibrasi; data kalibrasi dibatasi pada laporan yang dibuatnya |
| User/operator (`usr`) | Melihat kondisi dan histori stasiun | Akses data monitoring, database, history, dan endpoint yang mengizinkan `usr` |
| Pihak eksternal | Memeriksa laporan resmi | Halaman publik `/verify/:uuid` dan endpoint publik `/api/verify/:uuid` |

**Catatan:** `requireCalibrationOwner` membatasi akses detail/update/delete/submit/print kalibrasi; admin dapat approve tanpa ownership check. Definisi owner dan aturan lintas modul lain perlu didokumentasikan lebih lanjut.

## 5. Ruang Lingkup Fitur

### 5.1 Autentikasi dan sesi

- Login dengan username dan password.
- Backend mengembalikan JWT Bearer.
- Frontend menyimpan user di Zustand persistence dan token pada cookie `token` selama sekitar satu jam.
- Route privat mengarahkan pengguna tanpa token ke `/login`.
- Respons 401 karena token invalid/expired menghapus sesi dan meminta login ulang.

### 5.2 Dashboard dan monitoring

- Dashboard menampilkan daftar/kartu stasiun dan navigasi ke detail monitoring.
- Detail monitoring menggunakan WebSocket pada `/monitoring/:id` untuk menerima perubahan status/data tanpa refresh.
- Backend menerima data sensor melalui MQTT, menyimpan data monitoring saat ini dan buffer histori.
- Sistem mendukung indikasi offline melalui job terjadwal/status helper.
- Route publik monitoring tertentu tersedia pada backend, tetapi akses UI dan kebijakan publiknya perlu dikonfirmasi.

### 5.3 Database dan history

- Database menampilkan data pemantauan dengan pagination dan filter.
- History menampilkan riwayat data dan menyediakan ekspor.
- Backend menyediakan list MQTT, data MQTT, metadata export/header, dan endpoint IKA.
- Data dapat difilter berdasarkan stasiun dan parameter sesuai implementasi service yang digunakan frontend.

### 5.4 Master data dan administrasi

- Admin memiliki halaman stasiun, mesin, user, dan inventory.
- Backend menyediakan endpoint data station, machine/device, user, dan master data terkait.
- Pengelolaan inventaris meliputi tracking barang, opsi tracking, dan request barang.
- Request inventory mendukung approve, reject, dan process update oleh admin.

### 5.5 Pengajuan operasional dan billing

- Backend menyediakan pengajuan pulsa dan token listrik dengan operasi list/detail/create/update/delete.
- Billing menyediakan summary, history, serta perubahan status oleh admin.
- Menu pengajuan dan billing pada sidebar frontend saat ini masih dikomentari; kapabilitas UI belum dianggap fully released.

### 5.6 Maintenance dan laporan

- Maintenance menangani kontrol/perbaikan stasiun.
- Laporan maintenance memuat judul, stasiun, kategori `Perbaikan` atau `Penggantian Part`, deskripsi, PIC, status `Open`, `Eskalasi`, atau `Selesai`, serta history log.
- Admin dan engineering dapat membuat/memperbarui/list/detail laporan menurut middleware backend.
- Hanya admin yang dapat mengganti PIC pada update.
- Frontend menampilkan pencarian laporan dan form create/edit/detail.

### 5.7 Laporan kalibrasi

Workflow resmi:

1. User login.
2. Frontend mengambil master parameter dan standar CRM.
3. User membuat draft dengan station, rentang tanggal, dan parameter terpilih.
4. Backend membuat `id`, nomor laporan, status, officer dari JWT, UUID verifikasi, URL verifikasi, dan QR PNG.
5. Frontend mengambil detail dan melakukan edit/autosave.
6. User mengisi hasil standar, koefisien, sampel air, dan catatan.
7. User submit draft.
8. Admin approve laporan yang submitted.
9. Sistem menyediakan print PDF dan halaman verifikasi publik.

Status: `draft`, `submitted`, `approved`. Laporan approved tidak boleh diedit; hanya draft yang boleh dihapus; hanya submitted yang boleh diapprove.

Parameter dan sampel yang tercermin di UI mencakup suhu, pH, DO, kekeruhan, TDS, serta field tambahan seperti COD, BOD, TSS, amonia, nitrat, nitrit, ORP, dan kedalaman sesuai tipe data backend.

### 5.8 Verifikasi publik

- Route frontend `/verify/:uuid` tidak memerlukan login.
- Halaman menampilkan keaslian laporan, nomor laporan, stasiun, tanggal, petugas, lokasi, catatan yang telah disanitasi, sampel air, dan status parameter.
- Backend membentuk QR dari konfigurasi URL publik, bukan dari header request.
- URL lokal/private ditolak sebagai konfigurasi publik.

## 6. Alur Pengguna Utama

### Alur monitoring

1. User login.
2. User membuka dashboard.
3. User memilih stasiun.
4. Frontend membuka koneksi WebSocket dan menampilkan status/data terbaru.
5. User membuka database atau history untuk inspeksi dan ekspor.

### Alur maintenance

1. Admin/engineering membuka laporan.
2. User mencari atau memfilter laporan.
3. User membuat laporan dengan stasiun, kategori, judul, dan deskripsi.
4. Backend mengisi PIC dari user login dan status awal `Open`.
5. User melihat detail beserta history.
6. Admin dapat mengubah PIC; perubahan status/history mengikuti workflow maintenance yang tersedia.

### Alur kalibrasi

1. User membuat draft berdasarkan master parameter.
2. User mengisi hasil kalibrasi dan sampel.
3. Frontend autosave seluruh koleksi sampel yang dipertahankan.
4. Backend menghitung status parameter dan memvalidasi kelengkapan saat submit.
5. Admin melakukan approve.
6. User mengunduh/print PDF atau membagikan QR verification.

## 7. Persyaratan Fungsional

| ID | Persyaratan |
| --- | --- |
| FR-01 | Sistem harus mengautentikasi username/password dan mengeluarkan token yang dapat dipakai frontend. |
| FR-02 | Sistem harus membatasi endpoint berdasarkan role backend, bukan hanya menyembunyikan tombol UI. |
| FR-03 | Sistem harus menerima dan menyimpan data sensor dari MQTT. |
| FR-04 | Sistem harus menyediakan monitoring stasiun dan riwayat data melalui API. |
| FR-05 | Sistem harus menyediakan export data dengan filter/pagination yang sesuai. |
| FR-06 | Sistem harus mengelola station, device/mesin, user, inventory, dan request operasional sesuai role. |
| FR-07 | Sistem harus menyediakan laporan maintenance dengan detail dan history. |
| FR-08 | Sistem harus menyediakan workflow kalibrasi draft, submit, approve, print, dan delete draft. |
| FR-09 | Sistem harus menghasilkan QR verification yang menunjuk URL publik yang tervalidasi. |
| FR-10 | Sistem harus menyanitasi catatan kalibrasi pada saat tulis dan saat respons dibaca. |
| FR-11 | Sistem harus menyediakan verifikasi publik tanpa token. |
| FR-12 | Sistem harus menampilkan error API secara konsisten dan mengakhiri sesi ketika token expired/invalid. |

## 8. Non-Functional Requirements

- **Security:** HTTPS pada deployment publik, JWT secret dikelola sebagai secret, Bearer token tidak dicatat ke log, validasi role di backend, sanitasi HTML notes, signed media URL untuk dokumentasi.
- **Availability:** MQTT ingestion harus memiliki retry/buffering; proses background tidak boleh menghentikan API utama.
- **Performance:** pagination wajib untuk list besar; WebSocket digunakan untuk monitoring live; batas latency dan throughput perlu ditetapkan melalui load test.
- **Auditability:** created/updated timestamps, officer/PIC, status workflow, report number, dan verification UUID harus dipertahankan.
- **Compatibility:** tanggal API menggunakan `YYYY-MM-DD`; angka desimal dikirim sebagai JSON number; UI harus responsif pada desktop/mobile.
- **Operations:** logging terpisah untuk aplikasi dan MQTT, health/readiness check, backup PostgreSQL, retention data, dan observability perlu menjadi standar deployment.

## 9. Di Luar Scope atau Belum Terverifikasi

- Definisi SLA produksi dan target availability.
- Detail notifikasi dan aturan eskalasi maintenance.
- Kebijakan retention historis dan archive.
- Mapping final `admin`/`engineering` ke `adm`/`eng`.
- Kontrak WebSocket yang versioned.
- Status rilis final untuk menu billing dan pengajuan yang dikomentari.
- Kontrak domain `/api/reports` versus `/api/maintenance/reports`.
- Mekanisme multi-tenant, audit log immutable, dan approval berlapis.

## 10. Kriteria Penerimaan Produk

- User tanpa token tidak dapat membuka halaman protected.
- User dengan role yang tidak sesuai menerima 401/403 dari backend.
- Data MQTT yang valid tersimpan dan dapat dilihat melalui monitoring/history.
- Monitoring memperbarui data ketika event WebSocket diterima.
- Export menghasilkan file sesuai filter yang dipilih.
- Draft kalibrasi dapat dibuat, diedit, disubmit, diapprove, dan dihapus hanya pada status yang diizinkan.
- Laporan approved tidak dapat diubah.
- QR pada laporan mengarah ke `/verify/:uuid` yang menampilkan detail valid atau pesan gagal.
- Catatan berisi tag/atribut berbahaya tidak dieksekusi pada preview maupun verifikasi publik.

## 11. Risiko Produk dan Keputusan yang Dibutuhkan

1. **Kontrak reports:** frontend memanggil `/api/reports`, sedangkan backend memiliki route `/reports` dan juga route laporan di bawah `/maintenance/reports`. Tetapkan satu canonical path dan uji end-to-end.
2. **Role naming:** frontend menguji `admin`/`engineering` pada beberapa tempat, backend middleware memakai `adm`/`eng`. Tetapkan enum lintas sistem.
3. **API documentation:** sebagian kontrak operasional tersebar di Swagger/source. Buat OpenAPI terpublikasi dan jadikan generated client atau contract test sebagai sumber pemeriksaan.
4. **Runtime configuration:** tetapkan nilai resmi API URL, public calibration URL, MQTT, Redis, database, CORS, dan retention per environment.
5. **Testing:** backend package memiliki script Jest tetapi coverage alur besar belum terlihat seimbang dengan test frontend calibration. Tambahkan contract, integration, dan E2E tests.
