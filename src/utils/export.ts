import JSZip from 'jszip';
import type { QRCustomization } from '../types/qr';
import { renderQrToCanvas, renderQrToSvg } from './qrRenderer';

export interface ExportOptions {
  filename?: string;
  exportSize?: number;
}

export async function downloadPng(
  payload: string,
  customization: QRCustomization,
  options?: ExportOptions
): Promise<void> {
  const exportSize = options?.exportSize || customization.size || 512;
  const filename = options?.filename || `qr-code-${Date.now()}.png`;

  const canvas = document.createElement('canvas');
  const success = await renderQrToCanvas(canvas, payload, customization, exportSize);
  if (!success) {
    throw new Error('Failed to render QR for PNG export');
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to generate image blob from canvas'));
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      resolve();
    }, 'image/png');
  });
}

export async function downloadSvg(
  payload: string,
  customization: QRCustomization,
  filename = `qr-code-${Date.now()}.svg`
): Promise<void> {
  const svgString = await renderQrToSvg(payload, customization);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function copyQrToClipboard(
  payload: string,
  customization: QRCustomization
): Promise<boolean> {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    throw new Error('Clipboard image writing is not supported by your browser.');
  }

  const exportSize = 600;
  const canvas = document.createElement('canvas');
  const success = await renderQrToCanvas(canvas, payload, customization, exportSize);
  if (!success) {
    throw new Error('Failed to render QR for clipboard copy');
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('Canvas could not produce blob'));
        return;
      }
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    }, 'image/png');
  });
}

export async function downloadBatchZip(
  items: Array<{ payload: string; name: string }>,
  customization: QRCustomization,
  zipFilename = `qcode-batch-${Date.now()}.zip`
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('qr-codes') || zip;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const canvas = document.createElement('canvas');
    await renderQrToCanvas(canvas, item.payload, customization, 512);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });

    if (blob) {
      const safeName = (item.name || `qr-${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${String(i + 1).padStart(2, '0')}-${safeName}.png`;
      folder.file(filename, blob);
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}
