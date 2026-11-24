import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { FinancialHealth } from '../../types/finance';

interface AiInsightBannerProps {
  health: FinancialHealth;
  onOpenAdvisorModal: () => void;
}

export const AiInsightBanner: React.FC<AiInsightBannerProps> = ({
  health,
  onOpenAdvisorModal,
}) => {
  return (
    <div className="px-5 mb-5">
      <div
        onClick={onOpenAdvisorModal}
        className="relative overflow-hidden p-4 rounded-3xl bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-purple-950/70 border border-blue-500/30 shadow-lg backdrop-blur-xl cursor-pointer hover:border-blue-500/50 active:scale-[0.99] transition group"
      >
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full pointer-events-none" />

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-md shadow-amber-500/20 shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                Smart Financial Advisor
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${health.color}20`, color: health.color }}
              >
                Skor: {health.score}/100 ({health.grade})
              </span>
            </div>

            <p className="text-xs text-slate-200 font-medium line-clamp-2 leading-relaxed">
              {health.summary}
            </p>

            <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-300 mt-2 group-hover:translate-x-1 transition-transform">
              <span>Buka Analisis & Rekomendasi Lengkap</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
