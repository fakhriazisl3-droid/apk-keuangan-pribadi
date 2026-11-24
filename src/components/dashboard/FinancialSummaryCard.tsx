import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Wallet2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface FinancialSummaryCardProps {
  incomeThisMonth: number;
  expenseThisMonth: number;
  hideBalance: boolean;
}

export const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
  incomeThisMonth,
  expenseThisMonth,
  hideBalance,
}) => {
  const netSavings = incomeThisMonth - expenseThisMonth;
  const isSurplus = netSavings >= 0;

  return (
    <div className="px-5 mb-5">
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-lg backdrop-blur-xl">
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Income Box */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex flex-col justify-between overflow-hidden min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ArrowDownLeft className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider truncate">
                Pemasukan
              </span>
            </div>
            <div
              className="text-xs sm:text-sm md:text-base font-black text-emerald-300 tracking-tight truncate block max-w-full font-mono"
              title={formatCurrency(incomeThisMonth)}
            >
              {formatCurrency(incomeThisMonth, hideBalance)}
            </div>
          </div>

          {/* Expense Box */}
          <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/20 flex flex-col justify-between overflow-hidden min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider truncate">
                Pengeluaran
              </span>
            </div>
            <div
              className="text-xs sm:text-sm md:text-base font-black text-rose-300 tracking-tight truncate block max-w-full font-mono"
              title={formatCurrency(expenseThisMonth)}
            >
              {formatCurrency(expenseThisMonth, hideBalance)}
            </div>
          </div>
        </div>

        {/* Arus Kas Bersih (Net Cashflow) Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs gap-2 min-w-0">
          <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
            <Wallet2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="truncate">Arus Kas Bulan Ini:</span>
          </div>
          <span
            className={`font-bold font-mono truncate text-right ${
              isSurplus ? 'text-emerald-400' : 'text-rose-400'
            }`}
            title={formatCurrency(netSavings)}
          >
            {isSurplus ? '+' : ''}
            {formatCurrency(netSavings, hideBalance)}
          </span>
        </div>
      </div>
    </div>
  );
};
