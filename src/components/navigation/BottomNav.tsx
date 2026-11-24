import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  Plus,
} from 'lucide-react';
import { playTactileClick } from '../../utils/sound';

export type ActiveTab = 'dashboard' | 'transactions' | 'budgets' | 'savings' | 'reports';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenAddModal,
}) => {
  const handleTabClick = (tab: ActiveTab) => {
    playTactileClick('tap');
    onChangeTab(tab);
  };

  const handleFabClick = () => {
    playTactileClick('pop');
    onOpenAddModal();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 px-4 pb-4 pt-1 pointer-events-none">
      <div className="pointer-events-auto relative bg-slate-900/90 backdrop-blur-2xl border border-slate-750 rounded-3xl shadow-[0_12px_36px_-4px_rgba(0,0,0,0.9)] px-3 py-2 flex items-center justify-between">
        {/* Beranda */}
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 cursor-pointer ${
            activeTab === 'dashboard' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5" />
            {activeTab === 'dashboard' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-md shadow-blue-500" />
            )}
          </div>
          <span className="text-[10px] mt-1.5">Beranda</span>
        </button>

        {/* Transaksi */}
        <button
          onClick={() => handleTabClick('transactions')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 cursor-pointer ${
            activeTab === 'transactions' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ArrowLeftRight className="w-5 h-5" />
            {activeTab === 'transactions' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-md shadow-blue-500" />
            )}
          </div>
          <span className="text-[10px] mt-1.5">Transaksi</span>
        </button>

        {/* CENTER FLOATING ACTION BUTTON (Add Transaction with 3D TIMBUL effect) */}
        <div className="flex-1 flex justify-center -mt-7">
          <button
            onClick={handleFabClick}
            className="w-14 h-14 rounded-2xl fab-timbul flex items-center justify-center text-white cursor-pointer group"
            title="Tambah Transaksi Baru"
          >
            <Plus className="w-8 h-8 stroke-[2.8]" />
          </button>
        </div>

        {/* Anggaran */}
        <button
          onClick={() => handleTabClick('budgets')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 cursor-pointer ${
            activeTab === 'budgets' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <PieChart className="w-5 h-5" />
            {activeTab === 'budgets' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-md shadow-blue-500" />
            )}
          </div>
          <span className="text-[10px] mt-1.5">Anggaran</span>
        </button>

        {/* Tabungan / Target */}
        <button
          onClick={() => handleTabClick('savings')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 cursor-pointer ${
            activeTab === 'savings' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Target className="w-5 h-5" />
            {activeTab === 'savings' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-md shadow-blue-500" />
            )}
          </div>
          <span className="text-[10px] mt-1.5">Tabungan</span>
        </button>
      </div>
    </div>
  );
};
