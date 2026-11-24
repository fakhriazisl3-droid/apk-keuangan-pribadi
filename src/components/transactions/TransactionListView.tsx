import React, { useState, useMemo } from 'react';
import { Transaction, Category, Wallet } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { IconResolver } from '../common/IconResolver';
import {
  Search,
  Filter,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Calendar,
  X,
} from 'lucide-react';

interface TransactionListViewProps {
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
  hideBalance: boolean;
  onSelectTransaction: (tx: Transaction) => void;
  onExportCSV: () => void;
}

export const TransactionListView: React.FC<TransactionListViewProps> = ({
  transactions,
  categories,
  wallets,
  hideBalance,
  onSelectTransaction,
  onExportCSV,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedWallet, setSelectedWallet] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const walMap = useMemo(() => new Map(wallets.map((w) => [w.id, w])), [wallets]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      // Type filter
      if (selectedType !== 'all' && t.type !== selectedType) return false;
      // Wallet filter
      if (selectedWallet !== 'all' && t.walletId !== selectedWallet && t.toWalletId !== selectedWallet) return false;
      // Category filter
      if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) return false;
      // Search query (note, category name, wallet name, amount)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const catName = catMap.get(t.categoryId)?.name?.toLowerCase() || '';
        const walName = walMap.get(t.walletId)?.name?.toLowerCase() || '';
        const note = (t.note || '').toLowerCase();
        const amount = t.amount.toString();
        if (!catName.includes(q) && !walName.includes(q) && !note.includes(q) && !amount.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, selectedType, selectedWallet, selectedCategory, searchQuery, catMap, walMap]);

  // Aggregate stats
  const totalFilteredIncome = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalFilteredExpense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Group by Date
  const groupedTransactions = useMemo(() => {
    const groups = new Map<string, Transaction[]>();
    filtered.forEach((t) => {
      const list = groups.get(t.date) || [];
      list.push(t);
      groups.set(t.date, list);
    });
    return Array.from(groups.entries());
  }, [filtered]);

  return (
    <div className="px-5 pb-8 flex flex-col gap-4">
      {/* Top Title & Export */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Riwayat Transaksi</h1>
          <p className="text-xs text-slate-400">Total {filtered.length} transaksi tercatat</p>
        </div>
        <button
          onClick={onExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 active:scale-95 transition cursor-pointer"
          title="Ekspor ke Excel / CSV"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" />
          <span>Ekspor CSV</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari transaksi, catatan, nominal..."
          className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Tabs by Type */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs font-semibold">
        {[
          { id: 'all', label: 'Semua' },
          { id: 'expense', label: 'Keluar' },
          { id: 'income', label: 'Masuk' },
          { id: 'transfer', label: 'Transfer' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedType(tab.id)}
            className={`py-2 rounded-xl transition cursor-pointer ${
              selectedType === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Secondary Filters (Wallet & Category) */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <select
          value={selectedWallet}
          onChange={(e) => setSelectedWallet(e.target.value)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 outline-none focus:border-blue-500"
        >
          <option value="all">Semua Dompet / Bank</option>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 outline-none focus:border-blue-500"
        >
          <option value="all">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Filter Summary Banner */}
      <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <ArrowDownLeft className="w-3.5 h-3.5" />
          <span>+ {formatCurrency(totalFilteredIncome, hideBalance)}</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-rose-400">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>- {formatCurrency(totalFilteredExpense, hideBalance)}</span>
        </div>
      </div>

      {/* Grouped Transaction List */}
      {groupedTransactions.length === 0 ? (
        <div className="p-10 rounded-3xl bg-slate-900/40 border border-slate-800 text-center">
          <p className="text-sm text-slate-400">Tidak ada transaksi yang sesuai filter</p>
          <p className="text-xs text-slate-500 mt-1">Coba ubah kata kunci atau filter di atas</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groupedTransactions.map(([date, txs]) => (
            <div key={date} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 px-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>{formatDate(date)}</span>
                <span className="text-slate-600">({txs.length})</span>
              </div>

              <div className="flex flex-col gap-2">
                {txs.map((tx) => {
                  const cat = catMap.get(tx.categoryId);
                  const wallet = walMap.get(tx.walletId);
                  const isIncome = tx.type === 'income';
                  const isExpense = tx.type === 'expense';
                  const isTransfer = tx.type === 'transfer';

                  return (
                    <div
                      key={tx.id}
                      onClick={() => onSelectTransaction(tx)}
                      className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between gap-3 active:scale-[0.99] transition cursor-pointer"
                    >
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                        style={{
                          backgroundColor: cat ? `${cat.color}25` : '#334155',
                          color: cat?.color || '#94a3b8',
                        }}
                      >
                        {isTransfer ? (
                          <ArrowRightLeft className="w-5 h-5 text-blue-400" />
                        ) : (
                          <IconResolver name={cat?.icon || 'CircleDollarSign'} className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm text-white truncate">
                            {isTransfer ? 'Transfer Antar Dompet' : cat?.name || 'Transaksi'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>{wallet?.name || 'Dompet'}</span>
                          {tx.note && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[120px] text-slate-300 italic">
                                {tx.note}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div
                          className={`text-sm font-bold font-mono tracking-tight ${
                            isIncome
                              ? 'text-emerald-400'
                              : isExpense
                              ? 'text-rose-400'
                              : 'text-blue-400'
                          }`}
                        >
                          {isIncome ? '+' : isExpense ? '-' : ''}
                          {formatCurrency(tx.amount, hideBalance)}
                        </div>
                        <span className="text-[10px] text-slate-500">{tx.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
