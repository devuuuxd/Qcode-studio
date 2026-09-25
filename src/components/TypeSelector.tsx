import React from 'react';
import type { QRType } from '../types/qr';
import { LinkIcon, TextIcon, MailIcon, PhoneIcon, WifiIcon } from './common/Icons';

interface TypeSelectorProps {
  selectedType: QRType;
  onSelectType: (type: QRType) => void;
}

interface TypeItem {
  id: QRType;
  label: string;
  icon: React.FC<{ size?: number }>;
}

const TYPES: TypeItem[] = [
  { id: 'url', label: 'URL', icon: LinkIcon },
  { id: 'text', label: 'Text', icon: TextIcon },
  { id: 'email', label: 'Email', icon: MailIcon },
  { id: 'phone', label: 'Phone', icon: PhoneIcon },
  { id: 'wifi', label: 'Wi-Fi', icon: WifiIcon },
];

export const TypeSelector: React.FC<TypeSelectorProps> = ({ selectedType, onSelectType }) => {
  return (
    <div className="type-nav-strip" role="tablist" aria-label="QR Code Type Selection">
      {TYPES.map((t) => {
        const Icon = t.icon;
        const isActive = selectedType === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${t.id}`}
            className={`type-tab-btn ${isActive ? 'tab-active' : ''}`}
            onClick={() => onSelectType(t.id)}
          >
            <Icon size={14} />
            <span className="tab-label">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};
