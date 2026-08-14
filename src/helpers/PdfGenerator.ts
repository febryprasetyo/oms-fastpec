import path from 'path';
import fs from 'fs/promises';
import puppeteer from 'puppeteer';
import { CalibrationDetail } from '@/types/calibration';
import { JSDOM } from 'jsdom';
import qrcode from 'qrcode-generator';
import { getCalibrationVerificationUrl } from '@/lib/calibration-verification';

/**
 * Generate a PDF Buffer for a given calibration detail.
 * It loads the static HTML template located at `.agents/Calibration_Report.html`,
 * injects the calibration data into the DOM, and uses Puppeteer to render a PDF.
 */
export async function generateCalibrationPdf(
  detail: CalibrationDetail,
  publicAppUrl = process.env.CALIBRATION_PUBLIC_URL ?? process.env.NEXT_PUBLIC_APP_URL,
): Promise<Buffer> {
  // Resolve the path of the HTML template (relative to project root)
  const templatePath = path.resolve(process.cwd(), '.agents', 'Calibration_Report.html');
  const html = await fs.readFile(templatePath, { encoding: 'utf-8' });

  // Use JSDOM to manipulate the HTML and replace placeholders.
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // The PDF service owns the QR image. It must use the verification UUID, not
  // the database ID or a request/browser origin, so it stays stable over time.
  const qrContainer = document.querySelector('[data-calibration-qr]');
  if (qrContainer && detail.uuid) {
    if (!publicAppUrl) {
      throw new Error('CALIBRATION_PUBLIC_URL must be configured before generating a calibration PDF.');
    }

    const verificationUrl = getCalibrationVerificationUrl(detail.uuid, publicAppUrl);
    const qr = qrcode(0, 'M');
    qr.addData(verificationUrl);
    qr.make();
    qrContainer.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    qrContainer.setAttribute('data-verification-url', verificationUrl);
  }

  // Helper to set innerText safely (fallback to empty string)
  const setText = (selector: string, value: string | number | undefined) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value != null ? String(value) : '';
  };

  // Populate station information (header table)
  setText('.st-val:nth-child(2)', detail.stationName);
  setText('.st-val:nth-child(4)', detail.address);
  setText('.st-val:nth-child(6)', `${detail.latitude} | ${detail.longitude}`);
  setText('.st-val:nth-child(8)', detail.phone);

  // Calibration metadata
  setText('.doc-no-title', `Report No: ${detail.reportNo}`);
  setText('.doc-main-title', 'CALIBRATION REPORT');

  // Populate parameter calibration rows – we will rebuild the body content.
  const tbody = document.querySelector('.cal-table tbody');
  if (tbody) {
    tbody.innerHTML = '';
    detail.parameters.forEach((param) => {
      const tr = document.createElement('tr');
      // Parameter name
      const tdParam = document.createElement('td');
      tdParam.className = 'font-bold';
      tdParam.textContent = param.parameterName;
      tr.appendChild(tdParam);

      // Spec
      const tdSpec = document.createElement('td');
      tdSpec.className = 'text-center';
      tdSpec.textContent = param.spec;
      tr.appendChild(tdSpec);

      // CRM / Standard Level – concatenate result.standardName values
      const tdCRM = document.createElement('td');
      tdCRM.innerHTML = param.results.map(r => r.standardName).join('<br>');
      tr.appendChild(tdCRM);

      // Calibration Result – concatenate result.value values
      const tdResult = document.createElement('td');
      tdResult.innerHTML = param.results.map(r => r.value).join('<br>');
      tr.appendChild(tdResult);

      // Internal Coeff – concatenate key/value pairs
      const tdCoeff = document.createElement('td');
      tdCoeff.innerHTML = param.coefficients.map(c => `${c.key}: ${c.value}`).join('<br>');
      tr.appendChild(tdCoeff);

      tbody.appendChild(tr);
    });
  }

  // Populate water sample table – rebuild its body similarly.
  const sampleBody = document.querySelector('.sample-table tbody');
  if (sampleBody) {
    sampleBody.innerHTML = '';
    detail.waterSamples.forEach((sample) => {
      const tr = document.createElement('tr');
      const tdName = document.createElement('td');
      tdName.className = 'font-bold';
      tdName.style.textAlign = 'left';
      tdName.textContent = sample.sampleName;
      tr.appendChild(tdName);

      const addCell = (value?: number) => {
        const td = document.createElement('td');
        td.textContent = value != null ? String(value) : '';
        return td;
      };

      tr.appendChild(addCell(sample.temperature));
      tr.appendChild(addCell(sample.doValue));
      tr.appendChild(addCell(sample.tds));
      tr.appendChild(addCell(sample.turbidity));
      tr.appendChild(addCell(sample.ph));
      tr.appendChild(addCell(sample.cod));
      tr.appendChild(addCell(sample.bod));
      tr.appendChild(addCell(sample.tss));
      tr.appendChild(addCell(sample.nh3));
      tr.appendChild(addCell(sample.no3));

      sampleBody.appendChild(tr);
    });
  }

  // Notes – simple insertion
  const notesBox = document.querySelector('.notes-box');
  if (notesBox) {
    notesBox.innerHTML = `<strong>Notes:</strong><ul>${detail.notes || ''}</ul>`;
  }

  // Render PDF via Puppeteer.
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(dom.serialize(), { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', right: '15mm', bottom: '12mm', left: '15mm' },
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}
