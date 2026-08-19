# Lokalisasi Modul Kalibrasi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyamakan preview dan PDF unduhan serta mengubah seluruh teks modul kalibrasi menjadi bahasa Indonesia profesional dengan format tanggal dan desimal Indonesia.

**Architecture:** Semua aturan presentasi ditempatkan pada fungsi murni di `src/lib/calibration-format.ts`. Komponen daftar, formulir, laporan, verifikasi, dan generator PDF menggunakan fungsi yang sama; nilai mentah dan kontrak JSON API tidak diubah. PDF yang diunduh tetap dilayani endpoint `GET /api/calibrations/{id}/ print`, sehingga generator endpoint tersebut harus menerapkan kontrak format yang sama.

**Tech Stack:** Next.js 14, React 18, TypeScript, Vitest, Testing Library, JSDOM, Puppeteer.

## Global Constraints

- Semua teks yang terlihat pengguna dalam modul kalibrasi harus memakai bahasa Indonesia profesional.
- Tanggal lengkap memakai bentuk `12 Agustus 2026`; rentang bulan/tahun sama memakai bentuk `10–12 Agustus 2026`.
- Semua angka laporan memakai koma desimal dan dua angka di belakang koma, misalnya `0,00 mg/L`.
- Nilai numerik payload API tetap berupa angka JSON; lokalisasi hanya berlaku pada presentasi.
- Tanggal tanda tangan selalu memakai tanggal akhir kalibrasi.
- Singkatan CRM, pH, DO, COD, BOD, TSS dan satuan SI tidak diterjemahkan.
- Tidak mengubah perhitungan kalibrasi, aturan kelulusan, struktur basis data, atau kontrak API.
- Pertahankan seluruh perubahan pengguna yang sudah ada di worktree; stage hanya hunks/file yang benar-benar menjadi bagian tugas.

---

## Struktur Berkas

- `src/lib/calibration-format.ts`: seluruh formatter presentasi dan kamus status kalibrasi.
- `src/lib/calibration-format.test.ts`: pengujian unit formatter tanpa ketergantungan React.
- `vitest.config.ts`, `src/test/setup.ts`: konfigurasi pengujian TypeScript/React dengan alias `@` dan matcher DOM.
- `src/components/features/calibration/ReportPreview.tsx`: laporan layar/cetak yang hanya mengonsumsi formatter bersama.
- `src/helpers/PdfGenerator.ts`: injeksi konten PDF dengan formatter yang sama.
- `src/components/features/calibration/*.tsx`: salinan bahasa Indonesia pada formulir, editor catatan, sampel air, QR, dan badge.
- `src/app/(protected)/calibration/**/*.tsx`: salinan bahasa Indonesia pada daftar, pembuatan, penyuntingan, dan detail.
- `src/app/verify/[uuid]/page.tsx`: salinan dan format halaman verifikasi publik.
- `src/**/*.test.tsx`: pengujian rendering untuk teks dan nilai representatif.
- `package.json`, `package-lock.json`: runner pengujian unit/komponen.

### Task 1: Infrastruktur Pengujian dan Formatter Bersama

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Modify: `src/lib/calibration-format.ts`
- Create: `src/lib/calibration-format.test.ts`

**Interfaces:**
- Produces: `formatCalibrationDate(value: string | Date): string`
- Produces: `formatCalibrationDateRange(start: string | Date, end: string | Date): string`
- Produces: `formatCalibrationMeasurement(value: string | number | null | undefined): string`
- Produces: `formatCalibrationInput(value: string | number | null | undefined): string`
- Produces: `formatCalibrationStandard(name: string, value: number | null, unit?: string): string`
- Produces: `formatCalibrationPlace(value: string): string`
- Produces: `translateCalibrationStatus(status: string | null | undefined): string`

- [ ] **Step 1: Tambahkan Vitest, Testing Library, JSDOM, dan skrip pengujian**

Tambahkan `vitest` sebagai dev dependency dan ubah skrip:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Run: `npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom`

Buat `vitest.config.ts` dengan plugin resolusi alias `@` ke `src`, environment `jsdom`, dan `setupFiles: ["./src/test/setup.ts"]`. Isi `src/test/setup.ts` dengan `import "@testing-library/jest-dom/vitest";`.

- [ ] **Step 2: Tulis pengujian formatter yang gagal**

```ts
import { describe, expect, it } from "vitest";
import {
  formatCalibrationDate,
  formatCalibrationDateRange,
  formatCalibrationMeasurement,
  formatCalibrationPlace,
  formatCalibrationStandard,
  translateCalibrationStatus,
} from "./calibration-format";

describe("formatter kalibrasi Indonesia", () => {
  it("memformat tanggal kalender tanpa pergeseran zona waktu", () => {
    expect(formatCalibrationDate("2026-08-12")).toBe("12 Agustus 2026");
  });

  it("meringkas rentang tanggal dalam bulan yang sama", () => {
    expect(formatCalibrationDateRange("2026-08-10", "2026-08-12")).toBe("10–12 Agustus 2026");
  });

  it("menampilkan rentang lintas bulan dan tahun tanpa ambigu", () => {
    expect(formatCalibrationDateRange("2026-12-31", "2027-01-02")).toBe("31 Desember 2026–2 Januari 2027");
  });

  it.each([[0, "0,00"], [5.4, "5,40"], [1.413, "1,41"], [null, "-"]])(
    "memformat pengukuran %s menjadi %s",
    (value, expected) => expect(formatCalibrationMeasurement(value)).toBe(expected),
  );

  it("memformat standar dan satuan", () => {
    expect(formatCalibrationStandard("0", 0, "mg/L")).toBe("0,00 mg/L");
    expect(formatCalibrationStandard("CRM 5.51", 5.51, "mg/L")).toBe("CRM 5,51 mg/L");
  });

  it("menormalkan tempat dan menerjemahkan status", () => {
    expect(formatCalibrationPlace("Kabupaten Morowali Utara")).toBe("Morowali Utara");
    expect(translateCalibrationStatus("PASS")).toBe("Lulus");
    expect(translateCalibrationStatus("Submitted")).toBe("Diajukan");
  });
});
```

- [ ] **Step 3: Jalankan pengujian untuk memastikan RED**

Run: `npm test -- src/lib/calibration-format.test.ts`

Expected: FAIL karena fungsi baru belum diekspor dan formatter lama masih menghasilkan titik desimal.

- [ ] **Step 4: Implementasikan formatter minimal**

Gunakan daftar bulan eksplisit dan parser `YYYY-MM-DD` yang membentuk tanggal kalender tanpa `new Date(value)` UTC. Gunakan `Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false })` untuk angka. `formatCalibrationStandard` mempertahankan awalan CRM dari nama, mengambil `value` sebagai sumber utama, dan tidak menambahkan satuan untuk pH.

- [ ] **Step 5: Jalankan pengujian formatter**

Run: `npm test -- src/lib/calibration-format.test.ts`

Expected: seluruh pengujian PASS.

- [ ] **Step 6: Commit formatter**

```bash
git add package.json package-lock.json src/lib/calibration-format.ts src/lib/calibration-format.test.ts
git commit -m "feat: tambahkan formatter Indonesia untuk kalibrasi"
```

### Task 2: Lokalisasi Daftar dan Formulir Kalibrasi

**Files:**
- Modify: `src/app/(protected)/calibration/page.tsx`
- Modify: `src/app/(protected)/calibration/create/page.tsx`
- Modify: `src/app/(protected)/calibration/edit/[id]/page.tsx`
- Modify: `src/components/features/calibration/ParameterTable.tsx`
- Modify: `src/components/features/calibration/WaterSampleTable.tsx`
- Modify: `src/components/features/calibration/NotesEditor.tsx`
- Modify: `src/components/features/badge/CalibrationHeader.tsx`
- Modify: `src/components/features/badge/StatusBadge.tsx`
- Create: `src/components/features/calibration/calibration-copy.test.tsx`

**Interfaces:**
- Consumes: `formatCalibrationDateRange`, `translateCalibrationStatus` dari Task 1.
- Produces: seluruh daftar dan formulir tanpa teks Inggris yang terlihat pengguna.

- [ ] **Step 1: Tulis pengujian salinan komponen yang gagal**

Render komponen kecil dengan Testing Library dan verifikasi label berikut:

```ts
expect(screen.getByText("Hasil Kalibrasi (Standar)")).toBeInTheDocument();
expect(screen.getByText("Koefisien Internal (K/B)")).toBeInTheDocument();
expect(screen.getByText("Pengukuran Sampel Air dan Uji Blangko")).toBeInTheDocument();
expect(screen.getByText("Tambah Sampel")).toBeInTheDocument();
expect(screen.getByText("Draf")).toBeInTheDocument();
```

Gunakan environment JSDOM dan matcher DOM yang dibuat pada Task 1.

- [ ] **Step 2: Jalankan pengujian untuk memastikan RED**

Run: `npm test -- src/components/features/calibration/calibration-copy.test.tsx`

Expected: FAIL karena komponen masih menampilkan `Calibration Results`, `Add Sample`, atau status Inggris.

- [ ] **Step 3: Ganti seluruh salinan daftar dan formulir**

Gunakan terminologi spesifikasi, termasuk `Kalibrasi`, `Nomor Laporan`, `Stasiun`, `Tanggal`, `Petugas`, `Tindakan`, `Draf`, `Diajukan`, `Disetujui`, `Simpan Draf`, `Ajukan Kalibrasi`, `Sampel Air`, `Koefisien`, `Nilai Referensi CRM`, dan `Nilai Pembacaan CRM`. Ubah pesan konfirmasi, validasi, toast, pemuatan, serta keadaan kosong. Tombol editor menjadi `Tebal`, `Miring`, `Garis Bawah`, `Coret`, `Daftar Berpoin`, `Daftar Bernomor`, `Urungkan`, dan `Ulangi`.

- [ ] **Step 4: Gunakan formatter pada tanggal/status teks**

`CalibrationHeader` dan tabel daftar harus menerima nilai API mentah, tetapi menampilkan `formatCalibrationDateRange(...)` dan `translateCalibrationStatus(...)`. Jangan mengubah nilai `Draft`, `Submitted`, atau `Approved` yang dipakai pada perbandingan logika.

- [ ] **Step 5: Jalankan pengujian dan lint terarah**

Run: `npm test -- src/components/features/calibration/calibration-copy.test.tsx src/lib/calibration-format.test.ts`

Run: `npm run lint`

Expected: PASS tanpa istilah Inggris yang diuji dan tanpa error lint baru.

- [ ] **Step 6: Commit formulir**

```bash
git add 'src/app/(protected)/calibration' src/components/features/calibration src/components/features/badge/CalibrationHeader.tsx src/components/features/badge/StatusBadge.tsx
git commit -m "feat: lokalkan formulir kalibrasi"
```

### Task 3: Selaraskan Preview, Cetak, dan Halaman Verifikasi

**Files:**
- Modify: `src/components/features/calibration/ReportPreview.tsx`
- Modify: `src/components/features/calibration/QRCodeCard.tsx`
- Modify: `src/app/verify/[uuid]/page.tsx`
- Create: `src/components/features/calibration/ReportPreview.test.tsx`

**Interfaces:**
- Consumes: seluruh formatter Task 1.
- Produces: preview/cetak dan verifikasi publik dengan istilah serta format identik.

- [ ] **Step 1: Tulis pengujian preview yang gagal**

Dengan fixture `CalibrationDetail` bertanggal 10–12 Agustus 2026 dan standar 0 mg/L, render preview dan verifikasi:

```ts
expect(screen.getByText("LAPORAN KALIBRASI")).toBeInTheDocument();
expect(screen.getByText(/10–12 Agustus 2026/)).toBeInTheDocument();
expect(screen.getByText(/Morowali Utara, 12 Agustus 2026/)).toBeInTheDocument();
expect(screen.getByText("0,00 mg/L")).toBeInTheDocument();
expect(screen.queryByText(/Calibration|Report|Station|Standart|Notes|Print|Download/i)).not.toBeInTheDocument();
```

Mock hanya hook autentikasi dan fungsi unduhan jaringan; jangan mock formatter atau komponen laporan.

- [ ] **Step 2: Jalankan pengujian untuk memastikan RED**

Run: `npm test -- src/components/features/calibration/ReportPreview.test.tsx`

Expected: FAIL karena tanggal masih numerik, angka masih memakai titik, dan label masih berbahasa Inggris.

- [ ] **Step 3: Hilangkan formatter lokal dan gunakan formatter bersama**

Hapus `formatDate`, `formatPlace`, dan `standardLabel` lokal dari `ReportPreview`. Gunakan `formatCalibrationDateRange`, `formatCalibrationDate`, `formatCalibrationPlace`, `formatCalibrationStandard`, `formatCalibrationMeasurement`, dan `translateCalibrationStatus` dari `src/lib/calibration-format.ts`.

- [ ] **Step 4: Terjemahkan seluruh laporan dan verifikasi**

Gunakan label spesifikasi. Ubah nama berkas menjadi `Laporan_Kalibrasi_<nomor>.pdf`. Pada kegagalan unduhan tampilkan toast `PDF laporan kalibrasi gagal diunduh.` dan catat detail teknis hanya ke konsol. Terjemahkan teks autentik/gagal verifikasi, informasi laporan, catatan, sampel air, status parameter, dan kartu QR.

- [ ] **Step 5: Jalankan pengujian preview dan formatter**

Run: `npm test -- src/components/features/calibration/ReportPreview.test.tsx src/lib/calibration-format.test.ts`

Expected: PASS, termasuk tiga nilai penerimaan `10–12 Agustus 2026`, `Morowali Utara, 12 Agustus 2026`, dan `0,00 mg/L`.

- [ ] **Step 6: Commit laporan frontend**

```bash
git add src/components/features/calibration/ReportPreview.tsx src/components/features/calibration/ReportPreview.test.tsx src/components/features/calibration/QRCodeCard.tsx 'src/app/verify/[uuid]/page.tsx'
git commit -m "feat: selaraskan laporan kalibrasi Indonesia"
```

### Task 4: Selaraskan Generator PDF Unduhan

**Files:**
- Modify: `src/helpers/PdfGenerator.ts`
- Create: `.agents/Calibration_Report.html`
- Create: `src/helpers/PdfGenerator.test.ts`
- Verify externally: implementasi endpoint backend `GET /api/calibrations/{id}/print`

**Interfaces:**
- Consumes: formatter Task 1 dan `CalibrationDetail` yang sama dengan preview.
- Produces: isi HTML/PDF yang sama dengan preview untuk metadata, standar, hasil, sampel, catatan, tanda tangan, dan status.

- [ ] **Step 1: Pastikan sumber endpoint PDF**

Konfirmasi dari konfigurasi `NEXT_PUBLIC_API_URL` bahwa `/api/calibrations/{id}/print` dilayani backend eksternal. Repository backend yang disebut `AGENTS.md` (`../aplikasi-backend`) wajib tersedia sebelum task ini dimulai. Verifikasi method GET, autentikasi Bearer, response `application/pdf`, dan format error. Jangan mengganti endpoint atau membuat kontrak baru.

- [ ] **Step 2: Tulis pengujian injeksi HTML yang gagal**

Ekstrak fungsi murni `renderCalibrationReportHtml(detail, template, publicAppUrl): string` dari pembukaan Puppeteer, lalu uji hasilnya:

```ts
const html = renderCalibrationReportHtml(detail, template, "https://contoh.id");
expect(html).toContain("LAPORAN KALIBRASI");
expect(html).toContain("10–12 Agustus 2026");
expect(html).toContain("Morowali Utara, 12 Agustus 2026");
expect(html).toContain("0,00 mg/L");
expect(html).not.toMatch(/Calibration Date|Standart|Place \/ Date|Notes:/);
```

- [ ] **Step 3: Jalankan pengujian untuk memastikan RED**

Run: `npm test -- src/helpers/PdfGenerator.test.ts`

Expected: FAIL karena fungsi render belum ada dan generator memasukkan nilai mentah.

- [ ] **Step 4: Implementasikan renderer HTML dan template Indonesia**

Pindahkan seluruh manipulasi DOM ke `renderCalibrationReportHtml`. Isi metadata tanggal, tempat/tanggal, parameter, Standar/CRM, hasil pembacaan, koefisien, status, sampel air, catatan, petugas, dan QR. Gunakan `textContent` untuk data biasa; sanitasi HTML catatan dengan kebijakan yang sama seperti frontend sebelum `innerHTML`. `generateCalibrationPdf` hanya membaca template, memanggil renderer, lalu membuka Puppeteer.

- [ ] **Step 5: Terapkan kontrak yang sama pada generator backend**

Karena endpoint unduhan berada pada backend eksternal, port formatter/aturan eksplisit berikut ke renderer backend: tanggal akhir untuk tanda tangan, rentang tanggal Indonesia, dua desimal berkoma, label Indonesia, dan sumber `crm_standard_value`. Tambahkan pengujian backend yang mengekstrak teks PDF atau menguji HTML sebelum PDF. Jika repository backend belum tersedia, task ini berhenti sebagai blocker dan hasil tidak boleh dinyatakan selesai.

- [ ] **Step 6: Jalankan pengujian PDF dan smoke test endpoint**

Run frontend: `npm test -- src/helpers/PdfGenerator.test.ts src/components/features/calibration/ReportPreview.test.tsx`

Run endpoint dengan kredensial pengujian yang tersedia dan pastikan header `content-type: application/pdf`. Unduh fixture laporan, ekstrak teks PDF, lalu cocokkan tiga nilai penerimaan dengan preview.

- [ ] **Step 7: Commit PDF**

```bash
git add src/helpers/PdfGenerator.ts src/helpers/PdfGenerator.test.ts .agents/Calibration_Report.html
git commit -m "fix: samakan PDF dan preview kalibrasi"
```

Commit perubahan backend secara terpisah pada repository backend agar riwayat frontend dan backend tidak tercampur.

### Task 5: Audit Bahasa dan Verifikasi Akhir

**Files:**
- Modify: hanya file modul kalibrasi yang masih ditemukan memiliki salinan Inggris.
- Test: seluruh test dari Task 1–4.

**Interfaces:**
- Consumes: hasil semua task sebelumnya.
- Produces: bukti akhir bahwa modul, preview, verifikasi, dan PDF konsisten.

- [ ] **Step 1: Audit teks statis**

Run:

```bash
rg -n -i 'calibration|report|station|officer|standard|standart|sample|result|notes|print|download|approve|submit|save|failed|pending|coordinate|address' \
  'src/app/(protected)/calibration' src/app/verify src/components/features/calibration src/components/features/badge \
  --glob '*.tsx'
```

Tinjau setiap hasil. Nama simbol internal boleh tetap Inggris; string JSX, toast, placeholder, `aria-label`, dan `alt` yang terlihat/dibaca pengguna harus Indonesia.

- [ ] **Step 2: Jalankan seluruh pengujian**

Run: `npm test`

Expected: seluruh suite PASS tanpa error atau warning baru.

- [ ] **Step 3: Jalankan pemeriksaan statis dan build**

Run: `npm run lint`

Run: `npm run build`

Expected: kedua perintah exit 0.

- [ ] **Step 4: Periksa preview dan PDF secara manual**

Buka laporan fixture yang memuat tanggal 10–12 Agustus 2026 serta standar 0 mg/L. Pastikan layar, cetak, halaman verifikasi, dan PDF menampilkan teks yang sama. Pastikan input form tetap tersimpan sebagai angka API dan tidak mengirim string berkoma.

- [ ] **Step 5: Commit perbaikan audit bila ada**

```bash
git add -p 'src/app/(protected)/calibration' src/app/verify src/components/features/calibration src/components/features/badge
git commit -m "chore: tuntaskan audit bahasa kalibrasi"
```

- [ ] **Step 6: Catat bukti verifikasi**

Pada handoff, cantumkan perintah yang dijalankan, hasil exit code, contoh teks preview/PDF, dan setiap batasan lingkungan. Jangan menyatakan PDF konsisten bila endpoint backend belum berhasil diverifikasi.
