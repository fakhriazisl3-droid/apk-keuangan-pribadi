import React, { useState, useEffect } from 'react';
import { Wallet } from '../../types/finance';
import { Modal } from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';
import { Check, AlertCircle } from 'lucide-react';
import { playTactileClick } from '../../utils/sound';
import { NominalInputCounter } from '../common/NominalInputCounter';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  onConfirm: (fromWalletId: string, toWalletId: string, amount: number, note?: string) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  wallets,
  onConfirm,
}) => {
  const [fromWalletId, setFromWalletId] = useState<string>('');
  const [toWalletId, setToWalletId] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Sync wallet IDs whenever modal opens or wallets load
  useEffect(() => {
    if (isOpen && wallets.length >= 2) {
      const initialFrom = wallets[0].id;
      const initialTo = wallets.find((w) => w.id !== initialFrom)?.id || wallets[1].id;
      setFromWalletId(initialFrom);
      setToWalletId(initialTo);
      setAmountStr('');
      setNote('');
      setError(null);
    }
  }, [isOpen, wallets]);

  const sourceWallet = wallets.find((w) => w.id === fromWalletId);
  const targetWallet = wallets.find((w) => w.id === toWalletId);

  const handleFromChange = (newFromId: string) => {
    playTactileClick('tap');
    setFromWalletId(newFromId);
    setError(null);
    if (toWalletId === newFromId) {
      const nextTarget = wallets.find((w) => w.id !== newFromId);
      if (nextTarget) setToWalletId(nextTarget.id);
    }
  };

  const handleToChange = (newToId: string) => {
    playTactileClick('tap');
    setToWalletId(newToId);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const effectiveFrom = fromWalletId || wallets[0]?.id;
    const effectiveTo = toWalletId || wallets.find((w) => w.id !== effectiveFrom)?.id;

    if (!effectiveFrom || !effectiveTo) {
      setError('Harap pilih rekening asal dan rekening tujuan');
      return;
    }

    if (effectiveFrom === effectiveTo) {
      setError('Rekening sumber dan tujuan tidak boleh sama');
      return;
    }

    const amount = parseInt(amountStr, 10);
    if (!amount || amount <= 0) {
      setError('Masukkan nominal transfer yang valid');
      return;
    }

    const currentSource = wallets.find((w) => w.id === effectiveFrom);
    if (!currentSource || currentSource.balance <= 0) {
      setError(`Saldo ${currentSource?.name || 'Dompet'} adalah Rp 0. Tidak bisa melakukan transfer.`);
      return;
    }

    if (currentSource.balance < amount) {
      setError(`Saldo ${currentSource.name} tidak mencukupi (${formatCurrency(currentSource.balance)}). Saldo tidak boleh minus.`);
      return;
    }

    playTactileClick('success');
    onConfirm(effectiveFrom, effectiveTo, amount, note.trim() || undefined);
    onClose();
    setAmountStr('');
    setNote('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Antar Rekening"
      subtitle="Pindahkan saldo antar dompet / rekening bank"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Source and Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Dari Rekening / Dompet (Sumber)
            </label>
            <select
              value={fromWalletId}
              onChange={(e) => handleFromChange(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500 font-medium"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({formatCurrency(w.balance)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Tujuan Transfer Ke
            </label>
            <select
              value={toWalletId}
              onChange={(e) => handleToChange(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500 font-medium"
            >
              {wallets
                .filter((w) => w.id !== fromWalletId)
                .map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatCurrency(w.balance)})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Source Balance Warning if 0 */}
        {sourceWallet && sourceWallet.balance <= 0 && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Saldo <strong>{sourceWallet.name}</strong> kosong (Rp 0). Anda tidak bisa mentransfer dari dompet ini.</span>
          </div>
        )}

        {/* Tactile Nominal Input Counter with Stepper & Live Terbilang */}
        <NominalInputCounter
          value={amountStr}
          onChange={(val) => {
            setAmountStr(val);
            setError(null);
          }}
          label="Nominal Transfer (IDR)"
          max={sourceWallet?.balance || 0}
          step={50000}
          presets={[20000, 50000, 100000, 250000, 500000, 1000000]}
          error={error}
        />

        {/* Note */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Catatan Transfer (Opsional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={`Contoh: Pindah dana dari ${sourceWallet?.name || 'GoPay'} ke ${targetWallet?.name || 'BCA'}`}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500 placeholder:text-slate-600 font-medium"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!sourceWallet || sourceWallet.balance <= 0}
          className="btn-timbul-primary w-full py-4 px-6 rounded-2xl text-white font-bold text-sm cursor-pointer flex items-center justify-center gap-2 mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span>Konfirmasi Transfer</span>
        </button>
      </form>
    </Modal>
  );
};
