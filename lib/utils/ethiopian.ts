/**
 * Ethiopian-specific utility functions
 */

// Ethiopian regions
export const ETHIOPIAN_REGIONS = [
  'Addis Ababa',
  'Afar',
  'Amhara',
  'Benishangul-Gumuz',
  'Dire Dawa',
  'Gambela',
  'Harari',
  'Oromia',
  'Sidama',
  'SNNPR',
  'Somali',
  'Tigray',
] as const;

export type EthiopianRegion = typeof ETHIOPIAN_REGIONS[number];

// Supported languages
export const SUPPORTED_LANGUAGES = ['en', 'am'] as const;
export type Language = typeof SUPPORTED_LANGUAGES[number];

/**
 * Get current Ethiopian time
 */
export const getEthiopianTime = () => {
  return new Date().toLocaleString('en-US', {
    timeZone: 'Africa/Addis_Ababa',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

/**
 * Format currency in Ethiopian Birr
 */
export const formatETB = (amount: number) => {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Get language label
 */
export const getLanguageLabel = (lang: Language) => {
  const labels = {
    en: 'English',
    am: 'አማርኛ'
  };
  return labels[lang];
};

/**
 * Validate Ethiopian phone number
 */
export const isValidEthiopianPhone = (phone: string): boolean => {
  // Ethiopian phone number format: +251XXXXXXXXX or 0XXXXXXXXX
  const phoneRegex = /^(\+251|0)[79]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

/**
 * Format Ethiopian phone number
 */
export const formatEthiopianPhone = (phone: string): string => {
  const cleaned = phone.replace(/\s+/g, '');
  
  if (cleaned.startsWith('+251')) {
    return cleaned.replace(/(\+251)(\d{1})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4 $5');
  } else if (cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{1})(\d{1})(\d{3})(\d{3})(\d{3})/, '$1$2 $3 $4 $5');
  }
  
  return phone;
};

/**
 * Get Ethiopian business hours
 */
export const getEthiopianBusinessHours = () => {
  const now = new Date();
  const ethiopianTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Addis_Ababa' }));
  const hour = ethiopianTime.getHours();
  
  // Business hours: 8 AM to 6 PM Ethiopian time
  return {
    isBusinessHours: hour >= 8 && hour < 18,
    nextBusinessHour: hour < 8 ? 8 : hour >= 18 ? 8 : null,
  };
};

/**
 * Ethiopian holidays (simplified list)
 */
export const ETHIOPIAN_HOLIDAYS = [
  { name: 'Ethiopian New Year', date: '09-11' }, // September 11
  { name: 'Meskel', date: '09-27' }, // September 27
  { name: 'Ethiopian Christmas', date: '01-07' }, // January 7
  { name: 'Ethiopian Epiphany', date: '01-19' }, // January 19
] as const;

/**
 * Check if today is an Ethiopian holiday
 */
export const isEthiopianHoliday = (): boolean => {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Addis_Ababa' });
  const monthDay = today.substring(5); // Get MM-DD format
  
  return ETHIOPIAN_HOLIDAYS.some(holiday => holiday.date === monthDay);
};