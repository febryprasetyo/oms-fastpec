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
    expect(formatCalibrationDateRange("2026-08-10", "2026-08-12")).toBe(
      "10–12 Agustus 2026",
    );
  });

  it("menampilkan rentang lintas bulan dan tahun tanpa ambigu", () => {
    expect(formatCalibrationDateRange("2026-12-31", "2027-01-02")).toBe(
      "31 Desember 2026–2 Januari 2027",
    );
  });

  it.each([
    [0, "0,00"],
    [5.4, "5,40"],
    [1.413, "1,41"],
    [null, "-"],
  ])("memformat pengukuran %s menjadi %s", (value, expected) =>
    expect(formatCalibrationMeasurement(value)).toBe(expected),
  );

  it("memformat standar dan satuan", () => {
    expect(formatCalibrationStandard("0", 0, "mg/L")).toBe("0,00 mg/L");
    expect(formatCalibrationStandard("CRM 5.51", 5.51, "mg/L")).toBe(
      "CRM 5,51 mg/L",
    );
  });

  it("menormalkan tempat dan menerjemahkan status", () => {
    expect(formatCalibrationPlace("Kabupaten Morowali Utara")).toBe(
      "Morowali Utara",
    );
    expect(translateCalibrationStatus("PASS")).toBe("Lulus");
    expect(translateCalibrationStatus("Submitted")).toBe("Diajukan");
  });
});
