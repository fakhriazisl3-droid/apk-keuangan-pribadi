import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalTitle: string;
  targetAmount: number;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  goalTitle,
  targetAmount,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti burst
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl text-center animate-scale-up overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />

        <div className="relative">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-xl shadow-amber-500/30 flex items-center justify-center mb-5 animate-bounce">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Trophy className="w-10 h-10 text-amber-400" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Target Tercapai 100%!
          </div>

          <h3 className="text-2xl font-black text-white tracking-tight mb-2">
            Selamat, Anda Berhasil!
          </h3>

          <p className="text-slate-300 text-sm mb-4 leading-relaxed">
            Target tabungan <span className="font-bold text-white">"{goalTitle}"</span> senilai{' '}
            <span className="font-bold text-emerald-400">{formatCurrency(targetAmount)}</span> telah sukses terkumpul penuh!
          </p>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 mb-6 flex items-center gap-3 text-left">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <span>Kedisiplinan finansial Anda luar biasa. Waktunya mewujudkan impian ini atau mengalihkannya ke target berikutnya!</span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-base shadow-lg shadow-emerald-500/30 transition active:scale-95 cursor-pointer"
          >
            Hebat, Lanjutkan! 🎉
          </button>
        </div>
      </div>
    </div>
  );
};
