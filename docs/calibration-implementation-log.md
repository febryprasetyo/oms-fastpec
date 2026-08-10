# Calibration Implementation Log

## Phase 0 — API and Technical Baseline

**Status:** Complete
**Date:** 2026-08-10

### Confirmed integration contract

- Stations use `POST /api/data/station/list` with `{ "limit": 100, "offset": 0 }`.
- A new draft starts with `POST /api/calibrations` and the minimum fields: `station_id`, `calibration_date`, `contact_person`, `phone`, and `parameter_ids`.
- Autosave and all later edits use `PUT /api/calibrations/:id`; the draft ID returned by the initial create request is retained by the client.
- Backend statuses are lowercase: `draft`, `submitted`, and `approved`. Only drafts are editable or deletable.
- The update payload contains nested `details`, `standards`, `coefficients`, `waterSamples`, and HTML `notes`.
- Public verification uses `verification_uuid` and the app route `/verify/{verification_uuid}`.
- Parameter metadata, CRM standards, acceptance ranges, and coefficient forms are frontend-owned static configuration until the backend provides master-parameter APIs.
- PDF generation stays in the backend. The protected `GET /api/calibrations/:id/print` endpoint is downloaded through the authenticated Axios client as a blob.

### Phase 1 entry criteria

- Data-layer mapping will translate backend snake_case payloads and response fields into frontend domain types.
- Validation will preserve backend-calculated results and must not calculate pass/fail in the browser.

### Backend contract required for frontend integration

- The backend owns `calculation_result` evaluation and validation. The frontend sends CRM measurements and coefficients only.
- List and detail responses include station and officer display values; detail records include `parameter_name`.
- Draft updates synchronize selected parameter IDs, CRM standards, and water samples, including removals.
- Submitting a draft uses `POST /api/calibrations/:id/submit`.
- Backend changes remain outside this frontend repository and must be available before the related UI flows are tested end-to-end.

## Phase 1 — Data Layer and Validation

**Status:** Complete  
**Date:** 2026-08-10

### Delivered

- Added the frontend-owned static configuration for parameters, CRM standards, acceptance ranges, units, and coefficient types.
- Added Zod schemas for backend create and update payloads, including nested standards and water samples.
- Replaced calibration API fallbacks with the confirmed station endpoint and typed backend response mapping.
- Added frontend mapping for backend snake_case fields, public verification UUIDs, PDF blobs, and the dedicated submit endpoint.
- Added payload serializers that preserve backend detail and standard identifiers during draft autosave updates.
- Added a React Query mutation hook for the dedicated submit endpoint.

### Validation

- `npx.cmd tsc --noEmit` completed successfully.

## Phase 2 — Form Creation Workflow

**Status:** Complete

### Confirmed inputs

- Station list items are returned in `data.values`; `id` maps to `station_id` and `coordinate` is available as a read-only display value.
- The initial autosave lifecycle is `POST` draft, `GET` detail, then `PUT` CRM defaults and later form changes.
- CRM measurements may be incomplete in a draft. Strict completeness validation belongs to the submit endpoint.
- The form does not expose a parameter remark field and sends `remark: null`.

### Delivered

- Rebuilt the create screen around station search, selected-station metadata, date input, parameter selection, and dynamic parameter cards.
- Implemented the initial draft lifecycle: create the header, retrieve backend detail IDs, then persist default CRM standards through the update endpoint.
- Added 30-second draft autosave, dirty-page protection, completion feedback, and draft action handling.
- Updated the edit submit path to save draft content first and then call the dedicated submit endpoint.

### Validation

- `npx.cmd tsc --noEmit` completed successfully.

## Phase 3 — Dashboard and Actions

**Status:** In progress

### Confirmed inputs

- List pagination is server-backed with `limit`, `offset`, optional `status`, and `total`; the default page size is 20.
- Search and sorting are client-side within the loaded page until the backend exposes dedicated query parameters.
- Approval is allowed for `adm` and `eng`; deletion is backend-restricted to drafts.
