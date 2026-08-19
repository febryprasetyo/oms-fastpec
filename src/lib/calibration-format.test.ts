import { describe, expect, it } from "vitest";
import {
  formatCalibrationDate,
  formatCalibrationDateInput,
  formatCalibrationDateRange,
  formatCalibrationMeasurement,
  formatCalibrationParameterName,
  formatCalibrationPlace,
  formatCalibrationStandard,
  translateCalibrationStatus,
} from "./calibration-format";

describe("calibration-format", () => {
  it("memformat tanggal tunggal ke format resmi Indonesia", () => {
    expect(formatCalibrationDate("2026-08-12")).toBe("12 Agustus 2026");
    expect(formatCalibrationDate("invalid-date")).toBe("invalid-date");
  });

  it("memformat tanggal input dengan mempertahankan nilai lokal YYYY-MM-DD", () => {
    const localMidnight = new Date(2026, 7, 12, 0, 0, 0, 0);

    expect(formatCalibrationDateInput(localMidnight)).toBe("2026-08-12");
  });

  it("memformat rentang tanggal dalam bulan dan tahun yang sama", () => {
    expect(formatCalibrationDateRange("2026-08-10", "2026-08-12")).toBe(
      "10–12 Agustus 2026",
    );
  });

  it("memformat rentang tanggal lintas tahun", () => {
    expect(formatCalibrationDateRange("2026-12-31", "2027-01-02")).toBe(
      "31 Desember 2026–2 Januari 2027",
    );
  });

  it.each([
    [1.005, "1,01"],
    [1.413, "1,41"],
    [0, "0,00"],
    [null, "-"],
    [undefined, "-"],
    ["", "-"],
  ])("memformat angka kalibrasi %s menjadi %s", (value, expected) => {
    expect(formatCalibrationMeasurement(value)).toBe(expected);
  });

  it("memformat label standar CRM dan non-CRM", () => {
    expect(formatCalibrationStandard("0", 0, "mg/L")).toBe("0,00 mg/L");
    expect(formatCalibrationStandard("CRM 5.51", 5.51, "mg/L")).toBe(
      "CRM 5,51 mg/L",
    );
  });

  it("memformat nama tempat dengan menghapus prefiks kabupaten/kota dan menerapkan title case", () => {
    expect(formatCalibrationPlace("Kabupaten Morowali Utara")).toBe(
      "Morowali Utara",
    );
    expect(formatCalibrationPlace("  kota   morowali UTARA  ")).toBe(
      "Morowali Utara",
    );
    expect(formatCalibrationPlace("Morowali Utara")).toBe("Morowali Utara");
  });

  it("menerjemahkan status kalibrasi", () => {
    expect(translateCalibrationStatus("PASS")).toBe("Lulus");
    expect(translateCalibrationStatus("Submitted")).toBe("Diajukan");
  });

  it.each([
    ["Amonia", "Amonia"],
    ["NH3-N", "Amonia"],
    ["Nitrat", "Nitrat"],
    ["NO3", "Nitrat"],
    ["Nitrit", "Nitrit"],
    ["NO2-N", "Nitrit"],
    ["DO", "DO"],
  ])("menampilkan nama parameter %s sebagai %s", (value, expected) => {
    expect(formatCalibrationParameterName(value)).toBe(expected);
  });
});
