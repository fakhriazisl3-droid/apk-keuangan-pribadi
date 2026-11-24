import React from 'react';
import { FinancialHealth } from '../../types/finance';
import { Modal } from '../common/Modal';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, TrendingUp, Lightbulb } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface AiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: FinancialHealth;
}

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({
  isOpen,
  onClose,
  health,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Smart AI Financial Health Advisor"
      subtitle="Analisis otomatis berbasis pola arus kas Anda"
    >
      <div className="flex flex-col gap-4">
        {/* Score Header */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-blue-500/30 text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-blue-500/20 text-blue-400 mb-3 border border-blue-500/30">
            <Sparkles className="w-8 h-8 text-amber-400" />
          </div>

          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-1">
            SKOR KESEHATAN KEUANGAN
          </span>
          <div className="text-4xl font-black text-white">{health.score} / 100</div>

          <div className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white">
            Status: <span style={{ color: health.color }}>{health.grade}</span>
          </div>

          <p className="text-xs text-slate-300 mt-3 leading-relaxed max-w-sm mx-auto">
            {health.summary}
          </p>
        </div>

        {/* 3 Core Metric Cards */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block mb-1">Rasio Tabungan</span>
            <div className="text-lg font-black text-emerald-400 font-mono">
              {health.savingsRate}%
            </div>
            <span className="text-[10px] text-slate-500">Target ideal minimal 20%</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block mb-1">Rata-rata Belanja/Hari</span>
            <div className="text-lg font-black text-rose-400 font-mono">
              {formatCurrency(health.burnRatePerDay)}
            </div>
            <span className="text-[10px] text-slate-500">Sisa {health.forecastRemainingDays} hari bulan ini</span>
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Rekomendasi Cerdas untuk Anda</span>
          </h4>
          <div className="flex flex-col gap-2">
            {health.recommendations.map((rec, index) => (
              <div
                key={index}
                className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200"
              >
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                  {index + 1}
                </div>
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 active:scale-95 transition cursor-pointer mt-2"
        >
          Tutup Analisis
        </button>
      </div>
    </Modal>
  );
};
