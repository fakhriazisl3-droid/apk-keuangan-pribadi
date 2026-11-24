import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { playTactileClick } from '../../utils/sound';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  isDanger = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-center animate-scale-up">
        <div
          className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
            isDanger ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'
          }`}
        >
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">{message}</p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              playTactileClick('tap');
              onCancel();
            }}
            className="btn-timbul-dark w-full py-3 px-4 rounded-xl text-slate-300 font-bold text-xs cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              playTactileClick('pop');
              onConfirm();
            }}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs text-white cursor-pointer ${
              isDanger
                ? 'btn-timbul-rose'
                : 'btn-timbul-primary'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
