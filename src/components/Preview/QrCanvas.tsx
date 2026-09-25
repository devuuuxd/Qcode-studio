import React, { useEffect, useRef, useState } from 'react';
import type { QRCustomization } from '../../types/qr';
import { renderQrToCanvas, verifyCanvasOpticalDecode } from '../../utils/qrRenderer';

interface QrCanvasProps {
  payload: string;
  customization: QRCustomization;
  isValid: boolean;
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
  onOpticalDecodeResult?: (res: { success: boolean; data?: string; error?: string }) => void;
}

export const QrCanvas: React.FC<QrCanvasProps> = ({
  payload,
  customization,
  isValid,
  onCanvasReady,
  onOpticalDecodeResult,
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
      if (onOpticalDecodeResult) {
        onOpticalDecodeResult({ success: false, error: 'Awaiting valid input' });
      }
      return;
    }

    const displaySize = Math.min(customization.size, 480);

    renderQrToCanvas(canvas, payload, customization, displaySize)
      .then((ok) => {
        if (!ok) {
          setRenderError('Could not encode payload. Text may exceed QR capacity limit.');
          if (onCanvasReady) onCanvasReady(null);
          if (onOpticalDecodeResult) {
            onOpticalDecodeResult({ success: false, error: 'Render failed' });
          }
          return;
        }

        setRenderError(null);
        if (onCanvasReady) {
          onCanvasReady(canvas);
        }

        const decodeRes = verifyCanvasOpticalDecode(canvas);
        if (onOpticalDecodeResult) {
          onOpticalDecodeResult(decodeRes);
        }
      })
      .catch((err) => {
        setRenderError('Could not encode payload. Text may exceed QR capacity limit.');
        if (onCanvasReady) onCanvasReady(null);
        if (onOpticalDecodeResult) {
          onOpticalDecodeResult({ success: false, error: String(err) });
        }
      });
  }, [payload, customization, isValid, onCanvasReady, onOpticalDecodeResult]);

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
