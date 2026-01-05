import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import type { Transaction } from '../types'

export type LeaksInsight = {
  period: 'week' | 'month'
  count: number
  total: number
  topMerchants: Array<{ merchant: string; count: number; total: number }>
  threshold: number
}

export type TopMerchantsInsight = {
  period: 'week' | 'month'
  merchants: Array<{
    merchantNorm: string
    displayName: string
    total: number
    count: number
    categoryId: string | null
  }>
}

export const calculateLeaks = (
  transactions: Transaction[],
  period: 'week' | 'month',
  threshold: number = 800,
  currentDate: Date = new Date()
): LeaksInsight => {
  const periodStart = period === 'week' 
    ? startOfWeek(currentDate, { weekStartsOn: 1 })
    : startOfMonth(currentDate)
  const periodEnd = period === 'week' 
    ? endOfWeek(currentDate, { weekStartsOn: 1 })
    : endOfMonth(currentDate)

  const smallExpenses = transactions.filter(tx => {
    const txDate = new Date(tx.date)
    const amount = Math.abs(tx.amount)
    return (
      tx.txType === 'expense' &&
      !tx.isTransfer &&
      amount <= threshold &&
      amount > 0 &&
      txDate >= periodStart &&
      txDate <= periodEnd
    )
  })

  const total = smallExpenses.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

  const merchantTotals = new Map<string, { count: number; total: number }>()
  for (const tx of smallExpenses) {
    const existing = merchantTotals.get(tx.merchantNorm) || { count: 0, total: 0 }
    merchantTotals.set(tx.merchantNorm, {
      count: existing.count + 1,
      total: existing.total + Math.abs(tx.amount),
    })
  }

  const topMerchants = Array.from(merchantTotals.entries())
    .map(([merchant, data]) => ({ merchant, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  return {
    period,
    count: smallExpenses.length,
    total,
    topMerchants,
    threshold,
  }
}

export const calculateTopMerchants = (
  transactions: Transaction[],
  period: 'week' | 'month',
  limit: number = 10,
  currentDate: Date = new Date()
): TopMerchantsInsight => {
  const periodStart = period === 'week'
    ? startOfWeek(currentDate, { weekStartsOn: 1 })
    : startOfMonth(currentDate)
  const periodEnd = period === 'week'
    ? endOfWeek(currentDate, { weekStartsOn: 1 })
    : endOfMonth(currentDate)

  const expenses = transactions.filter(tx => {
    const txDate = new Date(tx.date)
    return (
      tx.txType === 'expense' &&
      !tx.isTransfer &&
      txDate >= periodStart &&
      txDate <= periodEnd
    )
  })

  const merchantTotals = new Map<string, {
    total: number
    count: number
    categoryId: string | null
  }>()

  for (const tx of expenses) {
    const existing = merchantTotals.get(tx.merchantNorm) || {
      total: 0,
      count: 0,
      categoryId: tx.categoryId,
    }
    merchantTotals.set(tx.merchantNorm, {
      total: existing.total + Math.abs(tx.amount),
      count: existing.count + 1,
      categoryId: tx.categoryId || existing.categoryId,
    })
  }

  const merchants = Array.from(merchantTotals.entries())
    .map(([merchantNorm, data]) => ({
      merchantNorm,
      displayName: merchantNorm,
      ...data,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)

  return {
    period,
    merchants,
  }
}

export const detectSpikes = (
  transactions: Transaction[],
  currentMonth: Date = new Date()
): Array<{ categoryId: string; currentTotal: number; previousTotal: number; percentageChange: number }> => {
  const currentStart = startOfMonth(currentMonth)
  const currentEnd = endOfMonth(currentMonth)
  
  const previousMonth = new Date(currentMonth)
  previousMonth.setMonth(previousMonth.getMonth() - 1)
  const previousStart = startOfMonth(previousMonth)
  const previousEnd = endOfMonth(previousMonth)

  const currentExpenses = transactions.filter(tx => {
    const txDate = new Date(tx.date)
    return (
      tx.txType === 'expense' &&
      !tx.isTransfer &&
      tx.categoryId &&
      txDate >= currentStart &&
      txDate <= currentEnd
    )
  })

  const previousExpenses = transactions.filter(tx => {
    const txDate = new Date(tx.date)
    return (
      tx.txType === 'expense' &&
      !tx.isTransfer &&
      tx.categoryId &&
      txDate >= previousStart &&
      txDate <= previousEnd
    )
  })

  const currentByCategory = new Map<string, number>()
  const previousByCategory = new Map<string, number>()

  for (const tx of currentExpenses) {
    const categoryId = tx.categoryId!
    currentByCategory.set(
      categoryId,
      (currentByCategory.get(categoryId) || 0) + Math.abs(tx.amount)
    )
  }

  for (const tx of previousExpenses) {
    const categoryId = tx.categoryId!
    previousByCategory.set(
      categoryId,
      (previousByCategory.get(categoryId) || 0) + Math.abs(tx.amount)
    )
  }

  const spikes: Array<{
    categoryId: string
    currentTotal: number
    previousTotal: number
    percentageChange: number
  }> = []

  for (const [categoryId, currentTotal] of currentByCategory.entries()) {
    const previousTotal = previousByCategory.get(categoryId) || 0
    if (previousTotal === 0) continue

    const percentageChange = ((currentTotal - previousTotal) / previousTotal) * 100
    const absoluteChange = currentTotal - previousTotal

    if (percentageChange > 25 && absoluteChange > 5000) {
      spikes.push({
        categoryId,
        currentTotal,
        previousTotal,
        percentageChange,
      })
    }
  }

  return spikes.sort((a, b) => b.percentageChange - a.percentageChange)
}
