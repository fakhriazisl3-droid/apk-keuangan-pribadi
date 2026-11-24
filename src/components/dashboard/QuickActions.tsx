import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Target,
  BarChart3,
  Camera,
  Sparkles,
} from 'lucide-react';
import { playTactileClick } from '../../utils/sound';

interface QuickActionsProps {
  onOpenAddIncome: () => void;
  onOpenAddExpense: () => void;
  onOpenTransfer: () => void;
  onOpenSavings: () => void;
  onOpenReports: () => void;
  onOpenScanner: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenAddIncome,
  onOpenAddExpense,
  onOpenTransfer,
  onOpenSavings,
  onOpenReports,
  onOpenScanner,
}) => {
  const actions = [
    {
      label: 'Scan Struk',
      icon: (
        <div className="relative">
          <Camera className="w-5 h-5 text-cyan-300 stroke-[2.5]" />
          <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute -top-1 -right-1" />
        </div>
      ),
      timbulClass: 'btn-timbul-primary text-cyan-300',
      onClick: () => {
        playTactileClick('pop');
        onOpenScanner();
      },
      isHighlight: true,
    },
    {
      label: 'Pengeluaran',
      icon: <ArrowUpRight className="w-5 h-5 text-rose-400 stroke-[2.5]" />,
      timbulClass: 'btn-timbul-rose text-white',
      onClick: () => {
        playTactileClick('pop');
        onOpenAddExpense();
      },
    },
    {
      label: 'Pemasukan',
      icon: <ArrowDownLeft className="w-5 h-5 text-emerald-400 stroke-[2.5]" />,
      timbulClass: 'btn-timbul-emerald text-white',
      onClick: () => {
        playTactileClick('pop');
        onOpenAddIncome();
      },
    },
    {
      label: 'Transfer',
      icon: <ArrowRightLeft className="w-5 h-5 text-blue-400 stroke-[2.5]" />,
      timbulClass: 'btn-timbul-dark text-blue-400',
      onClick: () => {
        playTactileClick('tap');
        onOpenTransfer();
      },
    },
    {
      label: 'Target',
      icon: <Target className="w-5 h-5 text-purple-400 stroke-[2.5]" />,
      timbulClass: 'btn-timbul-dark text-purple-400',
      onClick: () => {
        playTactileClick('tap');
        onOpenSavings();
      },
    },
    {
      label: 'Laporan',
      icon: <BarChart3 className="w-5 h-5 text-amber-400 stroke-[2.5]" />,
      timbulClass: 'btn-timbul-dark text-amber-400',
      onClick: () => {
        playTactileClick('tap');
        onOpenReports();
      },
    },
  ];

  return (
    <div className="px-5 mb-5">
      <div className="flex items-center justify-between gap-2.5 overflow-x-auto no-scrollbar py-2">
        {actions.map((act, index) => (
          <button
            key={index}
            onClick={act.onClick}
            className="flex-1 min-w-[62px] flex flex-col items-center gap-2 cursor-pointer group"
          >
            <div
              className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-all ${act.timbulClass}`}
            >
              {act.icon}
            </div>
            <span
              className={`text-[11px] font-bold transition ${
                act.isHighlight ? 'text-cyan-300' : 'text-slate-300 group-hover:text-white'
              }`}
            >
              {act.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
