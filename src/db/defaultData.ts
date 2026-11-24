import { Category, Wallet, Budget, SavingsGoal, Transaction, UserSettings } from '../types/finance';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  userName: 'Guspian',
  avatarUrl: '',
  coverBgUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80',
  currency: 'IDR',
  currencySymbol: 'Rp',
  pinEnabled: false,
  pinCode: '123456',
  hideBalance: false,
  theme: 'dark',
  monthlySalaryDay: 25,
};

export const DEFAULT_CATEGORIES: Category[] = [
  // Pengeluaran
  { id: 'cat-makan', name: 'Makanan & Minuman', type: 'expense', icon: 'Utensils', color: '#f97316' },
  { id: 'cat-transport', name: 'Transportasi & Bensin', type: 'expense', icon: 'Car', color: '#3b82f6' },
  { id: 'cat-belanja', name: 'Belanja Harian', type: 'expense', icon: 'ShoppingBag', color: '#ec4899' },
  { id: 'cat-tagihan', name: 'Tagihan & Listrik', type: 'expense', icon: 'Zap', color: '#eab308' },
  { id: 'cat-hiburan', name: 'Hiburan & Liburan', type: 'expense', icon: 'Film', color: '#a855f7' },
  { id: 'cat-kesehatan', name: 'Kesehatan & Obat', type: 'expense', icon: 'HeartPulse', color: '#ef4444' },
  { id: 'cat-edukasi', name: 'Edukasi & Buku', type: 'expense', icon: 'GraduationCap', color: '#06b6d4' },
  { id: 'cat-donasi', name: 'Sedekah & Donasi', type: 'expense', icon: 'Gift', color: '#10b981' },
  { id: 'cat-cicilan', name: 'Cicilan & Utang', type: 'expense', icon: 'Landmark', color: '#64748b' },
  { id: 'cat-lain', name: 'Lain-lain', type: 'expense', icon: 'MoreHorizontal', color: '#94a3b8' },

  // Pemasukan
  { id: 'cat-gaji', name: 'Gaji Bulanan', type: 'income', icon: 'Banknote', color: '#10b981' },
  { id: 'cat-bonus', name: 'Bonus & THR', type: 'income', icon: 'Award', color: '#3b82f6' },
  { id: 'cat-investasi', name: 'Dividen & Investasi', type: 'income', icon: 'TrendingUp', color: '#8b5cf6' },
  { id: 'cat-bisnis', name: 'Usaha / Freelance', type: 'income', icon: 'Store', color: '#f59e0b' },
  { id: 'cat-gift-in', name: 'Hadiah Masuk', type: 'income', icon: 'Gift', color: '#ec4899' },
];

// Saldo dikosongkan (0) agar pengguna dapat mengisi dan mencatat saldonya sendiri dari awal
export const DEFAULT_WALLETS: Wallet[] = [
  {
    id: 'wallet-bca',
    name: 'Bank BCA',
    type: 'bank',
    balance: 0,
    accountNumber: '8219 •••• 4128',
    colorGradient: 'from-blue-600 via-blue-700 to-indigo-950',
    icon: 'CreditCard',
    isDefault: true,
  },
  {
    id: 'wallet-gopay',
    name: 'GoPay / E-Wallet',
    type: 'ewallet',
    balance: 0,
    accountNumber: '0812 •••• 9902',
    colorGradient: 'from-emerald-600 via-teal-700 to-slate-900',
    icon: 'Smartphone',
  },
  {
    id: 'wallet-cash',
    name: 'Dompet Tunai',
    type: 'cash',
    balance: 0,
    accountNumber: 'Uang Saku',
    colorGradient: 'from-amber-600 via-orange-700 to-zinc-900',
    icon: 'Wallet',
  },
];

export const getCurrentMonthString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const DEFAULT_BUDGETS: Budget[] = [
  { id: 'b-makan', categoryId: 'cat-makan', month: getCurrentMonthString(), limitAmount: 1500000 },
  { id: 'b-transport', categoryId: 'cat-transport', month: getCurrentMonthString(), limitAmount: 500000 },
  { id: 'b-belanja', categoryId: 'cat-belanja', month: getCurrentMonthString(), limitAmount: 1000000 },
];

export const DEFAULT_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal-laptop',
    title: 'Target Tabungan Utama',
    targetAmount: 10000000,
    currentAmount: 0,
    deadline: '2027-12-31',
    icon: 'Laptop',
    color: '#3b82f6',
    notes: 'Mulai menabung dari nol',
    isCompleted: false,
  },
];

// Kosongkan semua transaksi agar pengguna mengisi sendiri dari awal
export const DEFAULT_TRANSACTIONS: Transaction[] = [];
