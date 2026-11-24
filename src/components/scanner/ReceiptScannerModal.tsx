import React, { useState, useRef } from 'react';
import { Category, Wallet, Transaction } from '../../types/finance';
import { Modal } from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';
import { IconResolver } from '../common/IconResolver';
import {
  parseReceiptText,
  recognizeReceiptImage,
  ParsedReceiptResult,
  RECEIPT_SAMPLE_TEMPLATES,
  ReceiptSampleTemplate,
} from '../../utils/receiptParser';
import { playTactileClick } from '../../utils/sound';
import {
  Camera,
  Upload,
  Sparkles,
  Check,
  Edit3,
  RefreshCw,
  Zap,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Tag,
  AlertCircle,
} from 'lucide-react';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  wallets: Wallet[];
  onApplyTransaction: (tx: Transaction) => void;
  onOpenInFullForm: (tx: Transaction) => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  categories,
  wallets,
  onApplyTransaction,
  onOpenInFullForm,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [parsedResult, setParsedResult] = useState<ParsedReceiptResult | null>(null);
  const [editableAmount, setEditableAmount] = useState<string>('');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setSelectedImage(null);
    setIsScanning(false);
    setOcrStatus('');
    setOcrProgress(0);
    setParsedResult(null);
    setEditableAmount('');
  };

  // Run real OCR or analyze text
  const processImageWithOcr = async (imageSrc: string, fallbackText?: string) => {
    setIsScanning(true);
    setParsedResult(null);
    setSelectedImage(imageSrc);
    setOcrStatus('Mempersiapkan gambar untuk AI Scanner...');
    setOcrProgress(10);

    try {
      let extractedText = fallbackText || '';

      // If no fallback text provided, perform REAL OCR on the image
      if (!extractedText) {
        extractedText = await recognizeReceiptImage(imageSrc, (prog, status) => {
          setOcrProgress(prog);
          setOcrStatus(status);
        });
      }

      // Parse the extracted OCR text
      const result = parseReceiptText(extractedText, categories, wallets);
      setParsedResult(result);
      setEditableAmount(result.amount > 0 ? result.amount.toString() : '');
      setIsScanning(false);
      playTactileClick('success');
    } catch (err) {
      console.error('OCR Processing error', err);
      setIsScanning(false);
      setOcrStatus('Gagal membaca gambar. Silakan masukkan nominal manual.');
    }
  };

  // Handle local photo/screenshot selection (Camera or Gallery)
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playTactileClick('pop');
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      await processImageWithOcr(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Handle preset sample selection
  const handleSelectSample = async (sample: ReceiptSampleTemplate) => {
    playTactileClick('pop');
    await processImageWithOcr(sample.imageUrl, sample.rawText);
  };

  // Select a candidate amount from the detected list
  const handleSelectCandidate = (candidateAmount: number) => {
    playTactileClick('tap');
    setEditableAmount(candidateAmount.toString());
  };

  // Save transaction directly
  const handleSaveDirectly = () => {
    if (!parsedResult) return;
    const finalAmount = parseInt(editableAmount, 10) || parsedResult.amount;

    if (!finalAmount || finalAmount <= 0) {
      alert('Nominal belum terisi. Harap masukkan nominal transaksi.');
      return;
    }

    const tx: Transaction = {
      id: 'tx-scan-' + Date.now(),
      type: parsedResult.type,
      amount: finalAmount,
      categoryId: parsedResult.categoryId,
      walletId: parsedResult.walletId,
      date: parsedResult.date,
      time: parsedResult.time,
      note: parsedResult.note,
      receiptUrl: selectedImage || undefined,
      createdAt: Date.now(),
    };

    playTactileClick('success');
    onApplyTransaction(tx);
    onClose();
    resetState();
  };

  // Open in full modal for fine adjustments
  const handleEditInModal = () => {
    if (!parsedResult) return;
    const finalAmount = parseInt(editableAmount, 10) || parsedResult.amount;

    const tx: Transaction = {
      id: 'tx-scan-' + Date.now(),
      type: parsedResult.type,
      amount: finalAmount,
      categoryId: parsedResult.categoryId,
      walletId: parsedResult.walletId,
      date: parsedResult.date,
      time: parsedResult.time,
      note: parsedResult.note,
      receiptUrl: selectedImage || undefined,
      createdAt: Date.now(),
    };

    onOpenInFullForm(tx);
    onClose();
    resetState();
  };

  const detectedCategory = categories.find((c) => c.id === parsedResult?.categoryId);
  const detectedWallet = wallets.find((w) => w.id === parsedResult?.walletId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetState();
      }}
      title="AI Scan Struk & Bukti Transfer"
      subtitle="Teknologi OCR Cerdas pembaca foto struk & screenshot bank"
    >
      <div className="flex flex-col gap-4">
        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleFileSelected}
          className="hidden"
        />
        <input
          type="file"
          ref={galleryInputRef}
          accept="image/*"
          onChange={handleFileSelected}
          className="hidden"
        />

        {/* Action Pickers (When no image is chosen yet) */}
        {!selectedImage && (
          <div className="flex flex-col gap-3">
            {/* Camera & Gallery Buttons with 3D TIMBUL */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  playTactileClick('pop');
                  cameraInputRef.current?.click();
                }}
                className="btn-timbul-primary p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-white font-bold text-xs cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Camera className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span>Foto Kamera HP</span>
                <span className="text-[10px] text-blue-200 font-normal">Jepret Struk Alfamart / Bon</span>
              </button>

              <button
                onClick={() => {
                  playTactileClick('pop');
                  galleryInputRef.current?.click();
                }}
                className="btn-timbul-dark p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-200 font-bold text-xs cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400">
                  <Upload className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span>Upload Screenshot</span>
                <span className="text-[10px] text-slate-400 font-normal">Bukti GoPay / Bank BCA</span>
              </button>
            </div>

            {/* Instant Sample Presets for 1-Click Testing */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Uji Coba Cepat (Contoh Struk & Bukti Nyata):</span>
              </span>

              <div className="flex flex-col gap-2">
                {RECEIPT_SAMPLE_TEMPLATES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className="key-timbul p-2.5 rounded-xl flex items-center justify-between text-left text-xs cursor-pointer hover:border-slate-600 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{sample.name}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            sample.type === 'income'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {sample.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{sample.description}</span>
                    </div>
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Image Preview & Scanning Laser Beam */}
        {selectedImage && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 max-h-56 flex items-center justify-center">
            <img
              src={selectedImage}
              alt="Bukti Struk"
              className="w-full h-56 object-cover object-top opacity-85"
            />

            {/* Animated Laser Scanning Beam */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between overflow-hidden">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce" />
                <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[1px] flex items-center justify-center p-4">
                  <div className="w-full max-w-xs p-3 rounded-2xl bg-black/90 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex flex-col items-center gap-2 shadow-2xl">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                      <span>{ocrStatus || 'AI Sedang Membaca Teks...'}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                        style={{ width: `${ocrProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Detection Result Card */}
        {parsedResult && !isScanning && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 flex flex-col gap-3 shadow-lg">
            {/* Header: Type and Confidence Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${
                    parsedResult.type === 'income'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {parsedResult.type === 'income' ? (
                    <>
                      <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>PEMASUKAN TERDETEKSI</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>PENGELUARAN TERDETEKSI</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                <span>Akurasi: {parsedResult.confidence}%</span>
              </div>
            </div>

            {/* Nominal Display & Direct Edit */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Nominal Terbaca (Bisa Diedit)
              </span>
              <div className="flex items-center justify-center gap-1 text-2xl font-black mt-0.5">
                <span className="text-slate-400 text-base">Rp</span>
                <input
                  type="number"
                  value={editableAmount}
                  onChange={(e) => setEditableAmount(e.target.value)}
                  placeholder="0"
                  className="w-48 bg-transparent text-center font-black text-white text-2xl outline-none"
                />
              </div>

              {/* Candidate Numbers detected on the receipt */}
              {parsedResult.candidates.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    Angka yang Terbaca di Foto (Tap untuk pilih):
                  </span>
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    {parsedResult.candidates.map((cand, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectCandidate(cand.amount)}
                        className={`key-timbul px-2.5 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition ${
                          editableAmount === cand.amount.toString()
                            ? 'bg-blue-600 text-white border-blue-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {formatCurrency(cand.amount)} <span className="text-[9px] text-slate-400">({cand.label})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Merchant, Category, and Wallet Metadata */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">Kategori Terpilih:</span>
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <IconResolver name={detectedCategory?.icon || 'Tag'} className="w-3.5 h-3.5 text-blue-400" />
                  <span className="truncate">{detectedCategory?.name || 'Kategori'}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">Rekening / Dompet:</span>
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <IconResolver name={detectedWallet?.icon || 'Wallet'} className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate">{detectedWallet?.name || 'Dompet'}</span>
                </div>
              </div>
            </div>

            {/* Detected Keywords tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {parsedResult.detectedKeywords.map((kw, i) => (
                <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                  ✓ {kw}
                </span>
              ))}
            </div>

            {/* Action Buttons with 3D TIMBUL */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleEditInModal}
                className="btn-timbul-dark py-3.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-slate-300 font-bold text-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                <span>Koreksi Form</span>
              </button>

              <button
                type="button"
                onClick={handleSaveDirectly}
                className={`py-3.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-white font-bold text-xs cursor-pointer ${
                  parsedResult.type === 'income' ? 'btn-timbul-emerald' : 'btn-timbul-primary'
                }`}
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Simpan Otomatis</span>
              </button>
            </div>

            {/* Retry Button */}
            <button
              onClick={resetState}
              className="text-center text-[11px] text-slate-400 hover:text-white pt-1 cursor-pointer flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Pindai Foto / Screenshot Lain</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
