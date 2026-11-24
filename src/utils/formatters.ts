export const formatCurrency = (amount: number, hideAmount = false): string => {
  if (hideAmount) return 'Rp ••••••••';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatCompactNumber = (amount: number): string => {
  if (amount >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + ' M';
  }
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1).replace(/\.0$/, '') + ' Jt';
  }
  if (amount >= 1_000) {
    return (amount / 1_000).toFixed(0) + ' Rb';
  }
  return amount.toString();
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const dateIso = dateStr.split('T')[0];
  const todayIso = today.toISOString().split('T')[0];
  const yesterdayIso = yesterday.toISOString().split('T')[0];

  if (dateIso === todayIso) return 'Hari Ini';
  if (dateIso === yesterdayIso) return 'Kemarin';

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export const formatFullDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export const formatMonthName = (yearMonth: string): string => {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const mIndex = parseInt(month, 10) - 1;
  return `${monthNames[mIndex] || month} ${year}`;
};

/**
 * Konversi angka rupiah ke kalimat terbilang Indonesia (Live Counter)
 * Contoh: 50000 -> "Lima Puluh Ribu Rupiah"
 */
export const numberToTerbilang = (amount: number): string => {
  if (isNaN(amount) || amount === 0) return 'Nol Rupiah';
  if (amount < 0) return 'Minus ' + numberToTerbilang(Math.abs(amount));

  const satuan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima',
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];

  const convertGroup = (n: number): string => {
    n = Math.floor(n);
    if (n < 12) return satuan[n];
    if (n < 20) return convertGroup(n - 10) + ' Belas';
    if (n < 100) return convertGroup(Math.floor(n / 10)) + ' Puluh ' + convertGroup(n % 10);
    if (n < 200) return 'Seratus ' + convertGroup(n - 100);
    if (n < 1000) return convertGroup(Math.floor(n / 100)) + ' Ratus ' + convertGroup(n % 100);
    if (n < 2000) return 'Seribu ' + convertGroup(n - 1000);
    if (n < 1000000) return convertGroup(Math.floor(n / 1000)) + ' Ribu ' + convertGroup(n % 1000);
    if (n < 1000000000) return convertGroup(Math.floor(n / 1000000)) + ' Juta ' + convertGroup(n % 1000000);
    if (n < 1000000000000) return convertGroup(Math.floor(n / 1000000000)) + ' Miliar ' + convertGroup(n % 1000000000);
    return convertGroup(Math.floor(n / 1000000000000)) + ' Triliun ' + convertGroup(n % 1000000000000);
  };

  const result = convertGroup(amount).replace(/\s+/g, ' ').trim();
  return (result ? result : 'Nol') + ' Rupiah';
};

