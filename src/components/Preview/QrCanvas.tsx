import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import type { QRCustomization } from '../../types/qr';

interface QrCanvasProps {
  payload: string;
  customization: QRCustomization;
  isValid: boolean;
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
}

export const QrCanvas: React.FC<QrCanvasProps> = ({
  payload,
  customization,
  isValid,
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!payload.trim() || !isValid) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      if (onCanvasReady) onCanvasReady(null);
      return;
    }

    const displaySize = Math.min(customization.size, 480);
    canvas.width = displaySize;
    canvas.height = displaySize;

    QRCode.toCanvas(canvas, payload, {
      width: displaySize,
      margin: customization.margin,
      color: {
        dark: customization.fgColor,
        light: customization.bgColor,
      },
      errorCorrectionLevel: customization.errorCorrectionLevel,
    })
      .then(() => {
        setRenderError(null);
        if (onCanvasReady) {
          onCanvasReady(canvas);
        }
      })
      .catch((err) => {
        console.error('QR rendering error:', err);
        setRenderError('Could not encode payload. Text may exceed QR capacity limit.');
        if (onCanvasReady) onCanvasReady(null);
      });
  }, [payload, customization, isValid, onCanvasReady]);

  return (
    <div className="canvas-wrapper-outer">
      <div
        className="canvas-stage"
        style={{
          backgroundColor: customization.bgColor,
        }}
      >
        {isValid && payload.trim() ? (
          <canvas
            ref={canvasRef}
            className="qr-render-canvas"
            aria-label="Generated live QR Code preview"
          />
        ) : (
          <div className="canvas-empty-state">
            <div className="empty-grid-placeholder" aria-hidden="true" />
            <p className="empty-state-title">Awaiting valid input</p>
            <p className="empty-state-sub">Enter your details to generate an instantaneous preview</p>
          </div>
        )}
      </div>

      {renderError && (
        <div className="canvas-error-alert" role="alert">
          <span>{renderError}</span>
        </div>
      )}
    </div>
  );
};
