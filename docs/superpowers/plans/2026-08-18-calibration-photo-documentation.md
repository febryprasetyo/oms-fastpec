# Calibration Photo Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add gallery-based Before and After photo documentation for every calibration parameter, with non-blocking compression, independent upload lifecycle, submission validation, read-only reporting, and an explicit unimplemented-backend contract.

**Architecture:** Documentation metadata is mapped into the calibration detail domain but kept outside React Hook Form and the main calibration update payload. Focused service/hooks own multipart mutations and query-cache reconciliation; a Web Worker owns image processing; a slot component owns ephemeral files/object URLs; the edit page coordinates automatic persistence for new parameter IDs and submission validation.

**Tech Stack:** Next.js 14, React 18, TypeScript, React Hook Form, Zod, TanStack React Query 5, Axios, Web Workers, Canvas/OffscreenCanvas, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-18-calibration-photo-documentation-design.md`

## Global Constraints

- Upload is gallery/file selection only; inputs use `accept="image/jpeg,image/png,image/webp"` and never use `capture`.
- Never place a `File`, Blob payload, Base64 image, or documentation metadata in React Hook Form, localStorage, or `UpdateCalibrationPayloadSchema`.
- Frontend renders the backend-provided signed `preview_url` unchanged.
- Before is required only for submit; After is optional.
- Draft and Submitted are mutable; Approved is read-only.
- Backend PDF generation remains authoritative; do not create a frontend PDF generator.
- Current backend endpoints do not exist; document integration as incomplete.
- Preserve unrelated worktree changes.

---

### Task 1: Domain Types and API Response Mapping

**Files:**
- Modify: `src/types/calibration.ts`
- Modify: `src/services/api/calibration.ts`
- Modify: `src/services/api/calibration.test.ts`

**Interfaces:**
- Produces: `CalibrationPhotoType`, `CalibrationDocumentation`, `ParameterCalibrationDocumentation`, and `ParameterCalibrationDetail.documentation`.
- Produces: `CalibrationApiDocumentation` and optional `CalibrationApiDetail.documentation`.
- Produces: exported `mapCalibrationDocumentation(item)` through the existing `mapCalibrationDetail` mapping boundary.

- [ ] **Step 1: Write failing mapping tests**

Add API detail fixtures containing:

```ts
documentation: [{
  id: "doc-1",
  calibration_detail_id: 54,
  parameter_id: 7,
  photo_type: "before",
  preview_url: "https://api.example.test/media/calibration/doc-1?signature=signed",
  mime_type: "image/webp",
  file_size: 128000,
  width: 1200,
  height: 900,
  checksum: "sha256:abc",
  uploaded_at: "2026-08-18T10:00:00.000Z",
}]
```

Assert that `mapCalibrationDetail` exposes the camelCase metadata under `parameter.documentation.before`, preserves `preview_url` exactly, and leaves `after` undefined. Add a second assertion that missing `documentation` maps to `{}`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/services/api/calibration.test.ts`

Expected: FAIL because the API and domain types/mapping do not expose documentation.

- [ ] **Step 3: Add the minimal types and mapping**

Implement:

```ts
export type CalibrationPhotoType = "before" | "after";

export interface CalibrationDocumentation {
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

export type ParameterCalibrationDocumentation = Partial<
  Record<CalibrationPhotoType, CalibrationDocumentation>
>;
```

Add `documentation: ParameterCalibrationDocumentation` to each mapped parameter. Reduce the API array by `photo_type`; do not transform `preview_url`.

- [ ] **Step 4: Verify GREEN and payload isolation**

Run: `npm test -- src/services/api/calibration.test.ts src/schemas/calibration.schema.test.ts`

Expected: PASS, including existing assertions proving the update payload shape remains unchanged.

- [ ] **Step 5: Commit**

```bash
git add src/types/calibration.ts src/services/api/calibration.ts src/services/api/calibration.test.ts
git commit -m "feat: map calibration documentation metadata"
```

### Task 2: Documentation API Service and React Query Hooks

**Files:**
- Modify: `src/services/api/calibration.ts`
- Modify: `src/services/api/calibration.test.ts`
- Modify: `src/hook/useCalibration.ts`
- Modify: `src/hook/useCalibration.test.tsx`

**Interfaces:**
- Consumes: `CalibrationDocumentation`, `CalibrationPhotoType` from Task 1.
- Produces: `calibrationService.uploadDocumentation({ calibrationId, detailId, photoType, file, accessToken, onUploadProgress })`.
- Produces: `calibrationService.deleteDocumentation({ calibrationId, detailId, photoType, accessToken })`.
- Produces: `useUploadCalibrationDocumentation()` and `useDeleteCalibrationDocumentation()`.

- [ ] **Step 1: Write failing service request tests**

Spy on `axiosInstance.post` and `axiosInstance.delete`. Assert upload uses the exact route, a `FormData` whose `file` entry is the supplied WebP file, bearer authentication, and `onUploadProgress`. Assert delete uses the exact route and bearer authentication.

- [ ] **Step 2: Run service tests and verify RED**

Run: `npm test -- src/services/api/calibration.test.ts`

Expected: FAIL because both service methods are absent.

- [ ] **Step 3: Implement the minimal service methods**

Use `FormData.append("file", file, file.name)` and map the successful response with the Task 1 documentation mapper. Do not set a manual multipart boundary; allow Axios/browser to generate it.

- [ ] **Step 4: Verify service tests GREEN**

Run: `npm test -- src/services/api/calibration.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing hook cache-preservation tests**

Seed `queryClient` with a `CalibrationDetail`, render each mutation hook, and invoke success. Assert only the matching parameter/photo type changes in `['calibration', calibrationId]`; form state is not involved; and the matching query is invalidated. Verify a failed mutation leaves other slots untouched.

- [ ] **Step 6: Run hook tests and verify RED**

Run: `npm test -- src/hook/useCalibration.test.tsx`

Expected: FAIL because documentation hooks are absent.

- [ ] **Step 7: Implement hooks with scoped cache reconciliation**

Use `queryClient.setQueryData<CalibrationDetail>` to replace/delete the matching `documentation[photoType]`, then call:

```ts
queryClient.invalidateQueries({ queryKey: ["calibration", calibrationId] });
```

Hooks return the normal mutation state and accept upload progress callbacks through mutation variables.

- [ ] **Step 8: Verify GREEN and commit**

Run: `npm test -- src/services/api/calibration.test.ts src/hook/useCalibration.test.tsx`

```bash
git add src/services/api/calibration.ts src/services/api/calibration.test.ts src/hook/useCalibration.ts src/hook/useCalibration.test.tsx
git commit -m "feat: add calibration documentation mutations"
```

### Task 3: Compression Policy and Web Worker

**Files:**
- Create: `src/lib/calibration-photo.ts`
- Create: `src/lib/calibration-photo.test.ts`
- Create: `src/workers/calibration-photo.worker.ts`
- Create: `src/workers/calibration-photo.worker.test.ts`

**Interfaces:**
- Produces: constants `CALIBRATION_PHOTO_ACCEPT`, `CALIBRATION_PHOTO_MAX_BYTES`, and `CALIBRATION_PHOTO_MAX_DIMENSION`.
- Produces: `validateCalibrationPhotoFile(file): void`.
- Produces: `nextCompressionAttempt(current): CompressionAttempt | null` as a pure deterministic policy.
- Produces: `compressCalibrationPhoto(file, workerFactory?): Promise<File>` with progress messages.

- [ ] **Step 1: Read the test quality rules before writing tests**

Read `/root/.codex/plugins/cache/openai-curated-remote/superpowers/6.3.0/skills/test-driven-development/writing-good-tests.md` completely. Name the production behavior each test would catch.

- [ ] **Step 2: Write failing pure-policy tests**

Cover MIME rejection, initial `{ maxDimension: 1600, quality: 0.75 }`, bounded quality reduction, subsequent dimension reduction, no upscaling requirement, success at or below 250 KB, and the final Indonesian over-limit error.

- [ ] **Step 3: Run policy tests and verify RED**

Run: `npm test -- src/lib/calibration-photo.test.ts`

Expected: FAIL because the module is absent.

- [ ] **Step 4: Implement minimal validation and deterministic attempt policy**

Use explicit allowed MIME values and fixed attempts such as quality `0.75`, `0.68`, `0.60`, then dimensions `1440`, `1280`, `1120` at quality `0.60`. Stop at the first result at or below 150 KB; accept the smallest bounded result at or below 250 KB; otherwise reject.

- [ ] **Step 5: Verify policy tests GREEN**

Run: `npm test -- src/lib/calibration-photo.test.ts`

Expected: PASS.

- [ ] **Step 6: Write failing worker protocol tests**

Mock `createImageBitmap` and `OffscreenCanvas.convertToBlob`. Assert bitmap decoding requests orientation normalization, output canvas dimensions preserve aspect ratio within 1600 px, encoding is `image/webp`, source metadata is not copied, attempts follow the pure policy, and decoded bitmap resources close. Assert worker errors serialize a safe message.

- [ ] **Step 7: Run worker tests and verify RED**

Run: `npm test -- src/workers/calibration-photo.worker.test.ts`

Expected: FAIL because the worker handler does not exist.

- [ ] **Step 8: Implement worker and client wrapper**

The worker receives `{ id, file }`, posts phase/attempt progress, and returns `{ id, blob, width, height }` or `{ id, error }`. The wrapper creates a `.webp` `File`, terminates the worker after resolution/rejection, and handles worker errors. All canvas work stays in the worker.

- [ ] **Step 9: Verify GREEN and commit**

Run: `npm test -- src/lib/calibration-photo.test.ts src/workers/calibration-photo.worker.test.ts`

```bash
git add src/lib/calibration-photo.ts src/lib/calibration-photo.test.ts src/workers/calibration-photo.worker.ts src/workers/calibration-photo.worker.test.ts
git commit -m "feat: compress calibration photos off main thread"
```

### Task 4: Photo Slot UI and Object URL Lifecycle

**Files:**
- Create: `src/components/features/calibration/CalibrationPhotoSlot.tsx`
- Create: `src/components/features/calibration/CalibrationPhotoSlot.test.tsx`
- Create: `src/components/features/calibration/CalibrationDocumentation.tsx`
- Create: `src/components/features/calibration/CalibrationDocumentation.test.tsx`

**Interfaces:**
- Consumes: photo types/metadata, compression wrapper, upload/delete callbacks.
- Produces: `CalibrationPhotoSlot` with controlled operation state and accessible action labels.
- Produces: `CalibrationDocumentation` rendering exactly Before and After slots.

- [ ] **Step 1: Write failing component tests for gallery-only interaction**

Assert two slots exist, Before is marked required, After is optional, file inputs have the exact `accept` value and no `capture`, existing previews use the unchanged backend URL, and Approved/read-only mode exposes no upload/replace/delete controls.

- [ ] **Step 2: Write failing lifecycle and mutation tests**

Mock compression and callbacks. Cover upload, replacement, retry after failure, delete, status text, optional percentage, and slot-local errors. Spy on `URL.createObjectURL` and `URL.revokeObjectURL`; assert revocation on replacement, removal, server reconciliation, and unmount.

- [ ] **Step 3: Run tests and verify RED**

Run: `npm test -- src/components/features/calibration/CalibrationPhotoSlot.test.tsx src/components/features/calibration/CalibrationDocumentation.test.tsx`

Expected: FAIL because components are absent.

- [ ] **Step 4: Implement minimal slot state machine**

Use these explicit phases:

```ts
type PhotoOperationPhase =
  | "idle"
  | "saving-detail"
  | "compressing"
  | "uploading"
  | "error";
```

Keep the selected original/compressed file in component refs/state only. Retry the failed slot operation without touching siblings. Render previews with `object-contain`.

- [ ] **Step 5: Verify GREEN and commit**

Run the focused component tests.

```bash
git add src/components/features/calibration/CalibrationPhotoSlot.tsx src/components/features/calibration/CalibrationPhotoSlot.test.tsx src/components/features/calibration/CalibrationDocumentation.tsx src/components/features/calibration/CalibrationDocumentation.test.tsx
git commit -m "feat: add calibration photo upload slots"
```

### Task 5: ParameterTable Integration and Automatic Detail Persistence

**Files:**
- Modify: `src/components/features/calibration/ParameterTable.tsx`
- Modify: `src/components/features/calibration/ParameterTable.test.tsx`
- Modify: `src/app/(protected)/calibration/edit/[id]/page.tsx`
- Modify: `src/app/(protected)/calibration/edit/[id]/page.test.tsx`

**Interfaces:**
- Consumes: `CalibrationDocumentation`, mutation hooks, and Task 4 components.
- Produces: ParameterTable props `calibrationId`, `status`, `documentationByParameter`, `isDocumentationBusy`, and `ensurePersistedDetail(parameterId)`.
- Produces: automatic save/refetch/match flow returning `Promise<number>`.

- [ ] **Step 1: Write failing ParameterTable integration tests**

Assert each parameter card includes Calibration Documentation and passes its own detail ID/metadata. Assert the card exposes a focusable `data-calibration-parameter-id` anchor for submit errors. Assert Approved status is read-only.

- [ ] **Step 2: Run ParameterTable tests and verify RED**

Run: `npm test -- src/components/features/calibration/ParameterTable.test.tsx`

- [ ] **Step 3: Implement minimal ParameterTable integration**

Add focused props rather than moving files into form values. Preserve all existing result/coefficient inputs and responsiveness.

- [ ] **Step 4: Write failing edit-page tests for `id: 0`**

Simulate selection for a newly added parameter. Assert update is called first, refetch follows, the refetched matching `parameterId` supplies a positive ID, and upload receives that ID. Assert save failure prevents upload and leaves a retry action. Assert existing positive IDs do not trigger pre-upload save.

- [ ] **Step 5: Run edit-page tests and verify RED**

Run: `npm test -- 'src/app/(protected)/calibration/edit/[id]/page.test.tsx'`

- [ ] **Step 6: Implement automatic persistence without form reset**

Extract the existing save operation so it can return authoritative refetched detail. Match by `parameterId`, validate the returned ID is positive, and return it to the slot callback. Respect the existing `saving` serialization guard and dirty snapshot protection.

- [ ] **Step 7: Verify GREEN and commit**

Run both focused suites.

```bash
git add src/components/features/calibration/ParameterTable.tsx src/components/features/calibration/ParameterTable.test.tsx 'src/app/(protected)/calibration/edit/[id]/page.tsx' 'src/app/(protected)/calibration/edit/[id]/page.test.tsx'
git commit -m "feat: integrate per-parameter photo documentation"
```

### Task 6: Submit Validation, Focus, and Upload Blocking

**Files:**
- Create: `src/lib/calibration-documentation.ts`
- Create: `src/lib/calibration-documentation.test.ts`
- Modify: `src/app/(protected)/calibration/edit/[id]/page.tsx`
- Modify: `src/app/(protected)/calibration/edit/[id]/page.test.tsx`
- Modify: `src/components/features/calibration/ParameterTable.tsx`

**Interfaces:**
- Produces: `findMissingBeforeParameterIds(parameters): string[]`.
- Produces: `canSubmitCalibrationDocumentation(parameters, busyKeys)` result with an Indonesian reason.

- [ ] **Step 1: Write failing pure validation tests**

Cover all Before present, one missing Before, every After absent, and any busy upload. Assert After never blocks submission.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- src/lib/calibration-documentation.test.ts`

- [ ] **Step 3: Implement minimal pure validation**

Return all missing parameter IDs so all cards can be marked and the first can be focused.

- [ ] **Step 4: Write failing submit behavior tests**

Assert missing Before and active upload each prevent both update and submit. Assert first invalid anchor receives focus and `scrollIntoView`; cards receive error styling. Assert complete Before plus empty After allows existing save-then-submit flow.

- [ ] **Step 5: Run page tests and verify RED**

Run: `npm test -- 'src/app/(protected)/calibration/edit/[id]/page.test.tsx'`

- [ ] **Step 6: Implement validation before existing save**

Run documentation validation before calibration-result validation and `save(false)`. Use `window.matchMedia('(prefers-reduced-motion: reduce)')` to choose `auto` versus `smooth` scrolling, then focus the anchor.

- [ ] **Step 7: Verify GREEN and commit**

Run both focused suites.

```bash
git add src/lib/calibration-documentation.ts src/lib/calibration-documentation.test.ts 'src/app/(protected)/calibration/edit/[id]/page.tsx' 'src/app/(protected)/calibration/edit/[id]/page.test.tsx' src/components/features/calibration/ParameterTable.tsx
git commit -m "feat: require before photos for calibration submit"
```

### Task 7: Read-Only Detail and Report Mapping

**Files:**
- Create: `src/components/features/calibration/CalibrationDocumentationReadOnly.tsx`
- Create: `src/components/features/calibration/CalibrationDocumentationReadOnly.test.tsx`
- Modify: `src/app/(protected)/calibration/[id]/page.tsx`
- Modify: `src/app/(protected)/calibration/[id]/page.test.tsx`
- Modify: `src/components/features/calibration/ReportPreview.test.tsx`

**Interfaces:**
- Consumes: mapped parameter documentation.
- Produces: grouped read-only documentation display with absent-After copy.

- [ ] **Step 1: Write failing read-only tests**

Assert parameters are grouped, Before/After labels are visible, images use backend preview URLs and `object-contain`, absent After renders `After Calibration: tidak didokumentasikan`, and no upload controls or raw URLs are visible.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- src/components/features/calibration/CalibrationDocumentationReadOnly.test.tsx 'src/app/(protected)/calibration/[id]/page.test.tsx'`

- [ ] **Step 3: Implement and integrate read-only section**

Place it beside the existing report/detail content without changing the backend PDF preview mechanism.

- [ ] **Step 4: Protect existing PDF behavior**

Extend `ReportPreview.test.tsx` only to assert PDF is still downloaded from `GET /print` and no frontend documentation renderer is substituted into the PDF iframe.

- [ ] **Step 5: Verify GREEN and commit**

Run all three focused suites.

```bash
git add src/components/features/calibration/CalibrationDocumentationReadOnly.tsx src/components/features/calibration/CalibrationDocumentationReadOnly.test.tsx 'src/app/(protected)/calibration/[id]/page.tsx' 'src/app/(protected)/calibration/[id]/page.test.tsx' src/components/features/calibration/ReportPreview.test.tsx
git commit -m "feat: show calibration photos in read-only detail"
```

### Task 8: Backend Integration Documentation and E2E Scenarios

**Files:**
- Modify: `docs/CALIBRATION_API_FRONTEND.md`
- Create: `docs/calibration-photo-documentation-backend-requirements.md`

**Interfaces:**
- Documents: exact request/response contracts, signed stream lifecycle, storage schema/path/adapters/quota, cleanup, submit validation, Approved behavior, integrity, and PDF requirements.

- [ ] **Step 1: Update the API contract**

Add exact JSON examples for detail metadata and upload response, multipart field name, DELETE behavior, error envelope expectations including HTTP 507, and the rule that `preview_url` is rendered unchanged.

- [ ] **Step 2: Add backend implementation requirements**

Copy every backend constraint from the approved spec, explicitly state `/root/apps/service-iot` currently has no implementation, and list the backend files/subsystems likely affected without editing them.

- [ ] **Step 3: Add executable E2E checklist**

Document scenarios for upload/replace/delete, signature authorization/expiry, local-disk streaming, quota thresholds, draft cleanup, orphan cleanup, submit enforcement, Submitted mutation, Approved rejection/reference reuse, checksum report, and A4 PDF rendering with missing After.

- [ ] **Step 4: Check docs and commit**

Run: `rg -n "TBD|TODO|implement later" docs/CALIBRATION_API_FRONTEND.md docs/calibration-photo-documentation-backend-requirements.md`

Expected: no unresolved placeholders introduced by this task.

```bash
git add docs/CALIBRATION_API_FRONTEND.md docs/calibration-photo-documentation-backend-requirements.md
git commit -m "docs: specify calibration photo backend contract"
```

### Task 9: Full Verification and Focused Code Review

**Files:**
- Modify only files necessary to correct regressions caused by Tasks 1–8.

**Interfaces:**
- Verifies: frontend feature and explicitly incomplete backend integration boundary.

- [ ] **Step 1: Run focused calibration tests**

Run:

```bash
npm test -- src/lib/calibration-photo.test.ts src/workers/calibration-photo.worker.test.ts src/lib/calibration-documentation.test.ts src/services/api/calibration.test.ts src/hook/useCalibration.test.tsx src/components/features/calibration/CalibrationPhotoSlot.test.tsx src/components/features/calibration/CalibrationDocumentation.test.tsx src/components/features/calibration/ParameterTable.test.tsx src/components/features/calibration/CalibrationDocumentationReadOnly.test.tsx 'src/app/(protected)/calibration/edit/[id]/page.test.tsx' 'src/app/(protected)/calibration/[id]/page.test.tsx' src/components/features/calibration/ReportPreview.test.tsx
```

Expected: all PASS with no unhandled warnings.

- [ ] **Step 2: Run all available validation**

Run:

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
```

Expected: exit code 0 for every command. If an existing unrelated failure occurs, record it separately; fix only failures caused by this feature.

- [ ] **Step 3: Review the diff against the spec**

Check:

- no file/Base64/documentation leaks into form or update payload;
- no constructed media URL or exposed token;
- object URLs always revoke;
- Approved has no mutation actions;
- upload errors and busy states are slot-scoped;
- missing Before blocks update and submit, while missing After does not;
- new-detail autosave cannot race existing saves;
- no backend or unrelated repository file was edited;
- documentation states integration is incomplete.

- [ ] **Step 4: Run final diff checks**

Run:

```bash
git diff --check
git status --short
git diff --stat
```

Expected: no whitespace errors; only intended frontend files and pre-existing user changes are present.

- [ ] **Step 5: Commit verification fixes if needed**

```bash
git add <only-files-corrected-during-verification>
git commit -m "fix: address calibration photo review findings"
```

Do not create an empty commit when no verification fixes are required.
