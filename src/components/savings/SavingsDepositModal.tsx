import React, { useState, useEffect } from 'react';
import { SavingsGoal, Wallet } from '../../types/finance';
import { Modal } from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';
import { ArrowDownLeft, ArrowUpRight, Check, Wallet as WalletIcon, AlertCircle } from 'lucide-react';
import { playTactileClick } from '../../utils/sound';
import { NominalInputCounter } from '../common/NominalInputCounter';

interface SavingsDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  wallets: Wallet[];
  onConfirm: (goalId: string, amount: number, walletId: string) => void;
}

export const SavingsDepositModal: React.FC<SavingsDepositModalProps> = ({
  isOpen,
  onClose,
  goal,
  wallets,
  onConfirm,
}) => {
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [amountStr, setAmountStr] = useState<string>('');
  const [walletId, setWalletId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && wallets.length > 0) {
      setWalletId(wallets[0].id);
      setAmountStr('');
      setError(null);
      setActionType('deposit');
    }
  }, [isOpen, wallets]);

  if (!goal) return null;

  const selectedWallet = wallets.find((w) => w.id === walletId) || wallets[0];
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  // Maximum allowed for deposit is wallet balance (and remaining target)
  // Maximum allowed for withdraw is goal's current collected amount
  const maxAvailable = actionType === 'deposit' ? selectedWallet?.balance || 0 : goal.currentAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amount = parseInt(amountStr, 10);

    if (!amount || amount <= 0) {
      setError('Masukkan nominal yang valid');
      return;
    }

    if (actionType === 'deposit') {
      if (!selectedWallet || selectedWallet.balance <= 0) {
        setError(`Saldo ${selectedWallet?.name || 'Dompet'} adalah Rp 0. Anda belum memiliki saldo untuk disetor ke tabungan.`);
        return;
      }
      if (amount > selectedWallet.balance) {
        setError(`Saldo ${selectedWallet.name} tidak mencukupi (${formatCurrency(selectedWallet.balance)}). Saldo dompet tidak boleh minus.`);
        return;
      }
    } else {
      // Withdraw validation
      if (amount > goal.currentAmount) {
        setError(`Dana tabungan yang terkumpul hanya ${formatCurrency(goal.currentAmount)}. Tidak bisa menarik lebih dari jumlah tersebut.`);
        return;
      }
    }

    playTactileClick('success');
    // Positive for deposit, negative for withdraw
    const finalAmount = actionType === 'deposit' ? amount : -amount;
    onConfirm(goal.id, finalAmount, walletId);
    onClose();
    setAmountStr('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={actionType === 'deposit' ? 'Setor Dana ke Target' : 'Tarik Dana dari Target'}
      subtitle={goal.title}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Type toggle */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              playTactileClick('pop');
              setActionType('deposit');
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              actionType === 'deposit'
                ? 'btn-timbul-emerald text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Setor Tabungan (+)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playTactileClick('pop');
              setActionType('withdraw');
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              actionType === 'withdraw'
                ? 'btn-timbul-rose text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            <span>Tarik Tabungan (-)</span>
          </button>
        </div>

        {/* Goal summary pill */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block">Terkumpul Saat Ini:</span>
            <span className="font-bold text-white text-sm">{formatCurrency(goal.currentAmount)}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block">Sisa Menuju Target:</span>
            <span className="font-bold text-emerald-400 text-sm">{formatCurrency(remaining)}</span>
          </div>
        </div>

        {/* Wallet Selector & Available balance note */}
        <div>
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1">
            <WalletIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>{actionType === 'deposit' ? 'Sumber Rekening / Dompet (Saldo Akan Dipotong)' : 'Tujuan Rekening Masuk'}</span>
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
                {w.name} — Saldo: {formatCurrency(w.balance)}
              </option>
            ))}
          </select>

          {/* Zero Balance Warning if user tries to deposit with 0 balance */}
          {actionType === 'deposit' && selectedWallet && selectedWallet.balance <= 0 && (
            <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Saldo <strong>{selectedWallet.name}</strong> kosong (Rp 0). Harap isi saldo dompet terlebih dahulu sebelum menabung.</span>
            </div>
          )}
        </div>

        {/* Tactile Nominal Input Counter with Stepper & Live Terbilang */}
        <NominalInputCounter
          value={amountStr}
          onChange={(val) => {
            setAmountStr(val);
            setError(null);
          }}
          label={actionType === 'deposit' ? 'Nominal Setoran (IDR)' : 'Nominal Penarikan (IDR)'}
          max={maxAvailable}
          step={50000}
          presets={[50000, 100000, 250000, 500000, 1000000]}
          error={error}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={actionType === 'deposit' && (!selectedWallet || selectedWallet.balance <= 0)}
          className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-sm cursor-pointer flex items-center justify-center gap-2 mt-1 disabled:opacity-40 disabled:cursor-not-allowed ${
            actionType === 'deposit'
              ? 'btn-timbul-emerald'
              : 'btn-timbul-rose'
          }`}
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span>{actionType === 'deposit' ? 'Konfirmasi Setor Dana' : 'Konfirmasi Tarik Dana'}</span>
        </button>
      </form>
    </Modal>
  );
};
