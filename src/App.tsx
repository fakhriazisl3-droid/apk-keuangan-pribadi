import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Transaction,
  Category,
  Wallet,
  Budget,
  SavingsGoal,
  UserSettings,
  TransactionType,
} from './types/finance';
import { dbService } from './db/storage';
import { calculateFinancialHealth } from './utils/financialAdvisor';
import { getCurrentMonthString } from './db/defaultData';

// Common Components
import { MobileShell } from './components/common/MobileShell';
import { TopHeader } from './components/navigation/TopHeader';
import { BottomNav, ActiveTab } from './components/navigation/BottomNav';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { CelebrationModal } from './components/common/CelebrationModal';
import { PinLockModal } from './components/common/PinLockModal';

// Dashboard Components
import { WalletCardSlider } from './components/dashboard/WalletCardSlider';
import { FinancialSummaryCard } from './components/dashboard/FinancialSummaryCard';
import { QuickActions } from './components/dashboard/QuickActions';
import { AiInsightBanner } from './components/dashboard/AiInsightBanner';
import { RecentTransactions } from './components/dashboard/RecentTransactions';
import { AiAdvisorModal } from './components/dashboard/AiAdvisorModal';

// Feature Views & Modals
import { TransactionListView } from './components/transactions/TransactionListView';
import { TransactionModal } from './components/transactions/TransactionModal';
import { TransactionDetailModal } from './components/transactions/TransactionDetailModal';
import { BudgetView } from './components/budgets/BudgetView';
import { BudgetModal } from './components/budgets/BudgetModal';
import { SavingsView } from './components/savings/SavingsView';
import { SavingsGoalModal } from './components/savings/SavingsGoalModal';
import { SavingsDepositModal } from './components/savings/SavingsDepositModal';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { TransferModal } from './components/wallets/TransferModal';
import { WalletModal } from './components/wallets/WalletModal';
import { ReceiptScannerModal } from './components/scanner/ReceiptScannerModal';

export function App() {
  // Data States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    userName: 'Guspian',
    avatarUrl: '',
    coverBgUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80',
    currency: 'IDR',
    currencySymbol: 'Rp',
    pinEnabled: false,
    pinCode: '123456',
    hideBalance: false,
    theme: 'dark',
  });

  // UI Navigation States
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const initialLockChecked = useRef(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [txDefaultType, setTxDefaultType] = useState<TransactionType>('expense');
  const [isTxDetailOpen, setIsTxDetailOpen] = useState(false);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);

  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);
  const [celebrationGoal, setCelebrationGoal] = useState<{ title: string; amount: number } | null>(null);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Toast Helpers
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success', subtitle?: string) => {
    const id = 'toast-' + Date.now();
    setToasts((prev) => [...prev, { id, message, type, subtitle }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load All Data from DB
  const loadData = useCallback(async () => {
    try {
      const [txs, cats, wals, bdgs, svgs, sets] = await Promise.all([
        dbService.getTransactions(),
        dbService.getCategories(),
        dbService.getWallets(),
        dbService.getBudgets(),
        dbService.getSavingsGoals(),
        dbService.getSettings(),
      ]);

      setTransactions(txs);
      setCategories(cats);
      setWallets(wals);
      setBudgets(bdgs);
      setSavingsGoals(svgs);
      setSettings(sets);

      // Only lock on initial application launch, NOT on subsequent data/settings updates!
      if (!initialLockChecked.current) {
        initialLockChecked.current = true;
        if (sets.pinEnabled) {
          setIsUnlocked(false);
        }
      }
    } catch (err) {
      console.error('Error loading data', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived Calculations
  const currentMonth = getCurrentMonthString();
  const currentMonthTxs = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(currentMonth));
  }, [transactions, currentMonth]);

  const incomeThisMonth = useMemo(() => {
    return currentMonthTxs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTxs]);

  const expenseThisMonth = useMemo(() => {
    return currentMonthTxs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTxs]);

  const totalBalance = useMemo(() => {
    return wallets.reduce((sum, w) => sum + w.balance, 0);
  }, [wallets]);

  const financialHealth = useMemo(() => {
    return calculateFinancialHealth(transactions, budgets, totalBalance);
  }, [transactions, budgets, totalBalance]);

  // Handlers: Transactions
  const handleOpenAddTx = (type: TransactionType = 'expense') => {
    setSelectedTx(null);
    setTxDefaultType(type);
    setIsTxModalOpen(true);
  };

  const handleSaveTx = async (tx: Transaction) => {
    await dbService.saveTransaction(tx);
    await loadData();
    showToast(
      'Transaksi Berhasil Disimpan',
      'success',
      `${tx.type === 'income' ? 'Pemasukan' : tx.type === 'expense' ? 'Pengeluaran' : 'Transfer'} telah dicatat ke database`
    );
  };

  const handleDeleteTx = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Transaksi?',
      message: 'Apakah Anda yakin ingin menghapus transaksi ini? Saldo rekening akan disesuaikan kembali.',
      isDanger: true,
      onConfirm: async () => {
        await dbService.deleteTransaction(id);
        await loadData();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        setIsTxDetailOpen(false);
        showToast('Transaksi Berhasil Dihapus', 'info');
      },
    });
  };

  // Handlers: Budgets
  const handleSaveBudget = async (budget: Budget) => {
    await dbService.saveBudget(budget);
    await loadData();
    showToast('Anggaran Berhasil Diperbarui', 'success');
  };

  const handleDeleteBudget = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Pos Anggaran?',
      message: 'Anggaran untuk kategori ini akan dihapus dari bulan berjalan.',
      isDanger: true,
      onConfirm: async () => {
        await dbService.deleteBudget(id);
        await loadData();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('Anggaran Berhasil Dihapus', 'info');
      },
    });
  };

  // Handlers: Savings Goals
  const handleSaveGoal = async (goal: SavingsGoal) => {
    await dbService.saveSavingsGoal(goal);
    await loadData();
    showToast('Target Tabungan Disimpan', 'success', goal.title);
  };

  const handleDeleteGoal = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Target Tabungan?',
      message: 'Target impian ini akan dihapus dari daftar.',
      isDanger: true,
      onConfirm: async () => {
        await dbService.deleteSavingsGoal(id);
        await loadData();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('Target Dihapus', 'info');
      },
    });
  };

  const handleDepositConfirm = async (goalId: string, amount: number, walletId: string) => {
    const updated = await dbService.depositToGoal(goalId, amount, walletId);
    await loadData();

    if (amount > 0) {
      showToast('Setoran Tabungan Berhasil!', 'success');
      // If goal reached 100%, trigger celebration fireworks!
      if (updated && updated.currentAmount >= updated.targetAmount) {
        setCelebrationGoal({ title: updated.title, amount: updated.targetAmount });
      }
    } else {
      showToast('Penarikan Tabungan Berhasil', 'info');
    }
  };

  // Handlers: Wallets & Transfer
  const handleTransferConfirm = async (
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    note?: string
  ) => {
    await dbService.executeTransfer(fromWalletId, toWalletId, amount, note);
    await loadData();
    showToast('Transfer Antar Rekening Sukses!', 'success');
  };

  const handleSaveWallet = async (wallet: Wallet) => {
    await dbService.saveWallet(wallet);
    await loadData();
    showToast('Rekening / Dompet Berhasil Disimpan', 'success', wallet.name);
  };

  const handleDeleteWallet = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Rekening?',
      message: 'Apakah Anda yakin ingin menghapus akun/rekening ini?',
      isDanger: true,
      onConfirm: async () => {
        await dbService.deleteWallet(id);
        await loadData();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('Rekening Dihapus', 'info');
      },
    });
  };

  // Handlers: Settings & Data Backup
  const handleUpdateSettings = async (newSettings: UserSettings) => {
    setSettings(newSettings);
    await dbService.saveSettings(newSettings);
    showToast('Pengaturan Berhasil Disimpan', 'success');
  };

  const handleToggleHideBalance = async () => {
    const updated = { ...settings, hideBalance: !settings.hideBalance };
    setSettings(updated);
    await dbService.saveSettings(updated);
  };

  const handleExportJSON = async () => {
    const jsonStr = await dbService.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_keuangan_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File Cadangan Berhasil Diunduh', 'success');
  };

  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (content) {
        const success = await dbService.importAllDataJSON(content);
        if (success) {
          await loadData();
          showToast('Data Berhasil Dipulihkan dari Cadangan', 'success');
        } else {
          showToast('Gagal memulihkan file cadangan', 'error', 'Periksa format file JSON');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = async () => {
    const csvContent = await dbService.exportTransactionsToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaksi_keuangan_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Riwayat CSV Berhasil Diunduh', 'success');
  };

  const handleResetData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Muat Ulang Contoh Data Demo?',
      message: 'Seluruh data saat ini akan digantikan dengan data contoh realistis.',
      isDanger: false,
      onConfirm: async () => {
        await dbService.resetToDemoData();
        await loadData();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('Data Berhasil Direset ke Demo', 'info');
      },
    });
  };

  const handleClearAllData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Kosongkan Semua Dana & Transaksi?',
      message: 'Seluruh riwayat transaksi dan saldo rekening akan dikosongkan (Rp 0) agar Anda dapat mengisinya sendiri dari awal.',
      isDanger: true,
      onConfirm: async () => {
        await dbService.resetToZeroData();
        await loadData();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('Semua Dana & Transaksi Dikosongkan', 'success', 'Siap untuk Anda catat dari nol!');
      },
    });
  };

  return (
    <MobileShell>
      {/* Toast Popups */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* PIN Security Lock Modal */}
      {settings.pinEnabled && !isUnlocked && (
        <PinLockModal
          isOpen={!isUnlocked}
          correctPin={settings.pinCode || '123456'}
          userName={settings.userName}
          onSuccess={() => setIsUnlocked(true)}
          onResetPin={async () => {
            const updated = { ...settings, pinCode: '123456' };
            setSettings(updated);
            await dbService.saveSettings(updated);
            setIsUnlocked(true);
            showToast('PIN Berhasil Direset ke 123456', 'success', 'Silakan ganti PIN baru di Pengaturan jika diinginkan');
          }}
        />
      )}

      {/* Confirmation Dialog Popup */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDanger={confirmDialog.isDanger}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Celebratory Target Achieved Confetti Popup */}
      {celebrationGoal && (
        <CelebrationModal
          isOpen={!!celebrationGoal}
          onClose={() => setCelebrationGoal(null)}
          goalTitle={celebrationGoal.title}
          targetAmount={celebrationGoal.amount}
        />
      )}

      {/* Smart AI Financial Advisor Modal */}
      <AiAdvisorModal
        isOpen={isAiAdvisorOpen}
        onClose={() => setIsAiAdvisorOpen(false)}
        health={financialHealth}
      />

      {/* Top Header App Bar */}
      <TopHeader
        settings={settings}
        healthScore={financialHealth.score}
        onToggleHideBalance={handleToggleHideBalance}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAiInsights={() => setIsAiAdvisorOpen(true)}
      />

      {/* Main Tab Content */}
      <div className="flex-1">
        {isSettingsOpen ? (
          <SettingsView
            settings={settings}
            wallets={wallets}
            categories={categories}
            onUpdateSettings={handleUpdateSettings}
            onOpenAddWallet={() => {
              setSelectedWallet(null);
              setIsWalletModalOpen(true);
            }}
            onEditWallet={(w) => {
              setSelectedWallet(w);
              setIsWalletModalOpen(true);
            }}
            onDeleteWallet={handleDeleteWallet}
            onExportJSON={handleExportJSON}
            onImportJSON={handleImportJSON}
            onExportCSV={handleExportCSV}
            onResetData={handleResetData}
            onClearAllData={handleClearAllData}
            onLockNow={() => {
              setIsSettingsOpen(false);
              setIsUnlocked(false);
            }}
            onClose={() => setIsSettingsOpen(false)}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="flex flex-col">
                <WalletCardSlider
                  wallets={wallets}
                  hideBalance={settings.hideBalance}
                  onOpenTransfer={() => setIsTransferModalOpen(true)}
                  onOpenAddWallet={() => {
                    setSelectedWallet(null);
                    setIsWalletModalOpen(true);
                  }}
                  onEditWallet={(w) => {
                    setSelectedWallet(w);
                    setIsWalletModalOpen(true);
                  }}
                />

                <FinancialSummaryCard
                  incomeThisMonth={incomeThisMonth}
                  expenseThisMonth={expenseThisMonth}
                  hideBalance={settings.hideBalance}
                />

                <QuickActions
                  onOpenAddIncome={() => handleOpenAddTx('income')}
                  onOpenAddExpense={() => handleOpenAddTx('expense')}
                  onOpenTransfer={() => setIsTransferModalOpen(true)}
                  onOpenSavings={() => setActiveTab('savings')}
                  onOpenReports={() => setActiveTab('reports')}
                  onOpenScanner={() => setIsScannerModalOpen(true)}
                />

                <AiInsightBanner
                  health={financialHealth}
                  onOpenAdvisorModal={() => setIsAiAdvisorOpen(true)}
                />

                <RecentTransactions
                  transactions={transactions}
                  categories={categories}
                  wallets={wallets}
                  hideBalance={settings.hideBalance}
                  onSelectTransaction={(tx) => {
                    setSelectedTx(tx);
                    setIsTxDetailOpen(true);
                  }}
                  onViewAll={() => setActiveTab('transactions')}
                />
              </div>
            )}

            {activeTab === 'transactions' && (
              <TransactionListView
                transactions={transactions}
                categories={categories}
                wallets={wallets}
                hideBalance={settings.hideBalance}
                onSelectTransaction={(tx) => {
                  setSelectedTx(tx);
                  setIsTxDetailOpen(true);
                }}
                onExportCSV={handleExportCSV}
              />
            )}

            {activeTab === 'budgets' && (
              <BudgetView
                budgets={budgets}
                categories={categories}
                transactions={transactions}
                hideBalance={settings.hideBalance}
                onOpenAddBudget={() => {
                  setSelectedBudget(null);
                  setIsBudgetModalOpen(true);
                }}
                onEditBudget={(b) => {
                  setSelectedBudget(b);
                  setIsBudgetModalOpen(true);
                }}
                onDeleteBudget={handleDeleteBudget}
              />
            )}

            {activeTab === 'savings' && (
              <SavingsView
                goals={savingsGoals}
                wallets={wallets}
                hideBalance={settings.hideBalance}
                onOpenAddGoal={() => {
                  setSelectedGoal(null);
                  setIsSavingsModalOpen(true);
                }}
                onEditGoal={(g) => {
                  setSelectedGoal(g);
                  setIsSavingsModalOpen(true);
                }}
                onDeleteGoal={handleDeleteGoal}
                onOpenDeposit={(g) => {
                  setDepositGoal(g);
                  setIsDepositModalOpen(true);
                }}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                transactions={transactions}
                categories={categories}
                health={financialHealth}
                hideBalance={settings.hideBalance}
              />
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setIsSettingsOpen(false);
          setActiveTab(tab);
        }}
        onOpenAddModal={() => handleOpenAddTx('expense')}
      />

      {/* Transaction Modal Popup (Add / Edit) */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        categories={categories}
        wallets={wallets}
        onSave={handleSaveTx}
        initialTransaction={selectedTx}
        defaultType={txDefaultType}
        onOpenScanner={() => setIsScannerModalOpen(true)}
      />

      {/* AI Receipt & Transfer Screenshot Scanner Modal */}
      <ReceiptScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        categories={categories}
        wallets={wallets}
        onApplyTransaction={async (tx) => {
          await handleSaveTx(tx);
          showToast(
            'Struk / Bukti Berhasil Dicatat!',
            'success',
            `${tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'} Rp ${tx.amount.toLocaleString('id-ID')} tersimpan otomatis`
          );
        }}
        onOpenInFullForm={(tx) => {
          setSelectedTx(tx);
          setIsTxModalOpen(true);
        }}
      />

      {/* Transaction Detail Modal Popup */}
      <TransactionDetailModal
        isOpen={isTxDetailOpen}
        onClose={() => setIsTxDetailOpen(false)}
        transaction={selectedTx}
        categories={categories}
        wallets={wallets}
        onEdit={(tx) => {
          setSelectedTx(tx);
          setIsTxModalOpen(true);
        }}
        onDelete={handleDeleteTx}
      />

      {/* Budget Modal Popup */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        categories={categories}
        existingBudgets={budgets}
        selectedBudget={selectedBudget}
        onSave={handleSaveBudget}
      />

      {/* Savings Goal Modal Popup */}
      <SavingsGoalModal
        isOpen={isSavingsModalOpen}
        onClose={() => setIsSavingsModalOpen(false)}
        initialGoal={selectedGoal}
        onSave={handleSaveGoal}
      />

      {/* Savings Deposit / Withdraw Modal Popup */}
      <SavingsDepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        goal={depositGoal}
        wallets={wallets}
        onConfirm={handleDepositConfirm}
      />

      {/* Transfer Modal Popup */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        wallets={wallets}
        onConfirm={handleTransferConfirm}
      />

      {/* Wallet Management Modal Popup */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        initialWallet={selectedWallet}
        onSave={handleSaveWallet}
      />
    </MobileShell>
  );
}

export default App;
