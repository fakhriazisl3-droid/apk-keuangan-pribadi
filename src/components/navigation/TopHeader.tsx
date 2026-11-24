import React from 'react';
import { Eye, EyeOff, Shield, Sparkles } from 'lucide-react';
import { UserSettings } from '../../types/finance';

interface TopHeaderProps {
  settings: UserSettings;
  onToggleHideBalance: () => void;
  onOpenSettings: () => void;
  onOpenAiInsights: () => void;
  onOpenNotifications?: () => void;
  healthScore?: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  settings,
  onToggleHideBalance,
  onOpenSettings,
  onOpenAiInsights,
  healthScore = 85,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <div
      className="relative px-5 pt-3 pb-3 flex items-center justify-between z-20 overflow-hidden border-b border-slate-800/60 transition-all duration-300"
      style={
        settings.coverBgUrl
          ? {
              backgroundImage: `linear-gradient(to bottom, rgba(3, 7, 18, 0.75), rgba(3, 7, 18, 0.95)), url("${settings.coverBgUrl}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {/* User profile & greeting */}
      <div className="flex items-center gap-3">
        <div
          onClick={onOpenSettings}
          className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/25 cursor-pointer active:scale-95 transition overflow-hidden relative group"
          title="Klik untuk ubah foto profil & pengaturan"
        >
          {settings.avatarUrl ? (
            <img
              src={settings.avatarUrl}
              alt={settings.userName}
              className="w-full h-full object-cover rounded-[14px]"
            />
          ) : (
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-sm text-blue-400">
              {settings.userName.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">{getGreeting()},</span>
          </div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            <span>{settings.userName}</span>
            <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-mono font-bold">
              PRO
            </span>
          </h2>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Financial health pill */}
        <button
          onClick={onOpenAiInsights}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 hover:border-slate-700 text-xs text-slate-300 active:scale-95 transition cursor-pointer shadow-sm"
          title="Skor Finansial & AI Advisor"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-semibold text-slate-200">{healthScore}</span>
        </button>

        {/* Hide Balance Toggle */}
        <button
          onClick={onToggleHideBalance}
          className="p-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-400 hover:text-white active:scale-95 transition cursor-pointer shadow-sm"
          title={settings.hideBalance ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}
        >
          {settings.hideBalance ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Security / Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-400 hover:text-white active:scale-95 transition cursor-pointer shadow-sm"
          title="Pengaturan & Profil"
        >
          <Shield className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
