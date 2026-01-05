import { format, parseISO, isToday, isYesterday, type Locale } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'

const localeMap: Record<string, Locale> = {
  ru,
  en: enUS,
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))
}

export const formatDate = (
  date: Date | string,
  locale: string = 'ru',
  getRelativeLabel?: (key: 'today' | 'yesterday') => string
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!dateObj || isNaN(dateObj.getTime())) {
      return 'Invalid Date'
    }

    if (getRelativeLabel) {
      if (isToday(dateObj)) {
        return getRelativeLabel('today')
      }
      if (isYesterday(dateObj)) {
        return getRelativeLabel('yesterday')
      }
    }

    const dateLocale = localeMap[locale] || localeMap.ru
    return format(dateObj, 'd MMMM', { locale: dateLocale })
  } catch {
    return 'Invalid Date'
  }
}

export const formatDateShort = (date: Date | string, locale: string = 'ru'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!dateObj || isNaN(dateObj.getTime())) {
      return 'Invalid Date'
    }
    const dateLocale = localeMap[locale] || localeMap.ru
    return format(dateObj, 'MMM yyyy', { locale: dateLocale })
  } catch {
    return 'Invalid Date'
  }
}

