import React, { useEffect } from 'react';
import { CheckIcon, AlertTriangleIcon, InfoIcon } from './Icons';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`toast-notification toast-${toast.type}`}
    >
      <span className="toast-icon">
        {toast.type === 'success' && <CheckIcon size={16} />}
        {toast.type === 'warning' && <AlertTriangleIcon size={16} />}
        {toast.type === 'info' && <InfoIcon size={16} />}
      </span>
      <span className="toast-text">{toast.message}</span>
      <button
        type="button"
        className="toast-close"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
};
