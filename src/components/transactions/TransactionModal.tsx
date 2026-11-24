import React, { useState, useEffect } from 'react';
import { Transaction, Category, Wallet, TransactionType } from '../../types/finance';
import { Modal } from '../common/Modal';
import { IconResolver } from '../common/IconResolver';
import { formatCurrency } from '../../utils/formatters';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Calendar,
  Clock,
  FileText,
  Check,
  Camera,
  Sparkles,
} from 'lucide-react';
import { playTactileClick } from '../../utils/sound';
import { NominalInputCounter } from '../common/NominalInputCounter';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  wallets: Wallet[];
  onSave: (transaction: Transaction) => void;
  initialTransaction?: Transaction | null;
  defaultType?: TransactionType;
  onOpenScanner?: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  wallets,
  onSave,
  initialTransaction,
  defaultType = 'expense',
  onOpenScanner,
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amountStr, setAmountStr] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [walletId, setWalletId] = useState<string>('');
  const [toWalletId, setToWalletId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setAmountStr(initialTransaction.amount.toString());
      setCategoryId(initialTransaction.categoryId);
      setWalletId(initialTransaction.walletId);
      setToWalletId(initialTransaction.toWalletId || (wallets[1]?.id ?? wallets[0]?.id ?? ''));
      setDate(initialTransaction.date);
      setTime(initialTransaction.time || '12:00');
      setNote(initialTransaction.note || '');
      setError(null);
    } else {
      const activeType = defaultType || 'expense';
      setType(activeType);
      setAmountStr('');

      const firstCat = categories.find((c) => c.type === (activeType === 'income' ? 'income' : 'expense'));
      setCategoryId(firstCat ? firstCat.id : categories[0]?.id || '');
      setWalletId(wallets[0]?.id || '');
      setToWalletId(wallets.length > 1 ? wallets[1].id : wallets[0]?.id || '');

      const now = new Date();
      setDate(now.toISOString().split('T')[0]);
      setTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      );
      setNote('');
      setError(null);
    }
  }, [initialTransaction, defaultType, isOpen, wallets, categories]);

  const handleTypeChange = (newType: TransactionType) => {
    playTactileClick('pop');
    setType(newType);
    setError(null);
    if (newType !== 'transfer') {
      const matchCat = categories.find((c) => c.type === newType);
      if (matchCat) setCategoryId(matchCat.id);
    }
  };

  const selectedWallet = wallets.find((w) => w.id === walletId) || wallets[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amount = parseInt(amountStr, 10);
    if (!amount || amount <= 0) {
      setError('Masukkan nominal transaksi yang valid');
      return;
    }

    // Validate that expenses do not cause negative balance
    if (type === 'expense' && selectedWallet) {
      if (selectedWallet.balance <= 0) {
        setError(`Saldo ${selectedWallet.name} adalah Rp 0. Tidak bisa mencatat pengeluaran dari dompet kosong.`);
        return;
      }
      if (amount > selectedWallet.balance) {
        setError(`Saldo ${selectedWallet.name} tidak mencukupi (${formatCurrency(selectedWallet.balance)}). Saldo tidak boleh minus.`);
        return;
      }
    }

    if (type === 'transfer') {
      if (walletId === toWalletId) {
        setError('Dompet asal dan tujuan tidak boleh sama');
        return;
      }
      if (selectedWallet && selectedWallet.balance < amount) {
        setError(`Saldo ${selectedWallet.name} tidak mencukupi (${formatCurrency(selectedWallet.balance)})`);
        return;
      }
    }

    playTactileClick('success');

    const tx: Transaction = {
      id: initialTransaction ? initialTransaction.id : 'tx-' + Date.now(),
      type,
      amount,
      categoryId: type === 'transfer' ? 'cat-lain' : categoryId,
      walletId,
      toWalletId: type === 'transfer' ? toWalletId : undefined,
      date,
      time,
      note: note.trim() || undefined,
      createdAt: initialTransaction ? initialTransaction.createdAt : Date.now(),
    };

    onSave(tx);
    onClose();
  };

  const filteredCategories = categories.filter((c) => c.type === (type === 'income' ? 'income' : 'expense'));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTransaction ? 'Edit Transaksi' : 'Catat Transaksi Baru'}
      subtitle="Data tersimpan otomatis di database IndexedDB"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Quick AI Scanner Trigger */}
        {onOpenScanner && !initialTransaction && (
          <button
            type="button"
            onClick={() => {
              playTactileClick('pop');
              onClose();
              onOpenScanner();
            }}
            className="btn-timbul-primary p-3 rounded-2xl flex items-center justify-between text-xs text-white cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Camera className="w-4 h-4 text-cyan-200 stroke-[2.5]" />
              </div>
              <div className="text-left">
                <span className="font-bold block">Punya Foto Struk atau Screenshot?</span>
                <span className="text-[10px] text-blue-200">AI Otomatis deteksi nominal & jenis transaksi</span>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </button>
        )}

        {/* Type Switcher with 3D TIMBUL Buttons */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              type === 'expense'
                ? 'btn-timbul-rose text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            <span>Pengeluaran</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              type === 'income'
                ? 'btn-timbul-emerald text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Pemasukan</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('transfer')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              type === 'transfer'
                ? 'btn-timbul-primary text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Transfer</span>
          </button>
        </div>

        {/* Tactile Nominal Input Counter with Stepper & Live Terbilang */}
        <NominalInputCounter
          value={amountStr}
          onChange={(val) => {
            setAmountStr(val);
            setError(null);
          }}
          label={type === 'income' ? 'Nominal Pemasukan (IDR)' : type === 'expense' ? 'Nominal Pengeluaran (IDR)' : 'Nominal Transfer (IDR)'}
          max={type === 'expense' ? selectedWallet?.balance : undefined}
          step={20000}
          presets={[10000, 25000, 50000, 100000, 500000]}
          error={error}
        />

        {/* Category Selector */}
        {type !== 'transfer' && (
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Kategori
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto no-scrollbar p-1">
              {filteredCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      playTactileClick('tap');
                      setCategoryId(cat.id);
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/20 text-white shadow-[0_4px_0_0_#1d4ed8]'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                    >
                      <IconResolver name={cat.icon} className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Wallet Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {type === 'transfer' ? 'Dari Rekening / Dompet' : 'Dompet / Rekening'}
            </label>
            <select
              value={walletId}
              onChange={(e) => {
                setWalletId(e.target.value);
                setError(null);
              }}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500 font-medium"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({formatCurrency(w.balance)})
                </option>
              ))}
            </select>
          </div>

          {type === 'transfer' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Tujuan Transfer Ke
              </label>
              <select
                value={toWalletId}
                onChange={(e) => {
                  setToWalletId(e.target.value);
                  setError(null);
                }}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500 font-medium"
              >
                {wallets
                  .filter((w) => w.id !== walletId)
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatCurrency(w.balance)})
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Tanggal</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500 font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Waktu</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Catatan / Keterangan (Opsional)</span>
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: Makan siang bareng rekan kantor"
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500 placeholder:text-slate-600 font-medium"
          />
        </div>

        {/* Big 3D TIMBUL Submit Button */}
        <button
          type="submit"
          className="btn-timbul-primary w-full py-4 px-6 rounded-2xl text-white font-bold text-sm cursor-pointer mt-1 flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span>{initialTransaction ? 'Perbarui Transaksi' : 'Simpan Transaksi'}</span>
        </button>
      </form>
    </Modal>
  );
};
