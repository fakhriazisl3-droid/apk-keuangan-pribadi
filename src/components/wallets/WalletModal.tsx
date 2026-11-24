import React, { useState, useEffect } from 'react';
import { Wallet, WalletType } from '../../types/finance';
import { Modal } from '../common/Modal';
import { Check, CreditCard, Landmark, Smartphone, Wallet as CashIcon } from 'lucide-react';
import { NominalInputCounter } from '../common/NominalInputCounter';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wallet: Wallet) => void;
  initialWallet?: Wallet | null;
}

const GRADIENT_PRESETS = [
  { name: 'Royal Blue', class: 'from-blue-600 via-blue-700 to-indigo-950' },
  { name: 'Emerald Teal', class: 'from-emerald-600 via-teal-700 to-slate-900' },
  { name: 'Sunset Amber', class: 'from-amber-600 via-orange-700 to-zinc-900' },
  { name: 'Deep Purple', class: 'from-purple-600 via-indigo-700 to-slate-900' },
  { name: 'Rose Dark', class: 'from-rose-600 via-pink-700 to-slate-950' },
  { name: 'Obsidian Black', class: 'from-slate-800 via-slate-900 to-black' },
];

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialWallet,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('bank');
  const [balanceStr, setBalanceStr] = useState('0');
  const [accountNumber, setAccountNumber] = useState('');
  const [colorGradient, setColorGradient] = useState(GRADIENT_PRESETS[0].class);

  useEffect(() => {
    if (initialWallet) {
      setName(initialWallet.name);
      setType(initialWallet.type);
      setBalanceStr(initialWallet.balance.toString());
      setAccountNumber(initialWallet.accountNumber || '');
      setColorGradient(initialWallet.colorGradient);
    } else {
      setName('');
      setType('bank');
      setBalanceStr('0');
      setAccountNumber('');
      setColorGradient(GRADIENT_PRESETS[0].class);
    }
  }, [initialWallet, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = Math.max(0, parseInt(balanceStr, 10) || 0);
    if (!name.trim()) return;

    const getIcon = () => {
      if (type === 'bank') return 'Landmark';
      if (type === 'ewallet') return 'Smartphone';
      if (type === 'cash') return 'Wallet';
      return 'CreditCard';
    };

    const wallet: Wallet = {
      id: initialWallet ? initialWallet.id : 'wallet-' + Date.now(),
      name: name.trim(),
      type,
      balance,
      accountNumber: accountNumber.trim() || undefined,
      colorGradient,
      icon: getIcon(),
    };

    onSave(wallet);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialWallet ? 'Atur Rekening / Dompet' : 'Tambah Rekening Baru'}
      subtitle="Atur saldo, akun bank, dompet tunai, atau e-wallet"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Nama Rekening / Dompet
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Bank BCA, GoPay, Dompet Tunai"
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500 placeholder:text-slate-600 font-medium"
            autoFocus
          />
        </div>

        {/* Type */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Jenis Akun
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'bank', label: 'Bank', icon: Landmark },
              { id: 'ewallet', label: 'E-Wallet', icon: Smartphone },
              { id: 'cash', label: 'Tunai', icon: CashIcon },
              { id: 'investment', label: 'Investasi', icon: CreditCard },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as any)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                    type === t.id
                      ? 'border-blue-500 bg-blue-500/15 text-white'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] font-semibold">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tactile Balance Counter with Stepper & Live Terbilang */}
        <NominalInputCounter
          value={balanceStr}
          onChange={(val) => setBalanceStr(val)}
          label="Saldo Saat Ini (IDR)"
          step={100000}
          presets={[50000, 100000, 500000, 1000000, 5000000]}
        />

        {/* Account Number */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Nomor Rekening / No HP (Opsional)
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Contoh: 8219 •••• 4128"
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500 placeholder:text-slate-600 font-medium"
          />
        </div>

        {/* Color Gradient Theme */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Warna Tema Kartu
          </label>
          <div className="grid grid-cols-3 gap-2">
            {GRADIENT_PRESETS.map((preset) => (
              <button
                key={preset.class}
                type="button"
                onClick={() => setColorGradient(preset.class)}
                className={`h-10 rounded-xl bg-gradient-to-r ${preset.class} border-2 flex items-center justify-center text-[10px] font-bold text-white transition cursor-pointer ${
                  colorGradient === preset.class ? 'border-white scale-105 shadow-md' : 'border-transparent opacity-80'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn-timbul-primary w-full py-4 px-6 rounded-2xl text-white font-bold text-sm shadow-xl active:scale-98 transition cursor-pointer flex items-center justify-center gap-2 mt-1"
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span>Simpan Rekening</span>
        </button>
      </form>
    </Modal>
  );
};
