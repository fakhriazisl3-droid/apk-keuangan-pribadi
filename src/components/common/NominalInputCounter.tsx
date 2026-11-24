import React from 'react';
import { Plus, Minus, RotateCcw, AlertTriangle, Sparkles } from 'lucide-react';
import { formatCurrency, numberToTerbilang } from '../../utils/formatters';
import { playTactileClick } from '../../utils/sound';

interface NominalInputCounterProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  max?: number;
  min?: number;
  step?: number;
  presets?: number[];
  error?: string | null;
  allowNegative?: boolean;
}

export const NominalInputCounter: React.FC<NominalInputCounterProps> = ({
  value,
  onChange,
  label = 'Nominal (IDR)',
  max,
  min = 0,
  step = 10000,
  presets = [10000, 50000, 100000, 500000, 1000000],
  error,
  allowNegative = false,
}) => {
  const currentNum = parseInt(value, 10) || 0;

  const handleStep = (direction: 'up' | 'down') => {
    playTactileClick('tap');
    let next = direction === 'up' ? currentNum + step : currentNum - step;
    if (!allowNegative && next < min) next = min;
    if (max !== undefined && next > max) next = max;
    onChange(next.toString());
  };

  const handleAddPreset = (add: number) => {
    playTactileClick('pop');
    let next = currentNum + add;
    if (max !== undefined && next > max) next = max;
    onChange(next.toString());
  };

  const handleReset = () => {
    playTactileClick('tap');
    onChange('0');
  };

  const handleSetMax = () => {
    if (max !== undefined && max > 0) {
      playTactileClick('success');
      onChange(max.toString());
    }
  };

  const isOverMax = max !== undefined && currentNum > max;

  return (
    <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] flex flex-col gap-2.5">
      {/* Label & Max balance info */}
      <div className="flex items-center justify-between text-[11px] font-semibold">
        <span className="text-slate-400 uppercase tracking-wider">{label}</span>
        {max !== undefined && (
          <span className={`font-mono ${isOverMax ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-400'}`}>
            Maks: {formatCurrency(max)}
          </span>
        )}
      </div>

      {/* Main Counter Input with Stepper Buttons */}
      <div className="flex items-center justify-between gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800">
        {/* Decrement Stepper Button */}
        <button
          type="button"
          onClick={() => handleStep('down')}
          disabled={!allowNegative && currentNum <= min}
          className="w-11 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-90 border border-slate-700/80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-300 font-bold transition cursor-pointer shrink-0"
          title={`Kurangi Rp ${formatCurrency(step)}`}
        >
          <Minus className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Center: Currency & Number Input */}
        <div className="flex-1 flex items-center justify-center gap-1 min-w-0">
          <span className="text-slate-500 font-bold text-base select-none">Rp</span>
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const val = e.target.value.replace(/^0+(?=\d)/, ''); // Remove leading zeros
              onChange(val || '0');
            }}
            placeholder="0"
            className="w-full text-center font-black text-2xl text-white bg-transparent outline-none tracking-tight font-mono selection:bg-blue-600"
          />
        </div>

        {/* Increment Stepper Button */}
        <button
          type="button"
          onClick={() => handleStep('up')}
          disabled={max !== undefined && currentNum >= max}
          className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-90 border border-blue-400/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white font-bold transition cursor-pointer shrink-0 shadow-md shadow-blue-600/30"
          title={`Tambah Rp ${formatCurrency(step)}`}
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Live Terbilang Counter (Spelled-out words in Indonesian) */}
      <div className="px-2 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-1.5 min-w-0">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-[11px] text-amber-300/90 font-medium truncate block italic">
          {numberToTerbilang(currentNum)}
        </span>
      </div>

      {/* Error / Overmax Warning */}
      {(error || isOverMax) && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold px-1 animate-shake">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{error || `Nominal melebihi saldo dompet yang tersedia (${formatCurrency(max || 0)})`}</span>
        </div>
      )}

      {/* Quick Increment Preset Chips & Actions */}
      <div className="flex items-center justify-between gap-1.5 pt-1 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handleAddPreset(p)}
              className="key-timbul px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold text-slate-300 hover:text-white cursor-pointer active:scale-95 transition"
            >
              +{p >= 1000000 ? `${p / 1000000}Jt` : `${p / 1000}Rb`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {max !== undefined && max > 0 && (
            <button
              type="button"
              onClick={handleSetMax}
              className="key-timbul px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer active:scale-95 transition"
            >
              Maks
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="key-timbul p-1 rounded-lg text-slate-400 hover:text-rose-400 cursor-pointer active:scale-95 transition"
            title="Reset ke Rp 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
