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
