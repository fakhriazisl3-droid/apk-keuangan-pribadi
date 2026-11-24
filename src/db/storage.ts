import {
  Transaction,
  Category,
  Wallet,
  Budget,
  SavingsGoal,
  UserSettings,
} from '../types/finance';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_WALLETS,
  DEFAULT_BUDGETS,
  DEFAULT_SAVINGS_GOALS,
  DEFAULT_TRANSACTIONS,
  DEFAULT_USER_SETTINGS,
} from './defaultData';

const DB_NAME = 'KeuanganKu_DB';
const DB_VERSION = 1;

// Storage keys for localStorage mirror/fallback
const STORAGE_KEYS = {
  TRANSACTIONS: 'keuanganku_transactions',
  CATEGORIES: 'keuanganku_categories',
  WALLETS: 'keuanganku_wallets',
  BUDGETS: 'keuanganku_budgets',
  SAVINGS: 'keuanganku_savings',
  SETTINGS: 'keuanganku_settings',
  INITIALIZED: 'keuanganku_initialized_v2',
  CLEAN_SLATE: 'keuanganku_cleaned_zero_v2',
};

class StorageService {
  private db: IDBDatabase | null = null;
  private isReady = false;

  constructor() {
    this.initDatabase();
  }

  // Initialize IndexedDB with schema
  private async initDatabase(): Promise<IDBDatabase | null> {
    if (this.db) return this.db;

    if (typeof window === 'undefined' || !window.indexedDB) {
      this.isReady = true;
      this.ensureLocalStorageSeed();
      return null;
    }

    return new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('transactions')) {
            const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
            txStore.createIndex('date', 'date', { unique: false });
            txStore.createIndex('walletId', 'walletId', { unique: false });
            txStore.createIndex('categoryId', 'categoryId', { unique: false });
          }
          if (!db.objectStoreNames.contains('categories')) {
            db.createObjectStore('categories', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('wallets')) {
            db.createObjectStore('wallets', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('budgets')) {
            db.createObjectStore('budgets', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('savingsGoals')) {
            db.createObjectStore('savingsGoals', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
          }
        };

        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          this.isReady = true;
          this.ensureInitialSeed();
          resolve(this.db);
        };

        request.onerror = () => {
          console.warn('IndexedDB unavailable, falling back to LocalStorage');
          this.isReady = true;
          this.ensureLocalStorageSeed();
          resolve(null);
        };
      } catch (e) {
        console.warn('IndexedDB exception, using LocalStorage', e);
        this.isReady = true;
        this.ensureLocalStorageSeed();
        resolve(null);
      }
    });
  }

  // Seed default clean data if first run or if requested to clean
  private async ensureInitialSeed(): Promise<void> {
    const isClean = localStorage.getItem(STORAGE_KEYS.CLEAN_SLATE);
    if (!isClean) {
      await this.resetToZeroData();
      localStorage.setItem(STORAGE_KEYS.CLEAN_SLATE, 'true');
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  private ensureLocalStorageSeed(): void {
    const isClean = localStorage.getItem(STORAGE_KEYS.CLEAN_SLATE);
    if (!isClean) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(DEFAULT_WALLETS));
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(DEFAULT_BUDGETS));
      localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(DEFAULT_SAVINGS_GOALS));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_USER_SETTINGS));
      localStorage.setItem(STORAGE_KEYS.CLEAN_SLATE, 'true');
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  async resetToZeroData(): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(DEFAULT_WALLETS));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(DEFAULT_BUDGETS));
    localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(DEFAULT_SAVINGS_GOALS));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_USER_SETTINGS));

    if (this.db) {
      const clearStore = (name: string) => {
        try {
          const tx = this.db!.transaction(name, 'readwrite');
          tx.objectStore(name).clear();
        } catch {}
      };
      clearStore('transactions');
      clearStore('categories');
      clearStore('wallets');
      clearStore('budgets');
      clearStore('savingsGoals');

      for (const w of DEFAULT_WALLETS) await this.putItem('wallets', STORAGE_KEYS.WALLETS, w);
      for (const c of DEFAULT_CATEGORIES) await this.putItem('categories', STORAGE_KEYS.CATEGORIES, c);
      for (const b of DEFAULT_BUDGETS) await this.putItem('budgets', STORAGE_KEYS.BUDGETS, b);
      for (const s of DEFAULT_SAVINGS_GOALS) await this.putItem('savingsGoals', STORAGE_KEYS.SAVINGS, s);
    }
  }

  // Generic IndexedDB Helpers
  private async getAll<T>(storeName: string, fallbackKey: string, defaultVal: T[]): Promise<T[]> {
    await this.initDatabase();
    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db!.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const req = store.getAll();
          req.onsuccess = () => {
            const result = req.result as T[];
            if (result && result.length > 0) {
              resolve(result);
            } else {
              // Check fallback
              const saved = localStorage.getItem(fallbackKey);
              resolve(saved ? JSON.parse(saved) : defaultVal);
            }
          };
          req.onerror = () => {
            const saved = localStorage.getItem(fallbackKey);
            resolve(saved ? JSON.parse(saved) : defaultVal);
          };
        } catch {
          const saved = localStorage.getItem(fallbackKey);
          resolve(saved ? JSON.parse(saved) : defaultVal);
        }
      });
    }

    const saved = localStorage.getItem(fallbackKey);
    return saved ? JSON.parse(saved) : defaultVal;
  }

  private async putItem<T extends { id?: string; key?: string }>(
    storeName: string,
    fallbackKey: string,
    item: T
  ): Promise<void> {
    await this.initDatabase();
    // Update local mirror
    try {
      const items = await this.getAll<T>(storeName, fallbackKey, []);
      const index = items.findIndex((i) => (i.id && i.id === item.id) || (i.key && i.key === item.key));
      if (index >= 0) {
        items[index] = item;
      } else {
        items.push(item);
      }
      localStorage.setItem(fallbackKey, JSON.stringify(items));
    } catch (e) {
      console.warn('LocalStorage put error', e);
    }

    // Save to IndexedDB
    if (this.db) {
      return new Promise((resolve, reject) => {
        try {
          const tx = this.db!.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const req = store.put(item);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        } catch (err) {
          reject(err);
        }
      });
    }
  }

  private async deleteItem(storeName: string, fallbackKey: string, id: string): Promise<void> {
    await this.initDatabase();
    try {
      const items = await this.getAll<{ id: string }>(storeName, fallbackKey, []);
      const filtered = items.filter((i) => i.id !== id);
      localStorage.setItem(fallbackKey, JSON.stringify(filtered));
    } catch (e) {
      console.warn('LocalStorage delete error', e);
    }

    if (this.db) {
      return new Promise((resolve, reject) => {
        try {
          const tx = this.db!.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const req = store.delete(id);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        } catch (err) {
          reject(err);
        }
      });
    }
  }

  // --- Transactions ---
  async getTransactions(): Promise<Transaction[]> {
    const list = await this.getAll<Transaction>(
      'transactions',
      STORAGE_KEYS.TRANSACTIONS,
      DEFAULT_TRANSACTIONS
    );
    return list.sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }

  async saveTransaction(tx: Transaction): Promise<void> {
    // Check if updating or creating
    const oldTransactions = await this.getTransactions();
    const existing = oldTransactions.find((t) => t.id === tx.id);

    // Revert existing balance impact if updating
    if (existing) {
      await this.adjustWalletForTransaction(existing, true);
    }

    // Apply new balance impact
    await this.adjustWalletForTransaction(tx, false);

    // Save transaction
    await this.putItem('transactions', STORAGE_KEYS.TRANSACTIONS, tx);
  }

  async deleteTransaction(id: string): Promise<void> {
    const oldTransactions = await this.getTransactions();
    const existing = oldTransactions.find((t) => t.id === id);
    if (existing) {
      // Revert wallet balance
      await this.adjustWalletForTransaction(existing, true);
    }
    await this.deleteItem('transactions', STORAGE_KEYS.TRANSACTIONS, id);
  }

  private async adjustWalletForTransaction(tx: Transaction, isRevert: boolean): Promise<void> {
    const wallets = await this.getWallets();
    const mult = isRevert ? -1 : 1;

    if (tx.type === 'expense') {
      const wallet = wallets.find((w) => w.id === tx.walletId);
      if (wallet) {
        wallet.balance -= tx.amount * mult;
        await this.saveAllWallets(wallets);
      }
    } else if (tx.type === 'income') {
      const wallet = wallets.find((w) => w.id === tx.walletId);
      if (wallet) {
        wallet.balance += tx.amount * mult;
        await this.saveAllWallets(wallets);
      }
    } else if (tx.type === 'transfer' && tx.toWalletId) {
      const source = wallets.find((w) => w.id === tx.walletId);
      const target = wallets.find((w) => w.id === tx.toWalletId);
      if (source) source.balance -= tx.amount * mult;
      if (target) target.balance += tx.amount * mult;
      await this.saveAllWallets(wallets);
    }
  }

  // --- Wallets ---
  async getWallets(): Promise<Wallet[]> {
    return this.getAll<Wallet>('wallets', STORAGE_KEYS.WALLETS, DEFAULT_WALLETS);
  }

  async saveWallet(wallet: Wallet): Promise<void> {
    await this.putItem('wallets', STORAGE_KEYS.WALLETS, wallet);
  }

  async saveAllWallets(wallets: Wallet[]): Promise<void> {
    await this.initDatabase();
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
    if (this.db) {
      return new Promise((resolve, reject) => {
        try {
          const tx = this.db!.transaction('wallets', 'readwrite');
          const store = tx.objectStore('wallets');
          for (const w of wallets) {
            store.put(w);
          }
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        } catch (err) {
          reject(err);
        }
      });
    }
  }

  async executeTransfer(fromId: string, toId: string, amount: number, note?: string): Promise<void> {
    const wallets = await this.getWallets();
    const sourceWallet = wallets.find((w) => w.id === fromId);
    const targetWallet = wallets.find((w) => w.id === toId);

    if (sourceWallet && sourceWallet.balance < amount) {
      throw new Error('Saldo dompet sumber tidak mencukupi untuk transfer');
    }

    if (sourceWallet) {
      sourceWallet.balance -= amount;
    }
    if (targetWallet) {
      targetWallet.balance += amount;
    }

    await this.saveAllWallets(wallets);

    const tx: Transaction = {
      id: 'tx-trf-' + Date.now(),
      type: 'transfer',
      amount,
      categoryId: 'cat-lain',
      walletId: fromId,
      toWalletId: toId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().substring(0, 5),
      note: note || `Transfer dari ${sourceWallet?.name || 'Dompet'} ke ${targetWallet?.name || 'Rekening'}`,
      createdAt: Date.now(),
    };
    await this.putItem('transactions', STORAGE_KEYS.TRANSACTIONS, tx);
  }

  async deleteWallet(id: string): Promise<void> {
    await this.deleteItem('wallets', STORAGE_KEYS.WALLETS, id);
  }

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    return this.getAll<Category>('categories', STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  }

  async saveCategory(category: Category): Promise<void> {
    await this.putItem('categories', STORAGE_KEYS.CATEGORIES, category);
  }

  async deleteCategory(id: string): Promise<void> {
    await this.deleteItem('categories', STORAGE_KEYS.CATEGORIES, id);
  }

  // --- Budgets ---
  async getBudgets(month?: string): Promise<Budget[]> {
    const all = await this.getAll<Budget>('budgets', STORAGE_KEYS.BUDGETS, DEFAULT_BUDGETS);
    if (month) {
      return all.filter((b) => b.month === month);
    }
    return all;
  }

  async saveBudget(budget: Budget): Promise<void> {
    await this.putItem('budgets', STORAGE_KEYS.BUDGETS, budget);
  }

  async deleteBudget(id: string): Promise<void> {
    await this.deleteItem('budgets', STORAGE_KEYS.BUDGETS, id);
  }

  // --- Savings Goals ---
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    return this.getAll<SavingsGoal>('savingsGoals', STORAGE_KEYS.SAVINGS, DEFAULT_SAVINGS_GOALS);
  }

  async saveSavingsGoal(goal: SavingsGoal): Promise<void> {
    await this.putItem('savingsGoals', STORAGE_KEYS.SAVINGS, goal);
  }

  async deleteSavingsGoal(id: string): Promise<void> {
    await this.deleteItem('savingsGoals', STORAGE_KEYS.SAVINGS, id);
  }

  async depositToGoal(goalId: string, amount: number, walletId: string): Promise<SavingsGoal | null> {
    const goals = await this.getSavingsGoals();
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return null;

    // Defensive check: validate wallet balance for deposit and goal amount for withdrawal
    const wallets = await this.getWallets();
    const wallet = wallets.find((w) => w.id === walletId);
    if (amount > 0 && wallet && wallet.balance < amount) {
      throw new Error('Saldo dompet tidak mencukupi untuk setor tabungan');
    }
    if (amount < 0 && goal.currentAmount < Math.abs(amount)) {
      throw new Error('Nominal penarikan melebihi saldo tabungan saat ini');
    }

    goal.currentAmount = Math.max(0, goal.currentAmount + amount);
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
      goal.completedAt = new Date().toISOString().split('T')[0];
    } else {
      goal.isCompleted = false;
    }

    // Deduct from wallet if depositing, add if withdrawing
    if (wallet) {
      wallet.balance -= amount;
      await this.saveWallet(wallet);
    }

    // Also record a transaction for tracking
    const tx: Transaction = {
      id: 'tx-goal-' + Date.now(),
      type: amount > 0 ? 'expense' : 'income',
      amount: Math.abs(amount),
      categoryId: 'cat-investasi',
      walletId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().substring(0, 5),
      note: `${amount > 0 ? 'Setor' : 'Tarik'} Tabungan: ${goal.title}`,
      createdAt: Date.now(),
    };
    await this.putItem('transactions', STORAGE_KEYS.TRANSACTIONS, tx);

    await this.saveSavingsGoal(goal);
    return goal;
  }

  // --- Settings ---
  async getSettings(): Promise<UserSettings> {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      return { ...DEFAULT_USER_SETTINGS, ...JSON.parse(saved) };
    }
    return DEFAULT_USER_SETTINGS;
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    if (this.db) {
      try {
        const tx = this.db.transaction('settings', 'readwrite');
        const store = tx.objectStore('settings');
        store.put({ key: 'user_settings', ...settings });
      } catch (e) {
        console.warn('DB settings save error', e);
      }
    }
  }

  // --- Export & Backup ---
  async exportAllDataJSON(): Promise<string> {
    const data = {
      exportedAt: new Date().toISOString(),
      appName: 'KeuanganKu Mobile',
      version: '1.0.0',
      transactions: await this.getTransactions(),
      categories: await this.getCategories(),
      wallets: await this.getWallets(),
      budgets: await this.getBudgets(),
      savingsGoals: await this.getSavingsGoals(),
      settings: await this.getSettings(),
    };
    return JSON.stringify(data, null, 2);
  }

  async importAllDataJSON(jsonStr: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.transactions || !parsed.wallets || !parsed.categories) {
        throw new Error('Format file cadangan tidak valid');
      }

      // Clear current data first
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(parsed.transactions));
      localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(parsed.wallets));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(parsed.categories));
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(parsed.budgets || []));
      localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(parsed.savingsGoals || []));
      if (parsed.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
      }

      // Sync into IndexedDB
      if (this.db) {
        for (const t of parsed.transactions) await this.putItem('transactions', STORAGE_KEYS.TRANSACTIONS, t);
        for (const w of parsed.wallets) await this.putItem('wallets', STORAGE_KEYS.WALLETS, w);
        for (const c of parsed.categories) await this.putItem('categories', STORAGE_KEYS.CATEGORIES, c);
        for (const b of (parsed.budgets || [])) await this.putItem('budgets', STORAGE_KEYS.BUDGETS, b);
        for (const s of (parsed.savingsGoals || [])) await this.putItem('savingsGoals', STORAGE_KEYS.SAVINGS, s);
      }

      return true;
    } catch (e) {
      console.error('Import backup failed', e);
      return false;
    }
  }

  async exportTransactionsToCSV(): Promise<string> {
    const transactions = await this.getTransactions();
    const categories = await this.getCategories();
    const wallets = await this.getWallets();

    const catMap = new Map(categories.map((c) => [c.id, c.name]));
    const walMap = new Map(wallets.map((w) => [w.id, w.name]));

    const headers = ['ID', 'Tanggal', 'Waktu', 'Tipe', 'Kategori', 'Dompet', 'Tujuan Transfer', 'Nominal', 'Catatan'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      t.time,
      t.type === 'income' ? 'Pemasukan' : t.type === 'expense' ? 'Pengeluaran' : 'Transfer',
      catMap.get(t.categoryId) || t.categoryId,
      walMap.get(t.walletId) || t.walletId,
      t.toWalletId ? (walMap.get(t.toWalletId) || t.toWalletId) : '-',
      t.amount,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  async resetToDemoData(): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(DEFAULT_WALLETS));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(DEFAULT_BUDGETS));
    localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(DEFAULT_SAVINGS_GOALS));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_USER_SETTINGS));

    // Clear and write to IndexedDB
    if (this.db) {
      const clearStore = (name: string) => {
        try {
          const tx = this.db!.transaction(name, 'readwrite');
          tx.objectStore(name).clear();
        } catch {}
      };
      clearStore('transactions');
      clearStore('categories');
      clearStore('wallets');
      clearStore('budgets');
      clearStore('savingsGoals');

      for (const t of DEFAULT_TRANSACTIONS) await this.putItem('transactions', STORAGE_KEYS.TRANSACTIONS, t);
      for (const w of DEFAULT_WALLETS) await this.putItem('wallets', STORAGE_KEYS.WALLETS, w);
      for (const c of DEFAULT_CATEGORIES) await this.putItem('categories', STORAGE_KEYS.CATEGORIES, c);
      for (const b of DEFAULT_BUDGETS) await this.putItem('budgets', STORAGE_KEYS.BUDGETS, b);
      for (const s of DEFAULT_SAVINGS_GOALS) await this.putItem('savingsGoals', STORAGE_KEYS.SAVINGS, s);
    }
  }
}

export const dbService = new StorageService();
