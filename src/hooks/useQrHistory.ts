import { useState, useMemo, useCallback } from 'react';
import type {
  HistoryItem,
  QRType,
  AnyFormData,
  QRCustomization,
} from '../types/qr';
import {
  loadHistory,
  saveHistoryItem,
  deleteHistoryItem,
  clearAllHistory,
  togglePinHistoryItem,
  renameHistoryItem,
} from '../utils/storage';

export interface UseQrHistoryReturn {
  history: HistoryItem[];
  filteredHistory: HistoryItem[];
  activeHistoryId: string | undefined;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setActiveHistoryId: (id: string | undefined) => void;
  saveItem: (
    type: QRType,
    title: string,
    payload: string,
    formData: AnyFormData,
    customization: QRCustomization,
    presetId?: string,
    customName?: string
  ) => void;
  deleteItem: (id: string) => void;
  clearAll: () => void;
  togglePin: (id: string) => void;
  renameItem: (id: string, newName: string) => void;
}

export function useQrHistory(): UseQrHistoryReturn {
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());
  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  const saveItem = useCallback(
    (
      type: QRType,
      title: string,
      payload: string,
      formData: AnyFormData,
      customization: QRCustomization,
      presetId?: string,
      customName?: string
    ) => {
      const updated = saveHistoryItem(
        type,
        title,
        payload,
        formData,
        customization,
        presetId,
        customName
      );
      setHistory(updated);
    },
    []
  );

  const deleteItem = useCallback(
    (id: string) => {
      const updated = deleteHistoryItem(id);
      setHistory(updated);
      if (activeHistoryId === id) {
        setActiveHistoryId(undefined);
      }
    },
    [activeHistoryId]
  );

  const clearAll = useCallback(() => {
    clearAllHistory();
    setHistory([]);
    setActiveHistoryId(undefined);
  }, []);

  const togglePin = useCallback((id: string) => {
    const updated = togglePinHistoryItem(id);
    setHistory(updated);
  }, []);

  const renameItem = useCallback((id: string, newName: string) => {
    const updated = renameHistoryItem(id, newName);
    setHistory(updated);
  }, []);

  const filteredHistory = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return history;

    return history.filter((item) => {
      const matchesTitle = item.title.toLowerCase().includes(query);
      const matchesCustom = item.customName?.toLowerCase().includes(query);
      const matchesPayload = item.payload.toLowerCase().includes(query);
      const matchesType = item.type.toLowerCase().includes(query);
      return matchesTitle || matchesCustom || matchesPayload || matchesType;
    });
  }, [history, searchQuery]);

  return {
    history,
    filteredHistory,
    activeHistoryId,
    searchQuery,
    setSearchQuery,
    setActiveHistoryId,
    saveItem,
    deleteItem,
    clearAll,
    togglePin,
    renameItem,
  };
}
