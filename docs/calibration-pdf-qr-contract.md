# Calibration PDF QR contract

The downloadable PDF is rendered by the calibration backend. The web preview
remains a UI preview only, and requests the backend PDF through
`GET /api/calibrations/{id}/print`.

The preview and backend-generated PDF encode the same verification value:

```
{public-app-url}/verify/{verification_uuid}
```

Configure the same public URL in both deployments:

```
# web frontend
NEXT_PUBLIC_APP_URL=https://app.example.com

# calibration PDF/backend service
CALIBRATION_PUBLIC_URL=https://app.example.com
```

The PDF template must include this element where the signature QR code belongs:

```html
<div data-calibration-qr aria-label="Calibration verification QR code"></div>
```

The backend PDF renderer creates a deterministic QR image from
`verification_uuid` and inserts it into that element before Puppeteer renders
the document. Do not use the calibration database ID or the request host as a
QR fallback: neither is a stable public verification identifier.
