import React, { useState, useRef, useEffect } from 'react';
import { UserSettings, Wallet, Category } from '../../types/finance';
import {
  Shield,
  Download,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  Database,
  Trash2,
  Check,
  ChevronRight,
  Plus,
  CreditCard,
  User,
  Camera,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { compressImage, PRESET_COVER_WALLPAPERS } from '../../utils/imageCompressor';
import { playTactileClick } from '../../utils/sound';

interface SettingsViewProps {
  settings: UserSettings;
  wallets: Wallet[];
  categories: Category[];
  onUpdateSettings: (newSettings: UserSettings) => void;
  onOpenAddWallet: () => void;
  onEditWallet: (wallet: Wallet) => void;
  onDeleteWallet: (id: string) => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onExportCSV: () => void;
  onResetData: () => void;
  onClearAllData?: () => void;
  onLockNow?: () => void;
  onClose: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  wallets,
  categories,
  onUpdateSettings,
  onOpenAddWallet,
  onEditWallet,
  onDeleteWallet,
  onExportJSON,
  onImportJSON,
  onExportCSV,
  onResetData,
  onClearAllData,
  onLockNow,
  onClose,
}) => {
  const [userName, setUserName] = useState(settings.userName);
  const [avatarUrl, setAvatarUrl] = useState(settings.avatarUrl || '');
  const [coverBgUrl, setCoverBgUrl] = useState(settings.coverBgUrl || PRESET_COVER_WALLPAPERS[0].url);
  const [pinCode, setPinCode] = useState(settings.pinCode || '123456');
  const [isEditingPin, setIsEditingPin] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUserName(settings.userName);
    setAvatarUrl(settings.avatarUrl || '');
    setCoverBgUrl(settings.coverBgUrl || PRESET_COVER_WALLPAPERS[0].url);
    setPinCode(settings.pinCode || '123456');
  }, [settings.userName, settings.avatarUrl, settings.coverBgUrl, settings.pinCode]);

  const handleSaveProfile = () => {
    playTactileClick('success');
    onUpdateSettings({
      ...settings,
      userName: userName.trim() || 'Pengguna',
      avatarUrl,
      coverBgUrl,
      pinCode,
    });
    setIsEditingPin(false);
  };

  const handleTogglePin = () => {
    playTactileClick('pop');
    onUpdateSettings({
      ...settings,
      pinEnabled: !settings.pinEnabled,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
    }
  };

  // Upload Custom Avatar from HP Camera / Gallery
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      playTactileClick('pop');
      const compressed = await compressImage(file, 350, 350, 0.88);
      setAvatarUrl(compressed);
      onUpdateSettings({
        ...settings,
        avatarUrl: compressed,
      });
    } catch (err) {
      console.error('Failed to compress avatar', err);
    }
  };

  // Upload Custom Cover Background from HP Gallery
  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      playTactileClick('pop');
      const compressed = await compressImage(file, 1200, 500, 0.85);
      setCoverBgUrl(compressed);
      onUpdateSettings({
        ...settings,
        coverBgUrl: compressed,
      });
    } catch (err) {
      console.error('Failed to compress cover', err);
    }
  };

  // Select Preset Cover Wallpaper
  const handleSelectPresetCover = (url: string) => {
    playTactileClick('pop');
    setCoverBgUrl(url);
    onUpdateSettings({
      ...settings,
      coverBgUrl: url,
    });
  };

  // Remove Avatar Photo
  const handleRemoveAvatar = () => {
    playTactileClick('tap');
    setAvatarUrl('');
    onUpdateSettings({
      ...settings,
      avatarUrl: '',
    });
  };

  return (
    <div className="px-5 pb-16 flex flex-col gap-5">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Pengaturan & Profil</h1>
          <p className="text-xs text-slate-400">Kustomisasi foto, tampilan, keamanan, dan akun</p>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-semibold text-blue-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer"
        >
          Kembali
        </button>
      </div>

      {/* Profile & Custom Photos Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        {/* Cover Photo Banner */}
        <div
          className="relative h-32 w-full bg-slate-950 transition-all duration-300"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(3, 7, 18, 0.2), rgba(3, 7, 18, 0.85)), url("${coverBgUrl}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Button to Upload Custom Cover Photo */}
          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverFile}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold cursor-pointer active:scale-95 transition"
            title="Ganti latar belakang foto"
          >
            <Camera className="w-3.5 h-3.5 text-blue-400" />
            <span>Ganti Latar Foto</span>
          </button>
        </div>

        {/* Avatar & Profile Details Container */}
        <div className="px-4 pb-4 pt-0 relative flex flex-col">
          {/* Floating Avatar */}
          <div className="flex items-end justify-between -mt-10 mb-3">
            <div className="relative group">
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarFile}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="w-20 h-20 rounded-3xl p-1 bg-slate-900 border-2 border-blue-500 shadow-xl overflow-hidden cursor-pointer active:scale-95 transition relative"
                title="Klik untuk ganti foto profil"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userName}
                    className="w-full h-full object-cover rounded-[20px]"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-[20px] flex items-center justify-center font-black text-2xl text-white">
                    {userName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {/* Camera Overlay Icon */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition rounded-[20px]">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Floating Camera Badge */}
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-blue-600 text-white shadow-lg border border-slate-900 cursor-pointer active:scale-90"
                title="Upload foto profil"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {avatarUrl && (
              <button
                onClick={handleRemoveAvatar}
                className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 cursor-pointer"
              >
                Hapus Foto
              </button>
            )}
          </div>

          {/* Preset Wallpaper Selector */}
          <div className="mb-4 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Pilihan Latar Belakang Estetik (Tap untuk Ganti):</span>
            </span>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COVER_WALLPAPERS.map((wp) => (
                <button
                  key={wp.id}
                  onClick={() => handleSelectPresetCover(wp.url)}
                  className={`h-11 rounded-xl overflow-hidden relative border transition cursor-pointer ${
                    coverBgUrl === wp.url
                      ? 'border-blue-400 ring-2 ring-blue-500/50 scale-105'
                      : 'border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundImage: `url("${wp.url}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  title={wp.name}
                >
                  {coverBgUrl === wp.url && (
                    <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-semibold">Nama Pemilik Akun</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Masukkan nama Anda"
                className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500 font-semibold"
              />
              <button
                onClick={handleSaveProfile}
                className="btn-timbul-primary px-4 py-2 rounded-xl text-white font-bold text-xs cursor-pointer"
              >
                Simpan Profil
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security & PIN Lock */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-blue-400" />
          <span>Keamanan Aplikasi</span>
        </h3>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-white block">Kunci Layar dengan PIN 6-Digit</span>
              <span className="text-xs text-slate-400">
                Minta PIN hanya saat pertama kali membuka aplikasi
              </span>
            </div>

            <button
              onClick={handleTogglePin}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                settings.pinEnabled ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.pinEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {settings.pinEnabled && (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-300">
                PIN 6-Digit: <span className="font-mono font-bold text-white tracking-widest">{settings.pinCode || '123456'}</span>
              </div>
              <div className="flex items-center gap-2">
                {onLockNow && (
                  <button
                    onClick={onLockNow}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    Kunci Sekarang
                  </button>
                )}
                <button
                  onClick={() => setIsEditingPin(!isEditingPin)}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  {isEditingPin ? 'Batal' : 'Ganti PIN'}
                </button>
              </div>
            </div>
          )}

          {isEditingPin && (
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2">
              <input
                type="password"
                maxLength={6}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                placeholder="6 Digit PIN Baru"
                className="flex-1 p-2 bg-transparent text-center font-mono tracking-widest text-white text-base outline-none"
              />
              <button
                onClick={handleSaveProfile}
                disabled={pinCode.length !== 6}
                className="btn-timbul-primary px-3 py-2 rounded-xl disabled:opacity-50 text-white font-semibold text-xs cursor-pointer"
              >
                Simpan PIN
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Wallets & Accounts Management */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-purple-400" />
            <span>Rekening & Dompet ({wallets.length})</span>
          </h3>
          <button
            onClick={onOpenAddWallet}
            className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-white cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {wallets.map((w) => (
            <div
              key={w.id}
              className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-white block">{w.name}</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formatCurrency(w.balance)} • {w.type.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEditWallet(w)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                >
                  Edit
                </button>
                {wallets.length > 1 && (
                  <button
                    onClick={() => onDeleteWallet(w.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Database Backup & Persistence */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Pusat Data & Backup (IndexedDB)</span>
        </h3>

        <div className="flex flex-col gap-2.5">
          {/* Backup to JSON */}
          <button
            onClick={onExportJSON}
            className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs text-white font-semibold transition active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Cadangkan Database (File JSON)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* Restore from JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs text-white font-semibold transition active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Pulihkan Data dari File Cadangan</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* Export to CSV */}
          <button
            onClick={onExportCSV}
            className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs text-white font-semibold transition active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>Ekspor Riwayat Transaksi (Excel / CSV)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* Clear All Transactions and Funds */}
          {onClearAllData && (
            <button
              onClick={onClearAllData}
              className="btn-timbul-rose w-full p-3.5 rounded-2xl flex items-center justify-between text-xs text-white font-bold cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 stroke-[2.5]" />
                <span>Kosongkan Semua Dana & Transaksi (Mulai Nol)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/70" />
            </button>
          )}

          {/* Reset Demo Data */}
          <button
            onClick={onResetData}
            className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs text-slate-300 font-semibold transition active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-slate-400" />
              <span>Muat Ulang Contoh Data Demo</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Security badge note */}
        <div className="mt-4 p-3 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-[11px] text-blue-300 leading-relaxed">
          🔒 <span className="font-bold">Privasi 100% Terjaga:</span> Seluruh catatan keuangan Anda disimpan secara offline & aman di mesin database IndexedDB browser/ponsel Anda. Data tidak pernah dikirim ke pihak luar.
        </div>
      </div>
    </div>
  );
};
