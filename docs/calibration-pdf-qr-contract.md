# Calibration PDF QR contract

The downloadable PDF is rendered by the calibration backend. The web preview
remains a UI preview only, and requests the backend PDF through
`GET /api/calibrations/{id}/print`.

The backend owns the deterministic verification URL and QR image used by both
the API response and generated PDF:

```
{public-app-url}/verify/{verification_uuid}
```

Configure the public frontend URL on the backend/PDF service:

```
# calibration PDF/backend service
PUBLIC_CALIBRATION_FRONTEND_URL=https://app.example.com
```

`PUBLIC_CALIBRATION_FRONTEND_URL` is authoritative and produces
`https://app.example.com/verify/{verification_uuid}`. Deployments that
deliberately expose the backend verification route may instead configure the
optional explicit fallback:

```env
PUBLIC_CALIBRATION_BASE_URL=https://api.example.com/api
```

The backend must not derive either value from request `Origin`, `Referer`,
`Host`, or forwarded-host headers. Missing deterministic configuration is a
deployment error, not a request-dependent fallback.

The actual PDF template uses an image placeholder where the signature QR code
belongs:

```html
<img src="{{QR_CODE_IMAGE}}" alt="QR Code" style="width:93px; height:93px; object-fit:contain; display:block;" />
```

The backend renderer creates a QR data URL from the configured verification
URL and replaces `{{QR_CODE_IMAGE}}` before rendering the document. The
frontend consumes the returned `verification_url` and `qr_code_data_url`; it
does not reconstruct either value from browser state. Do not use the
calibration database ID or request headers as QR fallbacks because neither is a
stable public verification identifier.
