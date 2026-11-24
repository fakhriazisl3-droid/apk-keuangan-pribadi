import React, { useState, useEffect } from 'react';
import { Budget, Category } from '../../types/finance';
import { Modal } from '../common/Modal';
import { getCurrentMonthString } from '../../db/defaultData';
import { Check, ShieldAlert } from 'lucide-react';
import { IconResolver } from '../common/IconResolver';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  existingBudgets: Budget[];
  onSave: (budget: Budget) => void;
  selectedBudget?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  categories,
  existingBudgets,
  onSave,
  selectedBudget,
}) => {
  const currentMonth = getCurrentMonthString();
  const [categoryId, setCategoryId] = useState<string>('');
  const [limitStr, setLimitStr] = useState<string>('');

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  useEffect(() => {
    if (selectedBudget) {
      setCategoryId(selectedBudget.categoryId);
      setLimitStr(selectedBudget.limitAmount.toString());
    } else {
      // Find first category not yet budgeted
      const budgetedCatIds = new Set(existingBudgets.map((b) => b.categoryId));
      const availableCat = expenseCategories.find((c) => !budgetedCatIds.has(c.id)) || expenseCategories[0];
      setCategoryId(availableCat ? availableCat.id : '');
      setLimitStr('1000000');
    }
  }, [selectedBudget, isOpen, categories, existingBudgets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limitAmount = parseInt(limitStr, 10);
    if (!limitAmount || limitAmount <= 0) return;

    const budget: Budget = {
      id: selectedBudget ? selectedBudget.id : `budget-${categoryId}-${currentMonth}`,
      categoryId,
      month: currentMonth,
      limitAmount,
    };

    onSave(budget);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedBudget ? 'Edit Batas Anggaran' : 'Atur Anggaran Baru'}
      subtitle="Bulan Berjalan"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Category Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Pilih Kategori Pengeluaran
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar p-1">
            {expenseCategories.map((cat) => {
              const isSelected = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/15 text-white'
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

        {/* Limit Amount Input */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Batas Maksimal Anggaran / Bulan (IDR)
          </label>
          <div className="flex items-center justify-center gap-1 text-2xl font-black text-white">
            <span className="text-slate-400 text-lg">Rp</span>
            <input
              type="number"
              min="10000"
              step="50000"
              required
              value={limitStr}
              onChange={(e) => setLimitStr(e.target.value)}
              className="w-48 bg-transparent text-center font-black text-2xl text-white outline-none"
              autoFocus
            />
          </div>

          {/* Quick presets */}
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            {[500000, 1000000, 2000000, 3500000, 5000000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setLimitStr(val.toString())}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 active:scale-95 transition cursor-pointer"
              >
                Rp {val >= 1000000 ? `${val / 1000000}Jt` : `${val / 1000}Rb`}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-300">
          <ShieldAlert className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
          <span>
            Aplikasi akan otomatis memberikan peringatan visual ketika pengeluaran kategori ini mendekati 80% dan saat melebihi batas.
          </span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 active:scale-98 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>Simpan Anggaran</span>
        </button>
      </form>
    </Modal>
  );
};
