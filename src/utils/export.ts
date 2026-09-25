import QRCode from 'qrcode';
import type { QRCustomization } from '../types/qr';

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
  canvas.width = exportSize;
  canvas.height = exportSize;

  await QRCode.toCanvas(canvas, payload, {
    width: exportSize,
    margin: customization.margin,
    color: {
      dark: customization.fgColor,
      light: customization.bgColor,
    },
    errorCorrectionLevel: customization.errorCorrectionLevel,
  });

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
  const svgString = await QRCode.toString(payload, {
    type: 'svg',
    margin: customization.margin,
    color: {
      dark: customization.fgColor,
      light: customization.bgColor,
    },
    errorCorrectionLevel: customization.errorCorrectionLevel,
  });

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
  canvas.width = exportSize;
  canvas.height = exportSize;

  await QRCode.toCanvas(canvas, payload, {
    width: exportSize,
    margin: customization.margin,
    color: {
      dark: customization.fgColor,
      light: customization.bgColor,
    },
    errorCorrectionLevel: customization.errorCorrectionLevel,
  });

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

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}
