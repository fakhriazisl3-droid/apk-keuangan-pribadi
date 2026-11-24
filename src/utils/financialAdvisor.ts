import { Transaction, Budget, FinancialHealth } from '../types/finance';

export const calculateFinancialHealth = (
  transactions: Transaction[],
  budgets: Budget[],
  totalBalance: number
): FinancialHealth => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const remainingDays = Math.max(1, daysInMonth - currentDay);

  // Filter current month transactions
  const monthTxs = transactions.filter((t) => t.date.startsWith(currentMonth));
  const totalIncome = monthTxs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = monthTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // 1. Savings Rate Score (0 - 40 points)
  // Ideal: savings rate >= 20%
  let savingsRate = 0;
  let savingsScore = 20;
  if (totalIncome > 0) {
    savingsRate = Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100);
    if (savingsRate >= 40) savingsScore = 40;
    else if (savingsRate >= 20) savingsScore = 32;
    else if (savingsRate >= 10) savingsScore = 22;
    else if (savingsRate > 0) savingsScore = 15;
    else savingsScore = 5;
  }

  // 2. Budget Adherence Score (0 - 35 points)
  let budgetScore = 35;
  let overBudgetCount = 0;
  if (budgets.length > 0) {
    const expenseByCat = new Map<string, number>();
    monthTxs
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        expenseByCat.set(t.categoryId, (expenseByCat.get(t.categoryId) || 0) + t.amount);
      });

    budgets.forEach((b) => {
      const spent = expenseByCat.get(b.categoryId) || 0;
      if (spent > b.limitAmount) {
        overBudgetCount++;
      }
    });

    budgetScore = Math.max(0, 35 - overBudgetCount * 12);
  }

  // 3. Emergency & Liquidity Buffer Score (0 - 25 points)
  // Checks if total balance can cover 1 - 3 months of average expenses
  const dailyBurn = currentDay > 0 ? totalExpense / currentDay : 0;
  const estimatedMonthlyExpense = Math.max(dailyBurn * 30, totalExpense, 1);
  const monthsOfRunway = totalBalance / estimatedMonthlyExpense;

  let bufferScore = 10;
  if (monthsOfRunway >= 6) bufferScore = 25;
  else if (monthsOfRunway >= 3) bufferScore = 20;
  else if (monthsOfRunway >= 1) bufferScore = 15;
  else if (monthsOfRunway >= 0.5) bufferScore = 8;
  else bufferScore = 3;

  const totalScore = Math.min(100, Math.round(savingsScore + budgetScore + bufferScore));

  let grade: FinancialHealth['grade'] = 'Baik';
  let color = '#3b82f6';
  let summary = 'Kondisi finansial Anda stabil dan terkendali.';

  if (totalScore >= 85) {
    grade = 'Sangat Baik';
    color = '#10b981';
    summary = 'Luar biasa! Pengelolaan arus kas dan tabungan Anda sangat sehat dan disiplin.';
  } else if (totalScore >= 65) {
    grade = 'Baik';
    color = '#3b82f6';
    summary = 'Kondisi keuangan tergolong stabil, namun ada pos anggaran yang perlu dipantau.';
  } else if (totalScore >= 45) {
    grade = 'Perlu Waspada';
    color = '#f59e0b';
    summary = 'Hati-hati, rasio pengeluaran Anda cukup tinggi dibanding pemasukan bulan ini.';
  } else {
    grade = 'Kritis';
    color = '#ef4444';
    summary = 'Peringatan: Pengeluaran melebihi batas atau saldo darurat menipis!';
  }

  // Recommendations
  const recommendations: string[] = [];
  if (overBudgetCount > 0) {
    recommendations.push(`Ada ${overBudgetCount} kategori yang melebihi batas anggaran bulan ini. Batasi belanja non-primer.`);
  }
  if (savingsRate < 20 && totalIncome > 0) {
    recommendations.push('Tingkatkan rasio tabungan minimal 20% dari gaji begitu uang masuk (metode Pay Yourself First).');
  } else if (savingsRate >= 30) {
    recommendations.push('Rasio tabungan Anda sangat bagus! Pertimbangkan menambah alokasi instrumen investasi.');
  }
  if (monthsOfRunway < 3) {
    recommendations.push(`Cadangan dana Anda saat ini mencukupi ~${monthsOfRunway.toFixed(1)} bulan pengeluaran. Prioritaskan target Dana Darurat.`);
  }
  if (dailyBurn > 0 && dailyBurn * remainingDays > totalBalance) {
    recommendations.push('Perkiraan rata-rata pengeluaran harian berisiko mengikis saldo sebelum akhir bulan.');
  } else {
    recommendations.push(`Dengan rata-rata belanja Rp ${Math.round(dailyBurn).toLocaleString('id-ID')}/hari, keuangan Anda aman hingga akhir bulan.`);
  }

  return {
    score: totalScore,
    grade,
    color,
    summary,
    recommendations,
    savingsRate: Math.round(savingsRate),
    burnRatePerDay: Math.round(dailyBurn),
    forecastRemainingDays: remainingDays,
  };
};
