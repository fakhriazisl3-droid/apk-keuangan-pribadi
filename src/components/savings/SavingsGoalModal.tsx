import React, { useState, useEffect } from 'react';
import { SavingsGoal } from '../../types/finance';
import { Modal } from '../common/Modal';
import { Check, Target, Calendar, FileText } from 'lucide-react';
import { IconResolver } from '../common/IconResolver';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: SavingsGoal) => void;
  initialGoal?: SavingsGoal | null;
}

const AVAILABLE_ICONS = [
  'Laptop', 'Plane', 'ShieldCheck', 'Car', 'Home', 'Smartphone', 'GraduationCap', 'Gift', 'Tv', 'Heart'
];

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialGoal,
}) => {
  const [title, setTitle] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [currentAmountStr, setCurrentAmountStr] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('Laptop');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title);
      setTargetAmountStr(initialGoal.targetAmount.toString());
      setCurrentAmountStr(initialGoal.currentAmount.toString());
      setDeadline(initialGoal.deadline);
      setIcon(initialGoal.icon);
      setNotes(initialGoal.notes || '');
    } else {
      setTitle('');
      setTargetAmountStr('');
      setCurrentAmountStr('0');
      // Default deadline: 3 months from now
      const d = new Date();
      d.setMonth(d.getMonth() + 3);
      setDeadline(d.toISOString().split('T')[0]);
      setIcon('Laptop');
      setNotes('');
    }
  }, [initialGoal, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmount = parseInt(targetAmountStr, 10);
    const currentAmount = parseInt(currentAmountStr, 10) || 0;
    if (!title.trim() || !targetAmount || targetAmount <= 0) return;

    const goal: SavingsGoal = {
      id: initialGoal ? initialGoal.id : 'goal-' + Date.now(),
      title: title.trim(),
      targetAmount,
      currentAmount,
      deadline,
      icon,
      color: '#3b82f6',
      notes: notes.trim() || undefined,
      isCompleted: currentAmount >= targetAmount,
      completedAt: currentAmount >= targetAmount ? (initialGoal?.completedAt || new Date().toISOString().split('T')[0]) : undefined,
    };

    onSave(goal);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialGoal ? 'Edit Target Tabungan' : 'Buat Target Tabungan Baru'}
      subtitle="Tetapkan impian dan pantau kedisiplinan Anda"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Title */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Nama Target / Impian
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Beli Laptop Baru, Liburan ke Bali"
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500 placeholder:text-slate-600"
            autoFocus
          />
        </div>

        {/* Icon picker */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Pilih Ikon Target
          </label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {AVAILABLE_ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition cursor-pointer ${
                  icon === ic
                    ? 'border-blue-500 bg-blue-600/20 text-blue-400'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <IconResolver name={ic} className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>

        {/* Target Amount */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Target Nominal Dana (IDR)
          </label>
          <div className="flex items-center justify-center gap-1 text-2xl font-black text-white">
            <span className="text-slate-400 text-lg">Rp</span>
            <input
              type="number"
              min="100000"
              required
              value={targetAmountStr}
              onChange={(e) => setTargetAmountStr(e.target.value)}
              placeholder="0"
              className="w-48 bg-transparent text-center font-black text-2xl text-white outline-none"
            />
          </div>
        </div>

        {/* Current collected if editing */}
        {initialGoal && (
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Saldo Saat Ini yang Terkumpul (IDR)
            </label>
            <input
              type="number"
              min="0"
              value={currentAmountStr}
              onChange={(e) => setCurrentAmountStr(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Deadline */}
        <div>
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Target Waktu Selesai (Deadline)</span>
          </label>
          <input
            type="date"
            required
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Keterangan Tambahan (Opsional)</span>
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Tabung Rp 1.5jt per bulan"
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500 placeholder:text-slate-600"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 active:scale-98 transition cursor-pointer flex items-center justify-center gap-2 mt-2"
        >
          <Check className="w-4 h-4" />
          <span>{initialGoal ? 'Perbarui Target' : 'Buat Target Sekarang'}</span>
        </button>
      </form>
    </Modal>
  );
};
