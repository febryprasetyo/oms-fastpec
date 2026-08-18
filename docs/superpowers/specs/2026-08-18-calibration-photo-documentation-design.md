# Calibration Photo Documentation Design

## Scope

Add per-parameter Before and After Calibration photo documentation to the existing calibration module. The frontend will implement the complete client contract, UI state, compression, validation, and API integration without adding a frontend PDF generator or modifying backend code. The current backend in `/root/apps/service-iot` has no documentation endpoints or response metadata yet, so integration must remain explicitly marked incomplete until that backend contract is implemented.

## Existing Flow and Constraints

- Creating a calibration creates a draft and redirects to `/calibration/edit/:id`.
- The edit page owns React Hook Form state, autosaves through `PUT /api/calibrations/:id`, and refetches calibration detail after a successful save.
- Both Draft and Submitted records are editable; Approved records are read-only.
- Submission saves current form data before calling `POST /api/calibrations/:id/submit`.
- Approval and PDF rendering remain backend responsibilities. The frontend previews, prints, and downloads the blob returned by `GET /api/calibrations/:id/print`.
- Photo files and Base64 data must never enter React Hook Form, localStorage, or the main update payload.
- Existing unrelated worktree changes and calibration behavior must be preserved.

## Domain Model

```ts
type CalibrationPhotoType = "before" | "after";

interface CalibrationDocumentation {
  id: string;
  calibrationDetailId: number;
  parameterId: string;
  photoType: CalibrationPhotoType;
  previewUrl: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  checksum?: string;
  uploadedAt: string;
}
```

Each `ParameterCalibrationDetail` exposes documentation as independently addressable `before` and `after` entries. API mapping accepts backend snake_case fields but the application uses the camelCase domain model. Documentation is read-only domain state and is not part of `CalibrationFormValues` or `UpdateCalibrationPayloadSchema`.

## Backend API Contract

The frontend targets these required endpoints:

- `POST /api/calibrations/:calibrationId/details/:detailId/documentation/:photoType`
  - Authentication: existing bearer-token header.
  - Body: `multipart/form-data`, field name `file`.
  - Semantics: upsert, so the same call handles upload and replace.
  - Response: the saved documentation metadata.
- `DELETE /api/calibrations/:calibrationId/details/:detailId/documentation/:photoType`
  - Authentication: existing bearer-token header.
  - Response: success envelope or `204`; the frontend does not depend on a response body.
- `GET /api/calibrations/:id` and verification detail responses include documentation metadata for every calibration detail.

The metadata field is `documentation`, an array on each `details[]` item. Every item contains `id`, `calibration_detail_id`, `parameter_id`, `photo_type`, `preview_url`, `mime_type`, `file_size`, optional `width`, `height`, and `checksum`, plus `uploaded_at`.

`preview_url` is an absolute, complete URL produced by the backend. It contains a short-lived signature and points to an authorized backend media-stream endpoint backed initially by local disk. The frontend passes this value unchanged to `<img src>`, never constructs a storage URL, never manipulates its token, and never stores the URL in localStorage. Backend authorization and signature validation remain authoritative. Because signed URLs expire, normal detail-query invalidation/refetch refreshes them.

Until these endpoints and fields exist in the backend, API failures are surfaced normally and the feature is documented as contract-ready but not integrated.

## Upload and Parameter-ID Flow

Existing persisted parameters have a positive `detailId` and can upload immediately. A parameter newly added on the edit page temporarily has `id: 0`. When the user selects a gallery file for such a parameter, the frontend automatically:

1. Retains the selected `File` in ephemeral component state.
2. Saves the current calibration through the existing update flow.
3. Refetches detail data and matches the persisted detail by `parameterId`.
4. Obtains its positive `detailId`.
5. Compresses and uploads the retained file.

The user does not have to press Save Draft manually. The slot communicates the phases: saving parameter, compressing, uploading, and complete. If autosave fails or no persisted detail can be resolved, upload stops with a retryable error and no other parameter documentation is affected. The file remains only in component memory until retry, replacement, removal, navigation, or unmount.

Removing a parameter continues through the existing calibration update API. Associated record/file cleanup is a backend responsibility and must occur transactionally or through orphan cleanup.

## UI and Permissions

Every ParameterTable card gains a `Calibration Documentation` section with exactly two responsive slots:

- `Before Calibration` with a required indicator.
- `After Calibration` without a required indicator.

Only gallery/file selection is supported. The file input uses `accept="image/jpeg,image/png,image/webp"` and does not use `capture`, because staff take photographs with the device camera application, retain their own gallery copy, and may enter the web data after returning from the field.

Draft and Submitted users with existing edit permission can upload, retry, replace, and delete. Approved records hide all mutation actions and show previews only. The detail page also shows read-only documentation. Mutation errors stay scoped to their slot.

Each slot supports empty, saving-detail, compressing, uploading, success, and error states. It displays a preview, phase text, upload percentage when browser progress totals are available, a comprehensible error, and applicable retry/replace/delete actions. Layout is one column on small screens and two slots side-by-side when space permits.

Object URLs are used only for selected/compressed local previews and are revoked when replaced, removed, successfully reconciled to backend metadata, or unmounted. Backend `previewUrl` values are not object URLs and are not revoked.

## Compression Pipeline

Compression runs outside the main UI thread in a dedicated Web Worker using browser image decoding and canvas/offscreen-canvas capabilities where available. The pipeline:

1. Validates JPEG, PNG, or WebP input.
2. Decodes the image with orientation applied, so EXIF orientation is normalized.
3. Draws decoded pixels into a fresh canvas, which removes EXIF and other source metadata.
4. Preserves aspect ratio and limits the longest side to 1600 px.
5. Encodes WebP initially at quality `0.75`.
6. If larger than 150 KB, progressively lowers quality and then dimensions using deterministic bounded attempts.
7. Accepts a practical target result of 100–150 KB when attainable without upscaling or padding.
8. Rejects a final result larger than 250 KB with a clear Indonesian error.

Small images below 100 KB are not artificially enlarged. The resulting upload MIME type is `image/webp`. Unsupported browser decoding/WebP capabilities produce a compatibility error rather than uploading the unprocessed original.

## React Query and Form Preservation

Separate upload/upsert and delete hooks call the documentation service. On success they update or remove only the affected documentation item in the calibration detail query cache, then invalidate the corresponding detail query for authoritative metadata and a fresh signed URL.

The edit form is protected from refetch resets by the existing initialized/dirty-snapshot rules. Documentation mutations do not call `form.reset`, are not represented as form changes, and must not erase unsaved calibration values. Upload-in-progress state is tracked by calibration detail and photo type, so one failure cannot affect another parameter.

To prevent a race between autosave and photo reconciliation, automatic detail creation uses the edit page's existing serialized save guard. An upload cannot start until that save resolves and the authoritative detail ID is known.

## Submit Validation

Before saving or submitting, the frontend validates that:

- every current parameter has persisted Before documentation;
- After remains optional;
- no documentation slot is saving, compressing, uploading, or waiting for detail persistence.

On failure, submission and the update-before-submit call are not invoked. The first invalid parameter card is marked, scrolled into view with reduced-motion-aware behavior, and focused through an accessible anchor. Other missing cards remain visibly marked. Backend submit validation remains final and must enforce the same Before requirement transactionally.

Normal draft autosave is not blocked by absent Before photos; only submission is blocked. A failed upload never clears documentation belonging to any other slot.

## Detail, Report, Print, and PDF

The frontend detail view groups documentation under each parameter and renders Before and After side-by-side with `object-fit: contain`. If After is absent it displays `After Calibration: tidak didokumentasikan`. No URL, storage key, signature, or upload controls are displayed.

The existing frontend ReportPreview remains a backend PDF blob viewer. The frontend detail mapping exposes documentation so client views can render it, but PDF generation is not recreated in the browser. The backend report renderer and A4 template must add a grouped documentation section per parameter, stable image boxes, clear labels, contained images, correct orientation, and the same missing-After text.

## Backend Storage and Validation Requirements

The backend implementation must add a documentation table related to `calibration_details`, with at least: `id`, `calibration_id`, `calibration_detail_id`, `photo_type`, `storage_key`, `mime_type`, `file_size`, `width`, `height`, `checksum`, `uploaded_by`, `created_at`, and `updated_at`.

Required database and service rules:

- Unique constraint `(calibration_detail_id, photo_type)`.
- `photo_type` check constraint limited to `before` or `after`.
- Validate authorization, calibration ownership/access, editable status, file signature, MIME, size, and decoded dimensions.
- Re-encode WebP and remove metadata server-side even after frontend compression.
- Require Before for every current detail during submit; After is optional.
- Permit documentation mutation for Draft and Submitted; forbid it for Approved.
- Approved-data correction keeps references to the same photo records/files without copying or requiring re-upload.
- Store files at `calibration-docs/{year}/{month}/{calibrationId}/{detailId}/{before|after}-{uuid}.webp` through local and S3-compatible adapters.
- Local disk quota is a hard 10 GB, separate from MQTT logger storage, with warnings at 70%, 85%, and 95%; reject uploads with HTTP 507 before exhaustion.
- Draft deletion cleans related files. Cleanup jobs remove orphaned and failed uploads.
- PDFs are not permanently stored; any render cache has a short TTL.
- Include photo checksums in the calibration integrity report.
- Signed preview URLs authorize only the intended media, expire after a short configurable TTL, and are regenerated in detail responses.

## Error Handling

The client prefers a safe backend message from the established Axios error envelope and falls back to Indonesian messages for invalid file type, unsupported browser, compression failure, over-250-KB output, save-before-upload failure, upload failure, delete failure, and expired/unavailable preview. HTTP 507 receives a specific storage-capacity message. Retry repeats only the failed slot operation.

## Testing Strategy

Vitest and Testing Library cover:

- compression dimensions, orientation handling boundary, iterative size behavior, metadata-free canvas output, and rejection above 250 KB;
- Before required and After optional;
- submit blocked for missing Before and for any active upload;
- automatic save/refetch/detail-ID resolution for a newly added parameter;
- upload, replace, retry, delete, and per-slot error isolation;
- Draft and Submitted mutation actions versus Approved read-only UI;
- API mapping from snake_case documentation metadata and unchanged use of `preview_url`;
- exclusion of files/documentation from the main update payload;
- object URL revocation on replacement, removal, reconciliation, and unmount;
- read-only detail handling when After is absent;
- service request method, path, multipart field, and authentication header.

Backend-dependent E2E scenarios are documented but cannot pass until the endpoints exist: local disk streaming through signed URLs, signature expiration, authorization/status enforcement, 507 quota behavior, orphan cleanup, submit transaction validation, approved correction reference reuse, checksum integrity, and PDF rendering.

## Acceptance Boundary

Frontend completion means the type mapping, services, hooks, UI, compression, validation, tests, and backend integration documentation are implemented and locally verified. End-to-end integration is explicitly not complete until `/root/apps/service-iot` implements and verifies the documented API, storage, validation, signed streaming, submit, cleanup, integrity, and PDF requirements.
