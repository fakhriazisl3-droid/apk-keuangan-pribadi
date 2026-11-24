import React from 'react';
import { Transaction, Category, Wallet } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, ChevronRight, Receipt } from 'lucide-react';
import { IconResolver } from '../common/IconResolver';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
  hideBalance: boolean;
  onSelectTransaction: (tx: Transaction) => void;
  onViewAll: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  categories,
  wallets,
  hideBalance,
  onSelectTransaction,
  onViewAll,
}) => {
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const walMap = new Map(wallets.map((w) => [w.id, w]));

  const recentList = transactions.slice(0, 5);

  return (
    <div className="px-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-white tracking-tight">Transaksi Terakhir</h2>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-0.5 active:scale-95 transition cursor-pointer"
        >
          <span>Lihat Semua</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recentList.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center">
          <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Belum ada transaksi</p>
          <p className="text-xs text-slate-500 mt-1">Tap tombol (+) di bawah untuk mulai mencatat</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {recentList.map((tx) => {
            const cat = catMap.get(tx.categoryId);
            const wallet = walMap.get(tx.walletId);
            const isIncome = tx.type === 'income';
            const isExpense = tx.type === 'expense';
            const isTransfer = tx.type === 'transfer';

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800/90 flex items-center justify-between gap-3 active:scale-[0.99] transition cursor-pointer"
              >
                {/* Left: Category Icon */}
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{
                    backgroundColor: cat ? `${cat.color}25` : '#334155',
                    color: cat?.color || '#94a3b8',
                  }}
                >
                  {isTransfer ? (
                    <ArrowRightLeft className="w-5 h-5 text-blue-400" />
                  ) : (
                    <IconResolver name={cat?.icon || 'CircleDollarSign'} className="w-5 h-5" />
                  )}
                </div>

                {/* Center: Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-white truncate">
                      {isTransfer ? 'Transfer Antar Dompet' : cat?.name || 'Transaksi'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{wallet?.name || 'Dompet'}</span>
                    <span>•</span>
                    <span>{formatDate(tx.date)}</span>
                    {tx.note && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[100px] text-slate-400 italic">
                          {tx.note}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Amount */}
                <div className="text-right shrink-0 max-w-[130px] min-w-0">
                  <div
                    className={`text-sm font-bold font-mono tracking-tight truncate ${
                      isIncome
                        ? 'text-emerald-400'
                        : isExpense
                        ? 'text-rose-400'
                        : 'text-blue-400'
                    }`}
                    title={formatCurrency(tx.amount)}
                  >
                    {isIncome ? '+' : isExpense ? '-' : ''}
                    {formatCurrency(tx.amount, hideBalance)}
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">{tx.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
