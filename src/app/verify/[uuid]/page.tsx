"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useCalibrationVerify } from "@/hook/useCalibration";
import { AlertTriangle } from "lucide-react";
import {
  deriveCalibrationDetailStatus,
  formatCalibrationDateRange,
  formatCalibrationMeasurement,
  formatCalibrationParameterName,
  translateCalibrationStatus,
} from "@/lib/calibration-format";
import { sanitizeCalibrationNotes } from "@/lib/calibration-notes";
import type { WaterSample } from "@/types/calibration";

type WaterSampleColumnDef = {
  key: string;
  label: string;
  unit: string;
  paramNames: string[];
  getter: (sample: WaterSample) => string | number | null | undefined;
};

const ALL_WATER_SAMPLE_COLUMNS: WaterSampleColumnDef[] = [
  {
    key: "suhu",
    label: "Suhu",
    unit: "°C",
    paramNames: ["suhu", "temperature", "temp"],
    getter: (s: any) => s.temperature ?? s.suhu,
  },
  {
    key: "ph",
    label: "pH",
    unit: "",
    paramNames: ["ph"],
    getter: (s: any) => s.ph,
  },
  {
    key: "do",
    label: "DO",
    unit: "mg/L",
    paramNames: ["do", "do (dissolved oxygen)", "dissolved oxygen"],
    getter: (s: any) => s.doValue ?? s.do,
  },
  {
    key: "tur",
    label: "Kekeruhan",
    unit: "NTU",
    paramNames: ["tur", "turbidity", "kekeruhan", "turbidity (kekeruhan)", "turbiditas"],
    getter: (s: any) => s.turbidity ?? s.tur,
  },
  {
    key: "tds",
    label: "TDS",
    unit: "mg/L",
    paramNames: ["tds", "total dissolved solids", "tds (total dissolved solids)"],
    getter: (s: any) => s.tds,
  },
  {
    key: "orp",
    label: "ORP",
    unit: "mV",
    paramNames: ["orp"],
    getter: (s: any) => s.orp,
  },
  {
    key: "cod",
    label: "COD",
    unit: "mg/L",
    paramNames: ["cod", "cod (chemical oxygen demand)", "chemical oxygen demand"],
    getter: (s: any) => s.cod,
  },
  {
    key: "bod",
    label: "BOD",
    unit: "mg/L",
    paramNames: ["bod", "bod (biological oxygen demand)", "biological oxygen demand"],
    getter: (s: any) => s.bod,
  },
  {
    key: "tss",
    label: "TSS",
    unit: "mg/L",
    paramNames: ["tss", "total suspended solids", "tss (total suspended solids)"],
    getter: (s: any) => s.tss,
  },
  {
    key: "amonia",
    label: "Amonia",
    unit: "mg/L",
    paramNames: ["amonia", "nh3", "nh3-n", "amonia (nh3-n)"],
    getter: (s: any) => s.nh3 ?? s.amonia,
  },
  {
    key: "nitrat",
    label: "Nitrat",
    unit: "mg/L",
    paramNames: ["nitrat", "no3", "no3-n", "nitrat (no3-n)"],
    getter: (s: any) => s.no3 ?? s.nitrat,
  },
  {
    key: "nitrit",
    label: "Nitrit",
    unit: "mg/L",
    paramNames: ["nitrit", "no2", "no2-n", "nitrit (no2-n)"],
    getter: (s: any) => s.no2 ?? s.nitrit,
  },
  {
    key: "depth",
    label: "Kedalaman",
    unit: "m",
    paramNames: ["kedalaman", "depth", "level"],
    getter: (s: any) => s.depth ?? s.kedalaman,
  },
];

const getStatusConfig = (status: string | null | undefined) => {
  const normalized = status?.toUpperCase();
  if (normalized === "PASS") {
    return {
      label: "Lulus",
      className: "status-text status-text--pass text-green-700 font-bold",
    };
  }
  if (normalized === "FAILED") {
    return {
      label: "Tidak Lulus",
      className: "status-text status-text--fail text-red-700 font-bold",
    };
  }
  return {
    label: "Menunggu",
    className: "status-text status-text--neutral text-slate-500 font-medium",
  };
};

export default function VerificationPage() {
  const { uuid } = useParams() as { uuid: string };
  const { data: detail, isLoading, error } = useCalibrationVerify(uuid);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#edf1f3] p-6">
        <div className="max-w-md w-full bg-white border border-[#d9e0e4] rounded-lg p-8 shadow-sm text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#123f38] mb-4"></div>
          <p className="text-slate-700 font-medium text-sm">
            Memverifikasi keaslian laporan...
          </p>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#edf1f3] p-6">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-red-50 text-center p-6 border-b border-red-100">
            <div className="mx-auto bg-red-100 text-red-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h1 className="text-lg font-bold text-red-800">Verifikasi Gagal</h1>
          </div>
          <div className="p-6 text-center text-sm text-slate-600 leading-relaxed">
            Sertifikat kalibrasi ini tidak dapat diverifikasi. Hash dokumen mungkin
            telah diubah atau dokumen ini bukan sertifikat sah yang diterbitkan oleh PT
            Cahaya Mas Cemerlang.
          </div>
        </div>
      </div>
    );
  }

  // Filter sample table columns dynamically based on API parameters and present data
  const selectedParamNames = new Set<string>();
  (detail.parameters || []).forEach((p) => {
    const raw = (p.parameterName || "").trim().toLowerCase();
    selectedParamNames.add(raw);
    selectedParamNames.add(raw.replace(/\s*\([a-z0-9\-\+]+\)/g, "").trim());
  });

  let activeSampleColumns = ALL_WATER_SAMPLE_COLUMNS.filter((col) => {
    const isMatchingParam = col.paramNames.some((name) => selectedParamNames.has(name));
    const hasSampleValue = (detail.waterSamples || []).some((s) => {
      const val = col.getter(s);
      return val !== null && val !== undefined && val !== "";
    });
    return isMatchingParam || hasSampleValue;
  });

  if (activeSampleColumns.length === 0) {
    activeSampleColumns = ALL_WATER_SAMPLE_COLUMNS.slice(0, 5);
  }

  return (
    <div className="verify-page">
      <article className="document" aria-labelledby="report-title">
        <header className="masthead">
          <div className="brand-lockup">
            <span className="brand-logo">
              <img
                src="https://uploads.onecompiler.io/44724abkh/44zkkskm3/logo-cmc.png"
                alt="PT Cahaya Mas Cemerlang"
                height={48}
              />
            </span>
          </div>
          <p className="header-status">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5"></path>
            </svg>
            Dokumen Terverifikasi
          </p>
        </header>

        <main className="report-content">
          <header className="report-heading">
            <div>
              <p className="section-kicker">Quality Assurance & Calibration</p>
              <h1 id="report-title">Laporan Hasil Kalibrasi</h1>
            </div>
            <div className="report-registry">
              <p className="field-label">Nomor Registrasi Laporan</p>
              <p className="registry-value">{detail.reportNo || "Tidak tersedia"}</p>
            </div>
          </header>

          <dl
            className="metadata"
            aria-label="Data stasiun dan pelaksanaan kalibrasi"
          >
            <div className="metadata-column">
              <div className="field">
                <dt className="field-label">Nama Stasiun</dt>
                <dd>{detail.stationName || "Tidak tersedia"}</dd>
              </div>
              <div className="field">
                <dt className="field-label">Tanggal Kalibrasi</dt>
                <dd className="numeric">
                  {formatCalibrationDateRange(
                    detail.calibrationStartDate,
                    detail.calibrationEndDate
                  )}
                </dd>
              </div>
              <div className="field">
                <dt className="field-label">Petugas Pelaksana</dt>
                <dd>{detail.officer || "Tidak tersedia"}</dd>
              </div>
            </div>
            <div className="metadata-column">
              <div className="field">
                <dt className="field-label">Koordinat Geografis</dt>
                <dd className="numeric">
                  {detail.latitude && detail.longitude
                    ? `${detail.latitude}, ${detail.longitude}`
                    : "Tidak tersedia"}
                </dd>
              </div>
              <div className="field">
                <dt className="field-label">Alamat / Lokasi Stasiun</dt>
                <dd>{detail.address || "Tidak tersedia"}</dd>
              </div>
            </div>
          </dl>

          {/* Data Pengukuran Sampel Air */}
          <section className="section" aria-labelledby="sample-title">
            <div className="section-heading">
              <div>
                <h2 className="section-title" id="sample-title">
                  Hasil Pengukuran Sampel Air
                </h2>
              </div>
              <p className="section-description">
                Nilai sebagaimana tercatat pada laporan kalibrasi.
              </p>
            </div>

            <div className="table-frame">
              <table className="sample-table">
                <caption>Hasil pengukuran sampel air</caption>
                <thead>
                  <tr>
                    <th scope="col">Sampel</th>
                    {activeSampleColumns.map((col) => (
                      <th key={col.key} scope="col">
                        {col.label}
                        {col.unit ? ` (${col.unit})` : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!detail.waterSamples || detail.waterSamples.length === 0 ? (
                    <tr>
                      <td
                        colSpan={activeSampleColumns.length + 1}
                        className="text-center py-4 text-slate-500"
                      >
                        Tidak ada sampel air.
                      </td>
                    </tr>
                  ) : (
                    detail.waterSamples.map((sample, idx) => (
                      <tr key={sample.id || idx}>
                        <td className="sample-name" data-label="Sampel">
                          {sample.sampleName || "-"}
                        </td>
                        {activeSampleColumns.map((col) => (
                          <td key={col.key} data-label={col.label}>
                            {formatCalibrationMeasurement(col.getter(sample))}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Status Parameter Kalibrasi */}
          <section className="section" aria-labelledby="parameter-title">
            <div className="section-heading">
              <div>
                <h2 className="section-title" id="parameter-title">
                  Status Parameter Kalibrasi
                </h2>
              </div>
            </div>

            <div className="table-frame">
              <table className="parameter-table">
                <caption>Status kelulusan parameter kalibrasi</caption>
                <thead>
                  <tr>
                    <th scope="col">Parameter</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!detail.parameters || detail.parameters.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center py-4 text-slate-500">
                        Tidak ada parameter kalibrasi.
                      </td>
                    </tr>
                  ) : (
                    detail.parameters.map((p, idx) => {
                      const effectiveStatus =
                        p.status ??
                        deriveCalibrationDetailStatus(
                          p.parameterName,
                          p.results,
                          p.status
                        );
                      const statusCfg = getStatusConfig(effectiveStatus);
                      return (
                        <tr key={p.id ?? idx}>
                          <td>{formatCalibrationParameterName(p.parameterName)}</td>
                          <td>
                            <span className={statusCfg.className}>
                              {statusCfg.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Catatan Teknis & Evaluasi Lapangan */}
          <section className="section notes" aria-labelledby="notes-title">
            <div className="section-heading">
              <div>
                <h2 className="section-title" id="notes-title">
                  Catatan Teknis &amp; Evaluasi Lapangan
                </h2>
              </div>
            </div>
            <div className="technical-notes">
              <div
                className="calibration-notes-preview"
                dangerouslySetInnerHTML={{
                  __html: sanitizeCalibrationNotes(detail.notes || "-"),
                }}
              />
            </div>
          </section>

          {/* Verification Record */}
          <section
            className="verification-record"
            aria-labelledby="verification-code-title"
          >
            <h2
              className="verification-record-title"
              id="verification-code-title"
            >
              Dokumen Terverifikasi &amp; Valid
            </h2>
            <p className="verification-record-copy">
              Sertifikat kalibrasi ini diterbitkan secara sah oleh laboratorium PT
              Cahaya Mas Cemerlang dan terdaftar dalam basis data resmi.
            </p>
            <p className="verification-id">
              ID:
              <output
                className="verification-value"
                id="verification-code"
                aria-label="ID verifikasi"
              >
                {uuid}
              </output>
            </p>
          </section>
        </main>

        <footer className="document-footer">
          <div className="footer-lockup">
            <span className="footer-logo">
              <img
                src="https://uploads.onecompiler.io/44724abkh/44zkkskm3/FASTPEC%20OMS-black.png"
                alt="Fastpec OMS"
                height={28}
              />
            </span>
            <span className="footer-divider" aria-hidden="true"></span>
            <div>
              <p className="footer-copy">© 2026 PT Cahaya Mas Cemerlang — Fastpec</p>
              <p className="footer-copy footer-description">
                Water Quality Monitoring Systems — Laporan elektronik resmi terverifikasi.
              </p>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}

