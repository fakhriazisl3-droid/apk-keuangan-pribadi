import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, BatteryCharging, Signal } from 'lucide-react';

interface MobileShellProps {
  children: React.ReactNode;
}

export const MobileShell: React.FC<MobileShellProps> = ({ children }) => {
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[100dvh] lg:min-h-screen bg-[#06080e] flex flex-col items-center justify-start text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* Top Bar Switcher (Only visible on wide screens) */}
      <div className="hidden lg:flex items-center justify-between w-full max-w-5xl px-6 py-2.5 bg-slate-900/40 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-40 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Aplikasi Mobile Keuangan Pribadi</span>
          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 font-mono text-[10px] border border-blue-500/30">
            PRO EDITION
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setIsMobileFrame(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              isMobileFrame
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Frame Smartphone</span>
          </button>
          <button
            onClick={() => setIsMobileFrame(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              !isMobileFrame
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Layar Penuh</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className={`w-full flex justify-center py-0 lg:py-6 ${isMobileFrame ? 'max-w-md' : 'max-w-xl'}`}>
        <div
          className={`w-full flex flex-col relative transition-all duration-300 ${
            isMobileFrame
              ? 'bg-[#0b0f19] lg:rounded-[48px] lg:border-[8px] lg:border-slate-800/90 lg:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.1)] min-h-[100dvh] lg:min-h-[860px] lg:max-h-[920px] overflow-hidden'
              : 'bg-[#0b0f19] min-h-[100dvh] lg:min-h-screen border-x border-slate-800/80 shadow-2xl'
          }`}
        >
          {/* Smartphone Status Bar (Top) - Only visible inside smartphone mock frame on laptop/desktop */}
          <div className="hidden lg:flex w-full pt-3 px-6 pb-2 items-center justify-between text-xs text-slate-300 bg-transparent select-none z-30 shrink-0">
            <span className="font-semibold text-xs tracking-tight">{currentTime}</span>

            {/* Dynamic Island / Notch */}
            <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center gap-2 border border-slate-800/60 shadow-inner">
              <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#051329] border border-blue-900/60" />
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* App Body Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col relative pb-20">
            {children}
          </div>

          {/* Smartphone Bottom Home Bar - Only visible inside smartphone mock frame on laptop/desktop */}
          <div className="hidden lg:flex w-full pb-2 pt-1 justify-center bg-[#0b0f19] z-30 shrink-0">
            <div className="w-32 h-1 bg-slate-700 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
