interface ApiErrorShape {
  response?: {
    status?: number;
    data?: { message?: unknown };
  };
}

export const getCalibrationDocumentationErrorMessage = (error: unknown, fallback: string): string => {
  const apiError = error as ApiErrorShape;
  if (apiError?.response?.status === 507) {
    return "Kapasitas penyimpanan dokumentasi hampir penuh. Hubungi administrator sebelum mencoba lagi.";
  }
  const backendMessage = apiError?.response?.data?.message;
  return typeof backendMessage === "string" && backendMessage.trim()
    ? backendMessage.trim()
    : fallback;
};
