import React from 'react';
import { SavingsGoal, Wallet } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { IconResolver } from '../common/IconResolver';
import {
  Plus,
  Target,
  Trophy,
  Calendar,
  ArrowDownLeft,
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { playTactileClick } from '../../utils/sound';

interface SavingsViewProps {
  goals: SavingsGoal[];
  wallets: Wallet[];
  hideBalance: boolean;
  onOpenAddGoal: () => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
  onOpenDeposit: (goal: SavingsGoal) => void;
}

export const SavingsView: React.FC<SavingsViewProps> = ({
  goals,
  wallets,
  hideBalance,
  onOpenAddGoal,
  onEditGoal,
  onDeleteGoal,
  onOpenDeposit,
}) => {
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCollected = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallPct = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;
  const completedCount = goals.filter((g) => g.isCompleted || g.currentAmount >= g.targetAmount).length;

  const calculateDaysLeft = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Melewati Target';
    if (diffDays === 0) return 'Hari Terakhir!';
    return `${diffDays} hari lagi`;
  };

  return (
    <div className="px-5 pb-8 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Target Tabungan</h1>
          <p className="text-xs text-slate-400">
            {completedCount} dari {goals.length} impian tercapai
          </p>
        </div>
        <button
          onClick={() => {
            playTactileClick('pop');
            onOpenAddGoal();
          }}
          className="btn-timbul-primary flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Buat Target</span>
        </button>
      </div>

      {/* Aggregate Overview Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/30 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs text-indigo-300 font-medium">Total Dana Terkumpul</span>
            <div className="text-2xl font-black text-white tracking-tight mt-0.5">
              {formatCurrency(totalCollected, hideBalance)}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${Math.min(100, overallPct)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>Target Total: {formatCurrency(totalTarget, hideBalance)}</span>
          <span className="font-bold text-emerald-400 font-mono">{overallPct}%</span>
        </div>
      </div>

      {/* Goals List */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-sm font-bold text-white tracking-tight">Daftar Target Impian</h2>
      </div>

      {goals.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center">
          <Target className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Belum ada target tabungan</p>
          <p className="text-xs text-slate-500 mt-1">Tap tombol "Buat Target" untuk memulai impian Anda</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            const isFinished = g.isCompleted || pct >= 100;
            const daysLeft = calculateDaysLeft(g.deadline);

            return (
              <div
                key={g.id}
                className={`p-4 rounded-3xl border transition-all ${
                  isFinished
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                    : 'bg-slate-900/80 border-slate-800/90 shadow-md'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        isFinished
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      <IconResolver name={g.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white tracking-tight">{g.title}</h4>
                        {isFinished && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Sparkles className="w-3 h-3" /> Tercapai
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(g.deadline)}</span>
                        <span>•</span>
                        <span className={daysLeft.includes('Melewati') ? 'text-rose-400' : 'text-slate-300'}>
                          {daysLeft}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditGoal(g)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                      title="Edit Target"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteGoal(g.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Hapus Target"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-2">
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFinished
                          ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">
                      {formatCurrency(g.currentAmount, hideBalance)}
                      <span className="text-slate-500 font-normal"> / {formatCurrency(g.targetAmount, hideBalance)}</span>
                    </span>
                    <span className={`font-bold font-mono ${isFinished ? 'text-emerald-400' : 'text-blue-400'}`}>
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Deposit / Withdraw Action Button */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {g.notes && (
                    <span className="text-[11px] text-slate-400 truncate max-w-[170px] italic">
                      "{g.notes}"
                    </span>
                  )}
                  <button
                    onClick={() => {
                      playTactileClick('pop');
                      onOpenDeposit(g);
                    }}
                    className="btn-timbul-emerald ml-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
                  >
                    <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                    <span>Setor / Tarik Tabungan</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
