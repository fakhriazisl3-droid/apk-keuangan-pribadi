import React, { useMemo } from 'react';
import { Budget, Category, Transaction } from '../../types/finance';
import { formatCurrency, formatMonthName } from '../../utils/formatters';
import { getCurrentMonthString } from '../../db/defaultData';
import { IconResolver } from '../common/IconResolver';
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { playTactileClick } from '../../utils/sound';

interface BudgetViewProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  hideBalance: boolean;
  onOpenAddBudget: () => void;
  onEditBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budgets,
  categories,
  transactions,
  hideBalance,
  onOpenAddBudget,
  onEditBudget,
  onDeleteBudget,
}) => {
  const currentMonth = getCurrentMonthString();
  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // Expenses for current month by category
  const expensesByCat = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
      .forEach((t) => {
        map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
      });
    return map;
  }, [transactions, currentMonth]);

  // Total budget aggregates
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limitAmount, 0);
  const totalBudgetSpent = budgets.reduce(
    (sum, b) => sum + (expensesByCat.get(b.categoryId) || 0),
    0
  );
  const totalRemaining = Math.max(0, totalBudgetLimit - totalBudgetSpent);
  const overallPercentage =
    totalBudgetLimit > 0 ? Math.round((totalBudgetSpent / totalBudgetLimit) * 100) : 0;

  return (
    <div className="px-5 pb-8 flex flex-col gap-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Anggaran Bulanan</h1>
          <p className="text-xs text-slate-400">{formatMonthName(currentMonth)}</p>
        </div>
        <button
          onClick={() => {
            playTactileClick('pop');
            onOpenAddBudget();
          }}
          className="btn-timbul-primary flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Atur Anggaran</span>
        </button>
      </div>

      {/* Overview Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs text-slate-400 font-medium">Sisa Total Anggaran</span>
            <div className="text-2xl font-black text-white tracking-tight mt-0.5">
              {formatCurrency(totalRemaining, hideBalance)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-medium">Batas Maksimal</span>
            <div className="text-sm font-bold text-slate-300 font-mono mt-0.5">
              {formatCurrency(totalBudgetLimit, hideBalance)}
            </div>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallPercentage > 100
                ? 'bg-rose-500'
                : overallPercentage > 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, overallPercentage)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Terpakai: {formatCurrency(totalBudgetSpent, hideBalance)}</span>
          <span
            className={`font-bold font-mono ${
              overallPercentage > 100
                ? 'text-rose-400'
                : overallPercentage > 80
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {overallPercentage}%
          </span>
        </div>
      </div>

      {/* Category Budgets List */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-sm font-bold text-white tracking-tight">Pos Anggaran Kategori</h2>
        <span className="text-xs text-slate-400">{budgets.length} Kategori</span>
      </div>

      {budgets.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center">
          <PieChart className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Belum ada anggaran yang diatur</p>
          <p className="text-xs text-slate-500 mt-1">Tap tombol "Atur Anggaran" di atas</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {budgets.map((b) => {
            const cat = catMap.get(b.categoryId);
            const spent = expensesByCat.get(b.categoryId) || 0;
            const remaining = b.limitAmount - spent;
            const pct = Math.round((spent / b.limitAmount) * 100);
            const isOver = spent > b.limitAmount;
            const isWarning = pct >= 80 && !isOver;

            return (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-sm flex flex-col gap-3"
              >
                {/* Header: Cat Info & Edit/Delete */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: cat ? `${cat.color}25` : '#334155',
                        color: cat?.color || '#94a3b8',
                      }}
                    >
                      <IconResolver name={cat?.icon || 'CircleDollarSign'} className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{cat?.name || 'Kategori'}</h4>
                      <span className="text-[11px] text-slate-400">
                        Batas: {formatCurrency(b.limitAmount, hideBalance)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditBudget(b)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                      title="Edit Anggaran"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteBudget(b.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Hapus Anggaran"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  {/* Status & figures */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Terpakai: <span className="text-slate-200 font-medium">{formatCurrency(spent, hideBalance)}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isOver ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400">
                          <AlertTriangle className="w-3 h-3" />
                          Melebihi {formatCurrency(Math.abs(remaining))}!
                        </span>
                      ) : isWarning ? (
                        <span className="text-[11px] font-semibold text-amber-400">
                          Sisa {formatCurrency(remaining)} (Waspada!)
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-400">
                          Sisa {formatCurrency(remaining)}
                        </span>
                      )}
                      <span className="font-mono text-slate-400 text-[10px]">({pct}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
