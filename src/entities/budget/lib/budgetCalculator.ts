import type { Budget, Transaction } from '@/shared/types'

export type BudgetStatus = {
  categoryId: string
  period: string
  limit: number
  spent: number
  remaining: number
  forecast: number
  isOverspent: boolean
  willOverspend: boolean
}

const getPeriodStart = (period: string): Date => new Date(`${period}-01T00:00:00`)

export const calculateBudgetStatus = (
  budget: Budget,
  transactions: Transaction[],
  currentDate: Date,
): BudgetStatus => {
  const periodStart = getPeriodStart(budget.period)
  const periodEnd = new Date(periodStart)
  periodEnd.setMonth(periodEnd.getMonth() + 1)
  periodEnd.setDate(0)

  const filtered = transactions.filter(tx => {
    if (tx.categoryId !== budget.categoryId) {
      return false
    }
    return tx.date >= periodStart && tx.date <= periodEnd && tx.amount < 0
  })

  const spent = filtered.reduce((total, tx) => total + Math.abs(tx.amount), 0)
  const limit = budget.limitAmount
  const remaining = limit - spent

  const daysInPeriod = Math.max(1, periodEnd.getDate())
  const daysPassed = Math.min(daysInPeriod, Math.max(1, currentDate.getDate()))
  const avgPerDay = spent / daysPassed
  const forecast = avgPerDay * daysInPeriod

  return {
    categoryId: budget.categoryId,
    period: budget.period,
    limit,
    spent,
    remaining,
    forecast,
    isOverspent: spent > limit,
    willOverspend: forecast > limit,
  }
}
