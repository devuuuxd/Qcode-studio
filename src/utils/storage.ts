import type { HistoryItem, QRType, AnyFormData, QRCustomization } from '../types/qr';

const STORAGE_KEY = 'qr_designer_history_v1';
const MAX_HISTORY_ITEMS = 12;

function isValidHistoryItem(item: unknown): item is HistoryItem {
  if (!item || typeof item !== 'object') return false;
  const h = item as Partial<HistoryItem>;
  return (
    typeof h.id === 'string' &&
    typeof h.timestamp === 'number' &&
    typeof h.type === 'string' &&
    ['url', 'text', 'email', 'phone', 'wifi'].includes(h.type) &&
    typeof h.payload === 'string' &&
    typeof h.formData === 'object' &&
    h.formData !== null &&
    typeof h.customization === 'object' &&
    h.customization !== null &&
    typeof h.customization.fgColor === 'string' &&
    typeof h.customization.bgColor === 'string'
  );
}

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidHistoryItem).slice(0, MAX_HISTORY_ITEMS);
  } catch (err) {
    console.warn('Failed to parse QR history from localStorage, resetting cache:', err);
    return [];
  }
}

export function saveHistoryItem(
  type: QRType,
  title: string,
  payload: string,
  formData: AnyFormData,
  customization: QRCustomization,
  presetId?: string
): HistoryItem[] {
  if (!payload.trim()) return loadHistory();

  try {
    const current = loadHistory();

    const existingIndex = current.findIndex(
      (item) =>
        item.payload === payload &&
        item.customization.fgColor === customization.fgColor &&
        item.customization.bgColor === customization.bgColor &&
        item.customization.margin === customization.margin &&
        item.customization.errorCorrectionLevel === customization.errorCorrectionLevel
    );

    const newItem: HistoryItem = {
      id: existingIndex !== -1 ? current[existingIndex].id : `qr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      type,
      title,
      payload,
      formData: JSON.parse(JSON.stringify(formData)),
      customization: { ...customization },
      presetId,
    };

    let updated: HistoryItem[];
    if (existingIndex !== -1) {
      updated = [newItem, ...current.filter((_, idx) => idx !== existingIndex)];
    } else {
      updated = [newItem, ...current];
    }

    const trimmed = updated.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    return trimmed;
  } catch (err) {
    console.warn('Unable to persist QR code to localStorage:', err);
    return loadHistory();
  }
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  try {
    const current = loadHistory();
    const filtered = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.warn('Failed to delete history item:', err);
    return loadHistory();
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear history from localStorage:', err);
  }
}
