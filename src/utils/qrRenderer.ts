import QRCode from 'qrcode';
import jsQR from 'jsqr';
import type { QRCustomization } from '../types/qr';

function isFinderPattern(row: number, col: number, size: number): boolean {
  if (row < 7 && col < 7) return true;
  if (row < 7 && col >= size - 7) return true;
  if (row >= size - 7 && col < 7) return true;
  return false;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function renderQrToCanvas(
  canvas: HTMLCanvasElement,
  payload: string,
  customization: QRCustomization,
  renderSize?: number
): Promise<boolean> {
  if (!payload.trim()) return false;

  const size = renderSize || customization.size;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  const qr = QRCode.create(payload, {
    errorCorrectionLevel: customization.errorCorrectionLevel,
  });

  const moduleCount = qr.modules.size;
  const margin = customization.margin;
  const totalCells = moduleCount + margin * 2;
  const cellSize = size / totalCells;

  ctx.fillStyle = customization.bgColor;
  ctx.fillRect(0, 0, size, size);

  let fillStyle: string | CanvasGradient = customization.fgColor;
  if (customization.gradientEnabled && customization.gradientDirection !== 'none') {
    let grad: CanvasGradient;
    if (customization.gradientDirection === 'vertical') {
      grad = ctx.createLinearGradient(0, 0, 0, size);
    } else if (customization.gradientDirection === 'horizontal') {
      grad = ctx.createLinearGradient(0, 0, size, 0);
    } else {
      grad = ctx.createLinearGradient(0, 0, size, size);
    }
    grad.addColorStop(0, customization.fgColor);
    grad.addColorStop(1, customization.gradientColor);
    fillStyle = grad;
  }

  const hasLogo = Boolean(customization.logoDataUrl);
  const logoPercent = Math.max(10, Math.min(30, customization.logoSize || 20)) / 100;
  const logoPixelSize = size * logoPercent;
  const centerCoord = size / 2;
  const logoClearHalf = hasLogo ? (logoPixelSize / 2) + cellSize : 0;

  ctx.fillStyle = fillStyle;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!qr.modules.get(row, col)) continue;

      const x = (col + margin) * cellSize;
      const y = (row + margin) * cellSize;

      if (hasLogo) {
        const modCenterX = x + cellSize / 2;
        const modCenterY = y + cellSize / 2;
        if (
          Math.abs(modCenterX - centerCoord) < logoClearHalf &&
          Math.abs(modCenterY - centerCoord) < logoClearHalf
        ) {
          continue;
        }
      }

      const inFinder = isFinderPattern(row, col, moduleCount);

      if (inFinder || customization.moduleStyle === 'square') {
        ctx.fillRect(x, y, cellSize + 0.1, cellSize + 0.1);
      } else if (customization.moduleStyle === 'rounded') {
        drawRoundedRect(ctx, x, y, cellSize + 0.1, cellSize + 0.1, cellSize * 0.28);
      } else if (customization.moduleStyle === 'dots') {
        ctx.beginPath();
        ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.44, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  if (hasLogo && customization.logoDataUrl) {
    try {
      const img = await loadImage(customization.logoDataUrl);
      const lx = (size - logoPixelSize) / 2;
      const ly = (size - logoPixelSize) / 2;
      const pad = cellSize * 0.5;

      ctx.fillStyle = customization.bgColor;
      ctx.fillRect(lx - pad, ly - pad, logoPixelSize + pad * 2, logoPixelSize + pad * 2);

      ctx.lineWidth = Math.max(1, cellSize * 0.2);
      ctx.strokeStyle = customization.fgColor;
      ctx.strokeRect(lx - pad, ly - pad, logoPixelSize + pad * 2, logoPixelSize + pad * 2);

      ctx.drawImage(img, lx, ly, logoPixelSize, logoPixelSize);
    } catch {
      return false;
    }
  }

  return true;
}

export function verifyCanvasOpticalDecode(canvas: HTMLCanvasElement): {
  success: boolean;
  data?: string;
  error?: string;
} {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return { success: false, error: 'No 2D context' };

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imgData.data, imgData.width, imgData.height);
    if (code && code.data) {
      return { success: true, data: code.data };
    }
    return { success: false, error: 'Could not optically decode pattern' };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function renderQrToSvg(
  payload: string,
  customization: QRCustomization
): Promise<string> {
  const qr = QRCode.create(payload, {
    errorCorrectionLevel: customization.errorCorrectionLevel,
  });

  const moduleCount = qr.modules.size;
  const margin = customization.margin;
  const totalCells = moduleCount + margin * 2;
  const size = customization.size || 512;
  const cellSize = size / totalCells;

  const hasLogo = Boolean(customization.logoDataUrl);
  const logoPercent = Math.max(10, Math.min(30, customization.logoSize || 20)) / 100;
  const logoPixelSize = size * logoPercent;
  const centerCoord = size / 2;
  const logoClearHalf = hasLogo ? (logoPixelSize / 2) + cellSize : 0;

  const isGrad = customization.gradientEnabled && customization.gradientDirection !== 'none';
  let gradDef = '';
  let fillTarget = customization.fgColor;

  if (isGrad) {
    let x1 = '0%';
    let y1 = '0%';
    let x2 = '0%';
    let y2 = '100%';
    if (customization.gradientDirection === 'horizontal') {
      x2 = '100%';
      y2 = '0%';
    } else if (customization.gradientDirection === 'diagonal') {
      x2 = '100%';
      y2 = '100%';
    }
    gradDef = `<defs><linearGradient id="qr-grad" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0%" stop-color="${customization.fgColor}"/><stop offset="100%" stop-color="${customization.gradientColor}"/></linearGradient></defs>`;
    fillTarget = 'url(#qr-grad)';
  }

  let paths = '';

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!qr.modules.get(row, col)) continue;

      const x = (col + margin) * cellSize;
      const y = (row + margin) * cellSize;

      if (hasLogo) {
        const modCenterX = x + cellSize / 2;
        const modCenterY = y + cellSize / 2;
        if (
          Math.abs(modCenterX - centerCoord) < logoClearHalf &&
          Math.abs(modCenterY - centerCoord) < logoClearHalf
        ) {
          continue;
        }
      }

      const inFinder = isFinderPattern(row, col, moduleCount);

      if (inFinder || customization.moduleStyle === 'square') {
        paths += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" fill="${fillTarget}"/>`;
      } else if (customization.moduleStyle === 'rounded') {
        const r = (cellSize * 0.28).toFixed(2);
        paths += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" rx="${r}" fill="${fillTarget}"/>`;
      } else if (customization.moduleStyle === 'dots') {
        const cx = (x + cellSize / 2).toFixed(2);
        const cy = (y + cellSize / 2).toFixed(2);
        const cr = (cellSize * 0.44).toFixed(2);
        paths += `<circle cx="${cx}" cy="${cy}" r="${cr}" fill="${fillTarget}"/>`;
      }
    }
  }

  let logoElements = '';
  if (hasLogo && customization.logoDataUrl) {
    const lx = (size - logoPixelSize) / 2;
    const ly = (size - logoPixelSize) / 2;
    const pad = cellSize * 0.5;
    logoElements = `<rect x="${(lx - pad).toFixed(2)}" y="${(ly - pad).toFixed(2)}" width="${(logoPixelSize + pad * 2).toFixed(2)}" height="${(logoPixelSize + pad * 2).toFixed(2)}" fill="${customization.bgColor}" stroke="${customization.fgColor}" stroke-width="${Math.max(1, cellSize * 0.2).toFixed(2)}"/><image href="${customization.logoDataUrl}" x="${lx.toFixed(2)}" y="${ly.toFixed(2)}" width="${logoPixelSize.toFixed(2)}" height="${logoPixelSize.toFixed(2)}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="100%" height="100%" fill="${customization.bgColor}"/>${gradDef}${paths}${logoElements}</svg>`;
}
