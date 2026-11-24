import React, { useState } from 'react';
import { Wallet } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { CreditCard, Plus, ArrowRightLeft } from 'lucide-react';
import { IconResolver } from '../common/IconResolver';
import { playTactileClick } from '../../utils/sound';

interface WalletCardSliderProps {
  wallets: Wallet[];
  hideBalance: boolean;
  onOpenTransfer: () => void;
  onOpenAddWallet: () => void;
  onEditWallet?: (wallet: Wallet) => void;
}

export const WalletCardSlider: React.FC<WalletCardSliderProps> = ({
  wallets,
  hideBalance,
  onOpenTransfer,
  onOpenAddWallet,
  onEditWallet,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  const handleCardClick = (idx: number) => {
    playTactileClick('pop');
    setActiveIndex(idx);
  };

  return (
    <div className="w-full mb-5 overflow-hidden">
      {/* Total Net Balance Header */}
      <div className="px-5 mb-3 flex items-center justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <span className="text-xs text-slate-400 font-medium tracking-wide block">Total Kekayaan Bersih</span>
          <h1
            className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5 truncate block max-w-full font-mono"
            title={formatCurrency(totalBalance)}
          >
            {formatCurrency(totalBalance, hideBalance)}
          </h1>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => {
              playTactileClick('tap');
              onOpenTransfer();
            }}
            className="btn-timbul-dark flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>Transfer</span>
          </button>
          <button
            onClick={() => {
              playTactileClick('pop');
              onOpenAddWallet();
            }}
            className="btn-timbul-dark p-1.5 rounded-xl text-slate-200 cursor-pointer"
            title="Tambah Rekening / Dompet"
          >
            <Plus className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Cards Horizontal Carousel */}
      <div className="flex gap-3.5 overflow-x-auto no-scrollbar px-5 pb-3 pt-1 snap-x snap-mandatory">
        {wallets.map((wallet, idx) => (
          <div
            key={wallet.id}
            onClick={() => handleCardClick(idx)}
            className={`min-w-[260px] sm:min-w-[280px] h-40 rounded-3xl p-5 relative overflow-hidden bg-gradient-to-br ${
              wallet.colorGradient
            } shadow-xl border border-white/15 shrink-0 snap-center cursor-pointer transition-all duration-200 ${
              activeIndex === idx
                ? 'ring-2 ring-blue-400 shadow-[0_12px_24px_rgba(0,0,0,0.8)] -translate-y-1'
                : 'opacity-85 hover:opacity-100 hover:-translate-y-0.5'
            }`}
            style={{
              boxShadow: activeIndex === idx ? '0 8px 0 0 rgba(0,0,0,0.4), 0 16px 30px rgba(0,0,0,0.6)' : undefined,
            }}
          >
            {/* Background design accents */}
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute right-4 top-4 opacity-15 pointer-events-none">
              <CreditCard className="w-20 h-20" />
            </div>

            <div className="relative z-10 flex flex-col justify-between h-full">
              {/* Card Top: Type & Chip */}
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                    <IconResolver name={wallet.icon} className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white tracking-wide uppercase truncate">
                    {wallet.name}
                  </span>
                </div>
                {/* Simulated EMV Gold Chip */}
                <div className="w-7 h-5 rounded-md bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-200 border border-amber-600/30 flex items-center justify-center shadow-inner shrink-0">
                  <div className="w-4 h-3 border border-amber-800/40 rounded-xs" />
                </div>
              </div>

              {/* Card Middle: Account Number */}
              <div className="font-mono text-xs tracking-widest text-white/70 truncate">
                {wallet.accountNumber || '•••• •••• ••••'}
              </div>

              {/* Card Bottom: Balance & Quick Edit */}
              <div className="flex items-end justify-between gap-2 min-w-0">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold block truncate">
                    Saldo Tersedia
                  </span>
                  <span
                    className="text-base sm:text-lg font-black text-white tracking-tight truncate block max-w-full font-mono"
                    title={formatCurrency(wallet.balance)}
                  >
                    {formatCurrency(wallet.balance, hideBalance)}
                  </span>
                </div>
                {onEditWallet && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTactileClick('pop');
                      onEditWallet(wallet);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-[10px] font-bold text-white border border-white/20 active:scale-90 transition cursor-pointer shrink-0"
                  >
                    Atur Saldo
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
