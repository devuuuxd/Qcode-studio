import type {
  HistoryItem,
  QRType,
  AnyFormData,
  QRCustomization,
  QRTemplate,
  ThemeMode,
  ConfigExport,
} from '../types/qr';

const STORAGE_KEY_HISTORY = 'qr_designer_history_v1';
const STORAGE_KEY_TEMPLATES = 'qr_designer_templates_v1';
const STORAGE_KEY_THEME = 'qr_designer_theme_v1';
const MAX_HISTORY_ITEMS = 12;

const FALLBACK_CUSTOMIZATION: QRCustomization = {
  size: 360,
  fgColor: '#0f172a',
  bgColor: '#ffffff',
  errorCorrectionLevel: 'M',
  margin: 4,
  moduleStyle: 'square',
  gradientEnabled: false,
  gradientColor: '#334155',
  gradientDirection: 'vertical',
  logoDataUrl: null,
  logoSize: 20,
  label: '',
};

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

function normalizeCustomization(raw: Partial<QRCustomization> | undefined): QRCustomization {
  return {
    size: typeof raw?.size === 'number' ? raw.size : FALLBACK_CUSTOMIZATION.size,
    fgColor: typeof raw?.fgColor === 'string' ? raw.fgColor : FALLBACK_CUSTOMIZATION.fgColor,
    bgColor: typeof raw?.bgColor === 'string' ? raw.bgColor : FALLBACK_CUSTOMIZATION.bgColor,
    errorCorrectionLevel: raw?.errorCorrectionLevel || FALLBACK_CUSTOMIZATION.errorCorrectionLevel,
    margin: typeof raw?.margin === 'number' ? raw.margin : FALLBACK_CUSTOMIZATION.margin,
    moduleStyle: raw?.moduleStyle || 'square',
    gradientEnabled: Boolean(raw?.gradientEnabled),
    gradientColor: typeof raw?.gradientColor === 'string' ? raw.gradientColor : FALLBACK_CUSTOMIZATION.gradientColor,
    gradientDirection: raw?.gradientDirection || 'vertical',
    logoDataUrl: typeof raw?.logoDataUrl === 'string' ? raw.logoDataUrl : null,
    logoSize: typeof raw?.logoSize === 'number' ? raw.logoSize : 20,
    label: typeof raw?.label === 'string' ? raw.label : '',
  };
}

export function loadHistory(): HistoryItem[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isValidHistoryItem)
      .map((item) => ({
        ...item,
        customization: normalizeCustomization(item.customization),
      }))
      .slice(0, MAX_HISTORY_ITEMS);
  } catch {
    return [];
  }
}

export function saveHistoryItem(
  type: QRType,
  title: string,
  payload: string,
  formData: AnyFormData,
  customization: QRCustomization,
  presetId?: string,
  customName?: string
): HistoryItem[] {
  if (!payload.trim()) return loadHistory();

  try {
    if (typeof localStorage === 'undefined') return [];
    const current = loadHistory();

    const existingIndex = current.findIndex(
      (item) =>
        item.payload === payload &&
        item.customization.fgColor === customization.fgColor &&
        item.customization.bgColor === customization.bgColor &&
        item.customization.margin === customization.margin &&
        item.customization.errorCorrectionLevel === customization.errorCorrectionLevel &&
        item.customization.moduleStyle === customization.moduleStyle &&
        item.customization.gradientEnabled === customization.gradientEnabled &&
        item.customization.gradientColor === customization.gradientColor
    );

    const isPinned = existingIndex !== -1 ? Boolean(current[existingIndex].pinned) : false;
    const existingCustomName = existingIndex !== -1 ? current[existingIndex].customName : undefined;

    const newItem: HistoryItem = {
      id: existingIndex !== -1
        ? current[existingIndex].id
        : `qr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      type,
      title,
      payload,
      formData: JSON.parse(JSON.stringify(formData)),
      customization: { ...customization },
      presetId,
      pinned: isPinned,
      customName: customName || existingCustomName,
    };

    let updated: HistoryItem[];
    if (existingIndex !== -1) {
      updated = [newItem, ...current.filter((_, idx) => idx !== existingIndex)];
    } else {
      updated = [newItem, ...current];
    }

    const pinnedItems = updated.filter((item) => item.pinned);
    const unpinnedItems = updated.filter((item) => !item.pinned);
    const sorted = [...pinnedItems, ...unpinnedItems].slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(sorted));
    return sorted;
  } catch {
    return loadHistory();
  }
}

export function togglePinHistoryItem(id: string): HistoryItem[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const current = loadHistory();
    const updated = current.map((item) =>
      item.id === id ? { ...item, pinned: !item.pinned } : item
    );

    const pinnedItems = updated.filter((item) => item.pinned);
    const unpinnedItems = updated.filter((item) => !item.pinned);
    const sorted = [...pinnedItems, ...unpinnedItems];

    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(sorted));
    return sorted;
  } catch {
    return loadHistory();
  }
}

export function renameHistoryItem(id: string, customName: string): HistoryItem[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const current = loadHistory();
    const updated = current.map((item) =>
      item.id === id ? { ...item, customName: customName.trim() } : item
    );
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    return updated;
  } catch {
    return loadHistory();
  }
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const current = loadHistory();
    const filtered = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(filtered));
    return filtered;
  } catch {
    return loadHistory();
  }
}

export function clearAllHistory(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    }
  } catch {
    return;
  }
}

export function loadTemplates(): QRTemplate[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY_TEMPLATES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t) =>
        t &&
        typeof t.id === 'string' &&
        typeof t.name === 'string' &&
        typeof t.customization === 'object'
    ).map((t) => ({
      ...t,
      customization: normalizeCustomization(t.customization),
    }));
  } catch {
    return [];
  }
}

export function saveTemplate(name: string, customization: QRCustomization): QRTemplate[] {
  const cleanName = name.trim() || 'Untitled Style';
  try {
    if (typeof localStorage === 'undefined') return [];
    const current = loadTemplates();
    const newTemplate: QRTemplate = {
      id: `tmpl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: cleanName,
      createdAt: Date.now(),
      customization: { ...customization, logoDataUrl: null },
    };
    const updated = [newTemplate, ...current].slice(0, 30);
    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(updated));
    return updated;
  } catch {
    return loadTemplates();
  }
}

export function deleteTemplate(id: string): QRTemplate[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const current = loadTemplates();
    const filtered = current.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(filtered));
    return filtered;
  } catch {
    return loadTemplates();
  }
}

export function loadTheme(): ThemeMode {
  try {
    if (typeof localStorage === 'undefined') return 'system';
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
    return 'system';
  } catch {
    return 'system';
  }
}

export function saveTheme(theme: ThemeMode): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    }
  } catch {
    return;
  }
}

export function exportConfiguration(
  type: QRType,
  formData: AnyFormData,
  customization: QRCustomization
): ConfigExport {
  return {
    version: '1.0',
    timestamp: Date.now(),
    type,
    formData: JSON.parse(JSON.stringify(formData)),
    customization: { ...customization },
  };
}

export function validateAndParseConfig(
  jsonString: string
): { valid: boolean; data?: ConfigExport; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'JSON payload is not an object.' };
    }
    if (!['url', 'text', 'email', 'phone', 'wifi'].includes(parsed.type)) {
      return { valid: false, error: 'Invalid or unsupported QR type.' };
    }
    if (!parsed.formData || typeof parsed.formData !== 'object') {
      return { valid: false, error: 'Missing or invalid form data.' };
    }
    if (!parsed.customization || typeof parsed.customization !== 'object') {
      return { valid: false, error: 'Missing customization object.' };
    }

    const validated: ConfigExport = {
      version: typeof parsed.version === 'string' ? parsed.version : '1.0',
      timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : Date.now(),
      type: parsed.type,
      formData: parsed.formData,
      customization: normalizeCustomization(parsed.customization),
    };

    return { valid: true, data: validated };
  } catch (err) {
    return { valid: false, error: `Invalid JSON syntax: ${String(err)}` };
  }
}

export function encodeShareableConfig(
  type: QRType,
  formData: AnyFormData,
  customization: QRCustomization
): string {
  const exportable = {
    t: type,
    d: formData,
    c: {
      s: customization.size,
      f: customization.fgColor,
      b: customization.bgColor,
      e: customization.errorCorrectionLevel,
      m: customization.margin,
      st: customization.moduleStyle,
      ge: customization.gradientEnabled ? 1 : 0,
      gc: customization.gradientColor,
      gd: customization.gradientDirection,
      l: customization.label || '',
    },
  };
  const json = JSON.stringify(exportable);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeShareableConfig(
  encoded: string
): {
  valid: boolean;
  data?: { type: QRType; formData: AnyFormData; customization: QRCustomization };
  error?: string;
} {
  try {
    const raw = encoded.startsWith('#config=') ? encoded.slice(8) : encoded.replace(/^#/, '');
    if (!raw) return { valid: false, error: 'Empty share parameter' };

    const binary = atob(raw);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);

    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'Decoded data is not an object' };
    }
    if (!['url', 'text', 'email', 'phone', 'wifi'].includes(parsed.t)) {
      return { valid: false, error: 'Invalid QR type in share data' };
    }

    const c = parsed.c || {};
    const customization: QRCustomization = {
      size: typeof c.s === 'number' ? c.s : FALLBACK_CUSTOMIZATION.size,
      fgColor: typeof c.f === 'string' ? c.f : FALLBACK_CUSTOMIZATION.fgColor,
      bgColor: typeof c.b === 'string' ? c.b : FALLBACK_CUSTOMIZATION.bgColor,
      errorCorrectionLevel: c.e || FALLBACK_CUSTOMIZATION.errorCorrectionLevel,
      margin: typeof c.m === 'number' ? c.m : FALLBACK_CUSTOMIZATION.margin,
      moduleStyle: c.st || 'square',
      gradientEnabled: Boolean(c.ge),
      gradientColor: typeof c.gc === 'string' ? c.gc : FALLBACK_CUSTOMIZATION.gradientColor,
      gradientDirection: c.gd || 'vertical',
      logoDataUrl: null,
      logoSize: 20,
      label: typeof c.l === 'string' ? c.l : '',
    };

    return {
      valid: true,
      data: {
        type: parsed.t as QRType,
        formData: parsed.d as AnyFormData,
        customization,
      },
    };
  } catch (err) {
    return { valid: false, error: String(err) };
  }
}
