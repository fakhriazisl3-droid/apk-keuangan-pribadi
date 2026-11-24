import React, { useState, useMemo } from 'react';
import { Transaction, Category, FinancialHealth } from '../../types/finance';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { IconResolver } from '../common/IconResolver';
import {
  BarChart3,
  PieChart,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';

interface ReportsViewProps {
  transactions: Transaction[];
  categories: Category[];
  health: FinancialHealth;
  hideBalance: boolean;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  categories,
  health,
  hideBalance,
}) => {
  const [period, setPeriod] = useState<'month' | 'week' | 'all'>('month');

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // Filter transactions based on period
  const filteredTxs = useMemo(() => {
    const now = new Date();
    if (period === 'month') {
      const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return transactions.filter((t) => t.date.startsWith(monthPrefix));
    }
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return transactions.filter((t) => new Date(t.date) >= weekAgo);
    }
    return transactions;
  }, [transactions, period]);

  const totalIncome = filteredTxs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Group expenses by category
  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    filteredTxs
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
      });

    const list = Array.from(map.entries())
      .map(([catId, amount]) => {
        const cat = catMap.get(catId);
        const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
        return {
          catId,
          name: cat?.name || 'Lain-lain',
          icon: cat?.icon || 'Tag',
          color: cat?.color || '#3b82f6',
          amount,
          percentage,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return list;
  }, [filteredTxs, totalExpense, catMap]);

  return (
    <div className="px-5 pb-8 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Laporan & Analitik</h1>
          <p className="text-xs text-slate-400">Analisis pengeluaran dan kesehatan finansial</p>
        </div>
      </div>

      {/* Period Switcher */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800 text-xs font-semibold">
        {[
          { id: 'month', label: 'Bulan Ini' },
          { id: 'week', label: '7 Hari Terakhir' },
          { id: 'all', label: 'Semua Waktu' },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id as any)}
            className={`py-2 rounded-xl transition cursor-pointer ${
              period === p.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Financial Health Scorecard */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl backdrop-blur-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>AI FINANCIAL HEALTH SCORE</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{health.score}</span>
              <span className="text-xs text-slate-400 font-medium">/ 100</span>
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full ml-1"
                style={{ backgroundColor: `${health.color}25`, color: health.color }}
              >
                {health.grade}
              </span>
            </div>
          </div>

          {/* Savings Rate Circle Badge */}
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
              Rasio Tabungan
            </span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              {health.savingsRate}%
            </span>
          </div>
        </div>

        {/* Advisor recommendations */}
        <div className="flex flex-col gap-2 pt-3 border-t border-slate-800/80">
          {health.recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Income vs Expense Comparison Bar */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-md">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Perbandingan Arus Kas
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 mb-1">
              <ArrowDownLeft className="w-3.5 h-3.5" /> Pemasukan
            </div>
            <div className="text-base font-black text-white">{formatCurrency(totalIncome, hideBalance)}</div>
          </div>

          <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/20">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-400 mb-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Pengeluaran
            </div>
            <div className="text-base font-black text-white">{formatCurrency(totalExpense, hideBalance)}</div>
          </div>
        </div>

        {/* Visual Ratio Bar */}
        {totalIncome + totalExpense > 0 && (
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(totalIncome / (totalIncome + totalExpense)) * 100}%` }}
            />
            <div
              className="h-full bg-rose-500 transition-all duration-500"
              style={{ width: `${(totalExpense / (totalIncome + totalExpense)) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Expense by Category Breakdown */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Distribusi Pengeluaran Kategori
          </h3>
          <span className="text-xs text-slate-400">{expenseByCategory.length} Kategori</span>
        </div>

        {expenseByCategory.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">Belum ada pengeluaran pada periode ini</p>
        ) : (
          <div className="flex flex-col gap-3">
            {expenseByCategory.map((item) => (
              <div key={item.catId} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${item.color}25`, color: item.color }}
                    >
                      <IconResolver name={item.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-white">{item.name}</span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-white font-mono">
                      {formatCurrency(item.amount, hideBalance)}
                    </span>
                    <span className="text-slate-400 text-[10px] ml-1.5">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {/* Individual category bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
