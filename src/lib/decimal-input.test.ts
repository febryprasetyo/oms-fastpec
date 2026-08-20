import { describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { formatDecimalToComma, warnAndNormalizeDecimalInput } from "./decimal-input";

vi.mock("sonner", () => ({
  toast: {
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("decimal-input helpers", () => {
  it("formats decimal values to comma format", () => {
    expect(formatDecimalToComma(7.45)).toBe("7,45");
    expect(formatDecimalToComma("12.89")).toBe("12,89");
    expect(formatDecimalToComma("-0.05")).toBe("-0,05");
    expect(formatDecimalToComma(null)).toBe("");
    expect(formatDecimalToComma(undefined)).toBe("");
  });

  it("normalizes dot to comma and triggers warning toast when dot is inputted", () => {
    const result = warnAndNormalizeDecimalInput("7.45");
    expect(result).toBe("7,45");
    expect(toast.warning).toHaveBeenCalledWith(
      "Gunakan tanda koma (,) sebagai pemisah desimal standar.",
      { id: "decimal-comma-warning" }
    );
  });

  it("does not trigger warning if input already uses comma or has no dot", () => {
    vi.clearAllMocks();
    const result = warnAndNormalizeDecimalInput("7,45");
    expect(result).toBe("7,45");
    expect(toast.warning).not.toHaveBeenCalled();
  });
});
