# Calibration Photo Documentation Backend Requirements

## Implementation status

As of 18 August 2026, `/root/apps/service-iot` contains calibration routes, `CalibrationController`, detail persistence, submit/approve, `CalibrationReportRenderer`, and the HTML PDF template, but it does not contain calibration-documentation routes, database records, storage adapters, signed media streaming, submit validation for photos, or PDF photo rendering. Frontend code is contract-ready; integration must not be reported complete until this document is implemented and verified in the backend repository.

Likely backend boundaries are `src/routes/calibration/index.ts`, `src/controllers/CalibrationController.ts`, a dedicated documentation controller/service/repository, `src/helpers/CalibrationApiContract.ts`, `src/helpers/CalibrationReportRenderer.ts`, `src/views/Calibration_Report.html`, migrations, storage configuration, and cleanup/integrity jobs.

## Persistence

Create a documentation table related to `calibration_details` with these minimum columns:

- `id`
- `calibration_id`
- `calibration_detail_id`
- `photo_type`
- `storage_key`
- `mime_type`
- `file_size`
- `width`
- `height`
- `checksum`
- `uploaded_by`
- `created_at`
- `updated_at`

Enforce a unique constraint on `(calibration_detail_id, photo_type)` and a check constraint limiting `photo_type` to `before` or `after`. Foreign keys must prevent a detail from being addressed through a different calibration ID.

## Upload validation and authorization

- Authenticate and authorize access to the calibration and detail.
- Permit mutation for `draft` and `submitted`; reject all mutation for `approved`.
- Validate file signature independently from the client-provided MIME type.
- Validate supported MIME, decoded size, dimensions, and resource limits before committing metadata.
- Decode and re-encode WebP server-side and remove EXIF/metadata even though the frontend already does so.
- Calculate and persist checksum after canonical server encoding.
- Upsert a single slot atomically; a failed replacement must keep the previous record/file usable.
- Error cleanup must remove partially written files.

## Storage

Use a storage adapter with local-disk and S3-compatible implementations. Store canonical files under:

```text
calibration-docs/{year}/{month}/{calibrationId}/{detailId}/{before|after}-{uuid}.webp
```

The initial local-disk adapter has a hard 10 GB quota in a directory separated from the MQTT logger. Emit capacity warnings at 70%, 85%, and 95%. Reject an upload with HTTP 507 before it could exhaust the disk; never wait for a filesystem-full error.

Deleting a draft must clean its documentation files. Removing a detail must schedule or perform associated cleanup. A periodic job removes orphan files, abandoned temporary files, and failed uploads safely. Storage deletion must be idempotent.

## Signed preview streaming

Detail APIs generate an absolute, complete, short-lived `preview_url`. The URL points to a backend media-stream endpoint, not directly to a local filesystem path. It includes an expiry and signature bound at minimum to the documentation ID/path and intended media operation.

The stream endpoint verifies signature and expiry, resolves only the allowed storage key, prevents path traversal, sets the canonical image content type, and streams the local-disk object. It must not expose a filesystem path or storage key. Detail refetch regenerates expired/near-expiry URLs. Frontend renders the URL unchanged.

## Calibration lifecycle

- Submit requires one Before record for every current `calibration_details` row in the same transaction that changes the status.
- After is optional.
- Approved photos cannot be replaced or deleted.
- Correcting data after Approved reuses the same photo record/file references and does not copy files or request re-upload.
- Deleting a draft cleans records and files.
- A failed upload for one detail does not mutate any other detail.

## PDF, cache, and integrity

Extend the backend report query/mapper and `CalibrationReportRenderer` so documentation is grouped by parameter. Render Before and After side-by-side in stable A4 boxes with clear labels, correct orientation, and `object-fit: contain`. If After is empty, render `After Calibration: tidak didokumentasikan`. Never render a signed URL, signature, storage key, or upload control as text.

PDFs are not stored permanently. A render cache, if used, has a short configurable TTL and is invalidated when calibration data or documentation changes. Include each documentation checksum in the calibration integrity/checksum report.

## Backend-dependent E2E checklist

- [ ] Upload Before and After through multipart field `file` and receive canonical metadata.
- [ ] Replace one slot without changing its sibling slot; failed replace preserves the old photo.
- [ ] Delete one Draft/Submitted slot without deleting another parameter's file.
- [ ] Reject unsupported signature, MIME, oversize payload, excessive dimensions, and malformed image.
- [ ] Re-encode WebP and verify EXIF is absent from the stored file.
- [ ] Stream local-disk media through an unmodified signed `preview_url`.
- [ ] Reject altered, expired, unauthorized, and path-traversal signed URLs.
- [ ] Regenerate preview URLs on detail refetch.
- [ ] Warn at 70%, 85%, and 95%; reject safely with HTTP 507 before 10 GB exhaustion.
- [ ] Delete Draft files and records; cleanup job removes orphan and failed-upload files.
- [ ] Reject submit when any detail lacks Before; accept when all Before exist and every After is empty.
- [ ] Permit photo mutation for Submitted and reject it for Approved.
- [ ] Approved correction reuses identical photo IDs/storage keys/checksums without copying.
- [ ] Integrity report includes every photo checksum and detects tampering.
- [ ] PDF groups documentation per parameter, contains images without cropping, and renders missing-After text on A4.
- [ ] PDF artifacts are not permanent and any cache expires at its configured short TTL.
