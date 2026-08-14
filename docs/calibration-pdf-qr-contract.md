# Calibration PDF QR contract

The downloadable PDF is rendered by the calibration backend through
`generateCalibrationPdf`. The web preview remains a UI preview only.

Both renderers encode the same value:

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

`PdfGenerator.ts` creates a deterministic SVG from `verification_uuid` and
inserts it into that element before Puppeteer renders the document. Do not use
the calibration database ID or the request host as a QR fallback: neither is a
stable public verification identifier.
