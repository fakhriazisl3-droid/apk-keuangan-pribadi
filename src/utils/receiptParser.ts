import { TransactionType, Category, Wallet } from '../types/finance';
import Tesseract from 'tesseract.js';

export interface DetectedAmountCandidate {
  amount: number;
  label: string;
  isBestMatch?: boolean;
}

export interface ParsedReceiptResult {
  type: TransactionType;
  amount: number;
  merchantOrTitle: string;
  categoryId: string;
  walletId: string;
  date: string;
  time: string;
  note: string;
  confidence: number;
  detectedKeywords: string[];
  rawText: string;
  candidates: DetectedAmountCandidate[];
}

export interface ReceiptSampleTemplate {
  id: string;
  name: string;
  description: string;
  type: TransactionType;
  imageUrl: string;
  rawText: string;
}

export const RECEIPT_SAMPLE_TEMPLATES: ReceiptSampleTemplate[] = [
  {
    id: 'alfamart-receipt',
    name: 'Struk Belanja Alfamart',
    description: 'Struk pembelian kasir minimarket Alfamart',
    type: 'expense',
    imageUrl: 'https://images.unsplash.com/photo-1554415707-9e4c299e4231?w=500&auto=format&fit=crop&q=60',
    rawText: `ALFAMART KEMANG RAYA
PT. SUMBER ALFARIA TRIJAYA TBK
JL. KEMANG RAYA NO 45
NPWP : 01.336.238.9-054.000
BON : 0244-012-23112026
---------------------------------
ROTI TAWAR SARI ROTI    15.000
ULTRA MILK COKLAT 250ML  7.500
POCARI SWEAT 500ML       8.500
CHITATO SAPI PANGGANG   12.500
PLASTIK RAMAH LINGKUNGAN   200
---------------------------------
TOTAL BELANJA         Rp 43.700
TUNAI                Rp 50.000
KEMBALIAN             Rp 6.300
PPN 11% SUDAH TERMASUK
TGL: 24-11-2026 14:32:10 KASIR: RIAN
TERIMA KASIH SELAMAT BELANJA KEMBALI`,
  },
  {
    id: 'gopay-transfer',
    name: 'Screenshot Bayar GoPay (Kopi Kenangan)',
    description: 'Screenshot pembayaran QRIS / Merchant GoPay',
    type: 'expense',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=60',
    rawText: `GoPay - Pembayaran Berhasil
Rp 28.000
Pembayaran ke Kopi Kenangan Mall
ID Transaksi: GP-88192039120
Waktu: 24 Nov 2026, 10:15 WIB
Metode Pembayaran: Saldo GoPay
Status: Berhasil Terverifikasi`,
  },
  {
    id: 'bca-transfer-in',
    name: 'Screenshot Transfer Masuk BCA (Pemasukan)',
    description: 'Bukti mutasi dana masuk ke rekening bank',
    type: 'income',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=60',
    rawText: `BCA mobile - NOTIFIKASI TRANSAKSI
DANA MASUK BERHASIL
Tanggal : 24/11/2026
Waktu : 09:20:15 WIB
Nominal : Rp 3.500.000,00
Pengirim : PT KARYA DIGITAL INDONESIA
Berita : PEMBAYARAN GAJI BULANAN
Ke Rekening : 8219 •••• 4128
Status Transaksi : SUKSES`,
  },
  {
    id: 'pln-bill',
    name: 'Screenshot Tagihan Listrik PLN',
    description: 'Bukti pembayaran token / tagihan listrik PLN',
    type: 'expense',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=500&auto=format&fit=crop&q=60',
    rawText: `BUKTI PEMBAYARAN TAGIHAN LISTRIK
PLN POSTPAID / TOKEN LISTRIK
IDPEL: 53820199201
NAMA: GUSPIAN
TOTAL BAYAR: Rp 152.500
ADMIN BANK: Rp 2.500
TOTAL TAGIHAN: Rp 155.000
METODE: BANK BCA
TANGGAL: 24/11/2026 19:40 WIB
STATUS: LUNAS`,
  },
];

// Canvas-based image preprocessor for optimal OCR text recognition
export const preprocessImageForOcr = async (imageSrc: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        // Standardize image width to 1200px for balanced speed and sharpness
        const targetWidth = Math.min(Math.max(img.width, 900), 1600);
        const scale = targetWidth / img.width;
        canvas.width = targetWidth;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Apply contrast & sharpening filter to enhance thermal receipt text
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        const contrast = 1.35; // 35% contrast boost
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        for (let i = 0; i < d.length; i += 4) {
          const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          const adjusted = factor * (gray - 128) + 128;
          const finalVal = Math.min(255, Math.max(0, adjusted));

          d[i] = finalVal;
          d[i + 1] = finalVal;
          d[i + 2] = finalVal;
        }
        ctx.putImageData(imgData, 0, 0);

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch {
        resolve(imageSrc);
      }
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
};

// Real OCR engine using Tesseract.js with live progress reporting
export const recognizeReceiptImage = async (
  imageSrc: string,
  onProgress?: (progress: number, status: string) => void
): Promise<string> => {
  try {
    if (onProgress) onProgress(15, 'Mempersiapkan foto struk...');
    const preprocessed = await preprocessImageForOcr(imageSrc);

    if (onProgress) onProgress(30, 'Memuat model OCR Tesseract...');

    const result = await Tesseract.recognize(preprocessed, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          const pct = Math.round(30 + m.progress * 65);
          onProgress(pct, `AI Membaca karakter & nominal (${Math.round(m.progress * 100)}%)...`);
        }
      },
    });

    if (onProgress) onProgress(100, 'Selesai membaca!');
    return result.data.text || '';
  } catch (err) {
    console.warn('Tesseract OCR error, fallback to basic text analysis', err);
    return '';
  }
};

// Robust number cleaner for Indonesian currency formats
export const parseIndonesianNumber = (str: string): number => {
  if (!str) return 0;
  // Clean spacing around dots/commas
  let clean = str.replace(/(\d)\s*([.,])\s*(\d)/g, '$1$2$3');
  // Replace letter O or o if accidentally read inside digits
  clean = clean.replace(/(\d)[Oo]/g, '$10').replace(/[Oo](\d)/g, '0$1');
  // Strip non-digit and non-punctuation
  clean = clean.replace(/[^\d.,]/g, '').trim();
  if (!clean) return 0;

  // Case 1: Both dot and comma present
  if (clean.includes('.') && clean.includes(',')) {
    const dotIdx = clean.indexOf('.');
    const commaIdx = clean.indexOf(',');
    if (dotIdx < commaIdx) {
      // Indonesian format: 43.700,00 -> 43700
      clean = clean.substring(0, commaIdx).replace(/\./g, '');
    } else {
      // US format: 43,700.00 -> 43700
      clean = clean.substring(0, dotIdx).replace(/,/g, '');
    }
  } else if (clean.includes('.')) {
    // Check if dot is thousands separator (e.g. 43.700 or 1.500.000)
    const parts = clean.split('.');
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      clean = clean.replace(/\./g, '');
    } else if (parts.length > 2) {
      clean = clean.replace(/\./g, '');
    } else if (parts.length === 2 && parts[1].length === 2) {
      // Decimal cents e.g. "50.00"
      clean = parts[0];
    } else {
      clean = clean.replace(/\./g, '');
    }
  } else if (clean.includes(',')) {
    // Comma as thousands separator or decimal
    const parts = clean.split(',');
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      clean = clean.replace(/,/g, '');
    } else if (parts.length > 2) {
      clean = clean.replace(/,/g, '');
    } else {
      clean = parts[0];
    }
  }

  const num = parseInt(clean, 10);
  return isNaN(num) ? 0 : num;
};

// Intelligent NLP & regex engine for Indonesian receipts & e-wallet/bank screenshots
export const parseReceiptText = (
  text: string,
  categories: Category[],
  wallets: Wallet[]
): ParsedReceiptResult => {
  const upper = text.toUpperCase();
  const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const detectedKeywords: string[] = [];
  const candidates: DetectedAmountCandidate[] = [];
  const seenAmounts = new Set<number>();

  // 1. Detect Transaction Type (Income vs Expense)
  const incomeKeywords = [
    'DANA MASUK',
    'TRANSFER MASUK',
    'DITERIMA DARI',
    'UANG DITERIMA',
    'PENGIRIM :',
    'PENGIRIM:',
    'KREDIT',
    'CR ',
    'GAJI',
    'DIVIDEN',
    'HONOR',
    'DITRANSFER OLEH',
    'SALDO MASUK',
    'MUTASI MASUK',
    'UANG MASUK',
    'TERIMA DANA',
    'INCOMING TRANSFER',
    'TOP UP BERHASIL',
  ];

  let detectedType: TransactionType = 'expense';
  for (const kw of incomeKeywords) {
    if (upper.includes(kw)) {
      detectedType = 'income';
      detectedKeywords.push(`Pemasukan (${kw})`);
      break;
    }
  }

  // 2. High-Accuracy Amount Extraction
  let bestAmount = 0;
  let bestLabel = 'Total';
  let detectedTunai = 0;
  let detectedKembali = 0;

  // Keywords indicating the final total or transfer nominal
  const totalKeywords = [
    'TOTAL BELANJA',
    'TOTAL BAYAR',
    'TOTAL TAGIHAN',
    'TOTAL AKHIR',
    'GRAND TOTAL',
    'TOTAL PEMBELIAN',
    'TOTAL PEMBAYARAN',
    'TOTAL TRANSAKSI',
    'JUMLAH TOTAL',
    'NOMINAL TRANSFER',
    'JUMLAH TRANSFER',
    'TOTAL HARGA',
    'NOMINAL',
    'JUMLAH',
    'TOTAL',
  ];

  // Scan line-by-line and line-pair (label on line i, amount on line i+1)
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const lineUpper = line.toUpperCase();
    const nextLine = i + 1 < rawLines.length ? rawLines[i + 1] : '';

    // Check if line indicates TUNAI or KEMBALI
    const isTunai = lineUpper.includes('TUNAI') || lineUpper.includes('BAYAR TUNAI') || lineUpper.includes('CASH');
    const isKembali = lineUpper.includes('KEMBALI') || lineUpper.includes('KEMBALIAN') || lineUpper.includes('CHANGE');
    const isAdmin = lineUpper.includes('ADMIN') || lineUpper.includes('BIAYA ADMIN');

    // Check if current line contains a total keyword
    const matchedTotalKw = totalKeywords.find((kw) => lineUpper.includes(kw));

    // Look for numbers on current line or next line
    const currentLineMatches = line.match(/(?:RP\.?|IDR)?\s*([0-9]{1,3}(?:[.,\s][0-9]{3})*(?:[.,][0-9]{2})?|[0-9]{4,})/gi) || [];
    const nextLineMatches = nextLine ? nextLine.match(/(?:RP\.?|IDR)?\s*([0-9]{1,3}(?:[.,\s][0-9]{3})*(?:[.,][0-9]{2})?|[0-9]{4,})/gi) || [] : [];

    // Process current line numbers
    for (const m of currentLineMatches) {
      const val = parseIndonesianNumber(m);
      if (val >= 500 && val < 500000000 && !seenAmounts.has(val)) {
        seenAmounts.add(val);

        if (isTunai) {
          detectedTunai = val;
          candidates.push({ amount: val, label: 'Tunai Kasir' });
        } else if (isKembali) {
          detectedKembali = val;
          candidates.push({ amount: val, label: 'Kembalian' });
        } else if (isAdmin) {
          candidates.push({ amount: val, label: 'Biaya Admin' });
        } else if (matchedTotalKw) {
          candidates.push({ amount: val, label: `Total (${matchedTotalKw})` });
          if (bestAmount === 0 || matchedTotalKw.includes('TOTAL BELANJA') || matchedTotalKw.includes('TOTAL BAYAR') || matchedTotalKw.includes('GRAND TOTAL')) {
            bestAmount = val;
            bestLabel = matchedTotalKw;
          }
        } else if (lineUpper.includes('RP') || lineUpper.includes('IDR')) {
          candidates.push({ amount: val, label: 'Nominal Rp' });
          if (bestAmount === 0) {
            bestAmount = val;
            bestLabel = 'Nominal Terdeteksi';
          }
        } else {
          candidates.push({ amount: val, label: 'Nominal' });
        }
      }
    }

    // If current line had a total keyword but no number on it, inspect next line
    if (matchedTotalKw && currentLineMatches.length === 0 && nextLineMatches.length > 0) {
      for (const m of nextLineMatches) {
        const val = parseIndonesianNumber(m);
        if (val >= 500 && val < 500000000 && !seenAmounts.has(val)) {
          seenAmounts.add(val);
          candidates.push({ amount: val, label: `Total (${matchedTotalKw})` });
          if (bestAmount === 0 || matchedTotalKw.includes('TOTAL')) {
            bestAmount = val;
            bestLabel = matchedTotalKw;
          }
        }
      }
    }
  }

  // Fallback 1: If no explicit TOTAL found, but both TUNAI and KEMBALI are present:
  // TOTAL = TUNAI - KEMBALI (e.g. 50.000 - 6.300 = 43.700)
  if (bestAmount === 0 && detectedTunai > 0 && detectedKembali > 0 && detectedTunai > detectedKembali) {
    const calculatedTotal = detectedTunai - detectedKembali;
    if (calculatedTotal >= 500) {
      bestAmount = calculatedTotal;
      bestLabel = 'Total Dihitung (Tunai - Kembali)';
      if (!seenAmounts.has(calculatedTotal)) {
        candidates.unshift({ amount: calculatedTotal, label: 'Total Belanja (Kalkulasi AI)', isBestMatch: true });
        seenAmounts.add(calculatedTotal);
      }
    }
  }

  // Fallback 2: Regex scan for standalone "Rp X.XXX" lines (common in GoPay/Dana/Bank transfer headers)
  if (bestAmount === 0) {
    const prominentMatches = text.match(/(?:RP\.?|IDR)\s*([0-9]{1,3}(?:\.[0-9]{3})+|[0-9]{4,})/gi);
    if (prominentMatches) {
      for (const m of prominentMatches) {
        const val = parseIndonesianNumber(m);
        if (val >= 1000 && val < 500000000) {
          bestAmount = val;
          bestLabel = 'Nominal Terbaca';
          if (!seenAmounts.has(val)) {
            candidates.push({ amount: val, label: 'Nominal Utama' });
            seenAmounts.add(val);
          }
          break;
        }
      }
    }
  }

  // Fallback 3: If still 0, pick the largest candidate that is not a date (e.g. not 2026)
  if (bestAmount === 0 && candidates.length > 0) {
    const nonDateCandidates = candidates.filter((c) => c.amount !== 2024 && c.amount !== 2025 && c.amount !== 2026 && c.amount !== 2027);
    if (nonDateCandidates.length > 0) {
      // Pick candidate with highest amount as fallback
      const largest = nonDateCandidates.reduce((max, c) => (c.amount > max.amount ? c : max), nonDateCandidates[0]);
      bestAmount = largest.amount;
      bestLabel = largest.label;
    }
  }

  // Mark best match candidate
  candidates.forEach((c) => {
    if (c.amount === bestAmount) {
      c.isBestMatch = true;
    }
  });

  if (bestAmount > 0) {
    detectedKeywords.push(`Nominal: Rp ${bestAmount.toLocaleString('id-ID')} (${bestLabel})`);
  }

  // 3. Detect Merchant / Store & Category
  let detectedMerchant = 'Transaksi Terdeteksi';
  let matchedCategoryId = '';

  if (upper.includes('ALFAMART') || upper.includes('ALFA ') || upper.includes('SAT TBK')) {
    detectedMerchant = 'Belanja Alfamart';
    matchedCategoryId = categories.find((c) => c.name.toLowerCase().includes('belanja'))?.id || 'cat-belanja';
    detectedKeywords.push('Toko: Alfamart');
  } else if (upper.includes('INDOMARET') || upper.includes('INDOMARCO')) {
    detectedMerchant = 'Belanja Indomaret';
    matchedCategoryId = categories.find((c) => c.name.toLowerCase().includes('belanja'))?.id || 'cat-belanja';
    detectedKeywords.push('Toko: Indomaret');
  } else if (
    upper.includes('KOPI') ||
    upper.includes('KENANGAN') ||
    upper.includes('RESTO') ||
    upper.includes('FOOD') ||
    upper.includes('CAFE') ||
    upper.includes('MCD') ||
    upper.includes('WARUNG') ||
    upper.includes('BAKSO') ||
    upper.includes('KFC') ||
    upper.includes('FORE') ||
    upper.includes('STARBUCKS')
  ) {
    detectedMerchant = 'Makanan & Minuman';
    matchedCategoryId = categories.find((c) => c.name.toLowerCase().includes('makan'))?.id || 'cat-makan';
    detectedKeywords.push('Kategori: Makanan & Minuman');
  } else if (upper.includes('PLN') || upper.includes('LISTRIK') || upper.includes('TAGIHAN') || upper.includes('WIFI') || upper.includes('TELKOM')) {
    detectedMerchant = 'Tagihan Listrik / PLN';
    matchedCategoryId = categories.find((c) => c.name.toLowerCase().includes('tagihan'))?.id || 'cat-tagihan';
    detectedKeywords.push('Kategori: Tagihan Listrik');
  } else if (upper.includes('PERTAMINA') || upper.includes('SPBU') || upper.includes('BENSIN') || upper.includes('GOJEK') || upper.includes('GRAB')) {
    detectedMerchant = 'Transportasi / Bensin';
    matchedCategoryId = categories.find((c) => c.name.toLowerCase().includes('transport'))?.id || 'cat-transport';
    detectedKeywords.push('Kategori: Transportasi');
  } else if (detectedType === 'income') {
    detectedMerchant = 'Pemasukan / Transfer Masuk';
    matchedCategoryId = categories.find((c) => c.type === 'income')?.id || 'cat-gaji';
  } else {
    matchedCategoryId = categories.find((c) => c.type === detectedType)?.id || categories[0]?.id || '';
  }

  // 4. Detect Wallet
  let matchedWalletId = wallets[0]?.id || '';
  if (upper.includes('GOPAY') || upper.includes('GO-PAY')) {
    const gopayWallet = wallets.find((w) => w.name.toLowerCase().includes('gopay') || w.type === 'ewallet');
    if (gopayWallet) matchedWalletId = gopayWallet.id;
    detectedKeywords.push('Rekening: GoPay');
  } else if (upper.includes('BCA')) {
    const bcaWallet = wallets.find((w) => w.name.toLowerCase().includes('bca') || w.type === 'bank');
    if (bcaWallet) matchedWalletId = bcaWallet.id;
    detectedKeywords.push('Rekening: Bank BCA');
  } else if (upper.includes('MANDIRI')) {
    const mandiriWallet = wallets.find((w) => w.name.toLowerCase().includes('mandiri'));
    if (mandiriWallet) matchedWalletId = mandiriWallet.id;
    detectedKeywords.push('Rekening: Bank Mandiri');
  } else if (upper.includes('TUNAI') || upper.includes('CASH')) {
    const cashWallet = wallets.find((w) => w.type === 'cash');
    if (cashWallet) matchedWalletId = cashWallet.id;
    detectedKeywords.push('Rekening: Dompet Tunai');
  }

  // 5. Date & Time
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const confidence = bestAmount > 0 ? (detectedKeywords.length >= 2 ? 96 : 85) : 35;

  return {
    type: detectedType,
    amount: bestAmount,
    merchantOrTitle: detectedMerchant,
    categoryId: matchedCategoryId,
    walletId: matchedWalletId,
    date: dateStr,
    time: timeStr,
    note: `Scan: ${detectedMerchant}`,
    confidence,
    detectedKeywords,
    rawText: text,
    candidates,
  };
};
