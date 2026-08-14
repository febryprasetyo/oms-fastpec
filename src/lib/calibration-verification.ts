/**
 * Builds the one canonical URL encoded in calibration QR codes.
 *
 * Set NEXT_PUBLIC_APP_URL in the web app and CALIBRATION_PUBLIC_URL in the
 * PDF service to the same public application URL. The browser-origin fallback
 * is only for local development.
 */
export function getCalibrationVerificationUrl(
  verificationUuid: string,
  browserOrigin?: string,
): string {
  const path = `/verify/${encodeURIComponent(verificationUuid)}`;
  const publicUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.CALIBRATION_PUBLIC_URL ??
    browserOrigin;

  if (!publicUrl) {
    return path;
  }

  return new URL(path, publicUrl).toString();
}
