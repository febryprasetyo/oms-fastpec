import { toast } from "sonner";

/**
 * Formats a numeric or string value to standard Indonesian decimal format using comma (,).
 */
export function formatDecimalToComma(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const str = String(value);
  return str.replace(/\./g, ",");
}

/**
 * Normalizes input text to use comma (,) as standard decimal separator.
 * If dot (.) is detected in the input, triggers a user warning notice and converts it to comma.
 */
export function warnAndNormalizeDecimalInput(
  value: string,
  triggerToast = true
): string {
  if (!value) return value;
  if (value.includes(".")) {
    if (triggerToast) {
      toast.warning("Gunakan tanda koma (,) sebagai pemisah desimal standar.", {
        id: "decimal-comma-warning",
      });
    }
    return value.replace(/\./g, ",");
  }
  return value;
}
