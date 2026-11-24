export type TransactionType = 'income' | 'expense' | 'transfer';

export type WalletType = 'cash' | 'bank' | 'ewallet' | 'investment';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  accountNumber?: string;
  colorGradient: string; // e.g. 'from-blue-600 to-indigo-900'
  icon: string;
  isDefault?: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string; // Tailwind color class or hex
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  walletId: string;
  toWalletId?: string; // used when type === 'transfer'
  date: string; // ISO format: YYYY-MM-DD
  time: string; // HH:mm
  note?: string;
  receiptUrl?: string; // base64 or photo preview
  tags?: string[];
  createdAt: number; // timestamp
}

export interface Budget {
  id: string;
  categoryId: string;
  month: string; // YYYY-MM
  limitAmount: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  icon: string;
  color: string;
  notes?: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface UserSettings {
  userName: string;
  avatarUrl?: string;
  coverBgUrl?: string;
  currency: string; // e.g. 'IDR'
  currencySymbol: string; // 'Rp'
  pinEnabled: boolean;
  pinCode?: string;
  hideBalance: boolean;
  theme: 'dark' | 'light';
  monthlySalaryDay?: number;
}

export interface FinancialHealth {
  score: number; // 0 - 100
  grade: 'Sangat Baik' | 'Baik' | 'Perlu Waspada' | 'Kritis';
  color: string;
  summary: string;
  recommendations: string[];
  savingsRate: number; // percentage
  burnRatePerDay: number;
  forecastRemainingDays: number;
}
