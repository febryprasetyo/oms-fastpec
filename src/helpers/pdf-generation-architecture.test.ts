import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("PDF generation architecture", () => {
  it("does not retain a frontend PDF generator alongside the backend download endpoint", () => {
    expect(existsSync(resolve(process.cwd(), "src/helpers/PdfGenerator.ts"))).toBe(false);
  });
});
