import DOMPurify from "isomorphic-dompurify";

const CALIBRATION_NOTES_ALLOWED_TAGS = [
  "p",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "ul",
  "ol",
  "li",
  "br",
] as const;

/** Sanitizes rich calibration notes at the browser render boundary. */
export const sanitizeCalibrationNotes = (notes: string): string =>
  DOMPurify.sanitize(notes, {
    ALLOWED_TAGS: [...CALIBRATION_NOTES_ALLOWED_TAGS],
    ALLOWED_ATTR: [],
    ALLOW_ARIA_ATTR: false,
    ALLOW_DATA_ATTR: false,
  });
