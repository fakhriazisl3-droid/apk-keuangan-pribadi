import React from 'react';
import { Transaction, Category, Wallet } from '../../types/finance';
import { Modal } from '../common/Modal';
import { IconResolver } from '../common/IconResolver';
import { formatCurrency, formatFullDate } from '../../utils/formatters';
import {
  Edit3,
  Trash2,
  Calendar,
  Clock,
  Wallet as WalletIcon,
  Tag,
  ArrowRightLeft,
  FileText,
} from 'lucide-react';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  categories: Category[];
  wallets: Wallet[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  transaction,
  categories,
  wallets,
  onEdit,
  onDelete,
}) => {
  if (!transaction) return null;

  const cat = categories.find((c) => c.id === transaction.categoryId);
  const wallet = wallets.find((w) => w.id === transaction.walletId);
  const targetWallet = wallets.find((w) => w.id === transaction.toWalletId);

  const isIncome = transaction.type === 'income';
  const isExpense = transaction.type === 'expense';
  const isTransfer = transaction.type === 'transfer';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Transaksi"
      subtitle={`ID: ${transaction.id}`}
    >
      <div className="flex flex-col gap-5">
        {/* Top Header Card */}
        <div className="text-center p-6 rounded-3xl bg-slate-900 border border-slate-800">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-md"
            style={{
              backgroundColor: cat ? `${cat.color}25` : '#334155',
              color: cat?.color || '#94a3b8',
            }}
          >
            {isTransfer ? (
              <ArrowRightLeft className="w-8 h-8 text-blue-400" />
            ) : (
              <IconResolver name={cat?.icon || 'CircleDollarSign'} className="w-8 h-8" />
            )}
          </div>

          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isIncome ? 'Pemasukan' : isExpense ? 'Pengeluaran' : 'Transfer Antar Dompet'}
          </span>

          <div
            className={`text-3xl font-black font-mono tracking-tight mt-1 ${
              isIncome ? 'text-emerald-400' : isExpense ? 'text-rose-400' : 'text-blue-400'
            }`}
          >
            {isIncome ? '+' : isExpense ? '-' : ''}
            {formatCurrency(transaction.amount)}
          </div>

          <p className="text-sm font-semibold text-white mt-1">
            {isTransfer ? 'Transfer Antar Dompet' : cat?.name || 'Kategori'}
          </p>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Tanggal</span>
            </div>
            <span className="font-semibold text-white">{formatFullDate(transaction.date)}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Waktu</span>
            </div>
            <span className="font-semibold text-white">{transaction.time} WIB</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-400">
              <WalletIcon className="w-4 h-4 text-slate-400" />
              <span>{isTransfer ? 'Dari Rekening' : 'Rekening / Dompet'}</span>
            </div>
            <span className="font-semibold text-white">{wallet?.name || 'Dompet'}</span>
          </div>

          {isTransfer && targetWallet && (
            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-400">
                <ArrowRightLeft className="w-4 h-4 text-blue-400" />
                <span>Tujuan Transfer</span>
              </div>
              <span className="font-semibold text-white">{targetWallet.name}</span>
            </div>
          )}

          {transaction.note && (
            <div className="flex items-start justify-between py-1 border-b border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-400 shrink-0">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Catatan</span>
              </div>
              <span className="font-medium text-slate-200 text-right pl-4">
                {transaction.note}
              </span>
            </div>
          )}

          {/* Attached Receipt Photo if available */}
          {transaction.receiptUrl && (
            <div className="py-2 flex flex-col gap-1.5">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <span>📸 Foto Bukti Struk / Screenshot</span>
              </span>
              <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-h-48">
                <img
                  src={transaction.receiptUrl}
                  alt="Bukti Struk"
                  className="w-full h-44 object-cover object-top"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              onEdit(transaction);
              onClose();
            }}
            className="btn-timbul-dark flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-slate-200 font-bold text-xs cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-blue-400" />
            <span>Edit Transaksi</span>
          </button>

          <button
            onClick={() => {
              onDelete(transaction.id);
              onClose();
            }}
            className="btn-timbul-rose flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-xs cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-white" />
            <span>Hapus Transaksi</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
