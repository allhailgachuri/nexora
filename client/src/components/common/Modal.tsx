import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '2xl'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl'
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0E1411]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className={`relative w-full ${maxWidthClass} rounded-[2.5rem] bg-[#171C19] border border-[#2E4036] p-6 sm:p-8 shadow-organic-hover z-10 my-8 overflow-hidden`}>
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2E4036] via-[#CC5833] to-[#708A7C]" />

        <div className="flex items-start justify-between pb-4 border-b border-[#26372E]">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-[#94A39B] mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#94A39B] hover:text-white bg-[#142019] hover:bg-[#1E2622] border border-[#26372E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 max-h-[75vh] overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
};
