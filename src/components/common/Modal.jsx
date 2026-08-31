import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className={`relative w-full ${maxWidth} bg-white text-slate-900 border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden transition-all transform max-h-[92vh] flex flex-col`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-outfit truncate">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 active:scale-95 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 text-left">
          {children}
        </div>

      </div>
    </div>
  );
}
