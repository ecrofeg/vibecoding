import { format, startOfMonth, endOfMonth, differenceInDays } from 'date-fns'
import type { Budget, Transaction } from '../../../shared/types'

export type BudgetStatus = {
  categoryId: string
  period: string
  limit: number
  spent: number
  remaining: number
  forecast: number
  isOverspent: boolean
  willOverspend: boolean
  daysRemaining: number
  daysInMonth: number
}

export const calculateBudgetStatus = (
  budget: Budget,
  transactions: Transaction[],
  currentDate: Date = new Date()
): BudgetStatus => {
  const [year, month] = budget.period.split('-').map(Number)
  const periodStart = startOfMonth(new Date(year, month - 1))
  const periodEnd = endOfMonth(periodStart)
  const now = currentDate > periodEnd ? periodEnd : currentDate

  const categoryTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date)
    return (
      tx.categoryId === budget.categoryId &&
      !tx.isTransfer &&
      tx.txType === 'expense' &&
      txDate >= periodStart &&
      txDate <= periodEnd
    )
  })

  const spent = Math.abs(
    categoryTransactions.reduce((sum, tx) => sum + tx.amount, 0)
  )

  const remaining = budget.limitAmount - spent
  const isOverspent = remaining < 0

  const daysInMonth = differenceInDays(periodEnd, periodStart) + 1
  const daysPassed = differenceInDays(now, periodStart) + 1
  const daysRemaining = Math.max(0, differenceInDays(periodEnd, now))

  let forecast = 0
  if (daysPassed > 0 && daysRemaining > 0) {
    const dailyAverage = spent / daysPassed
    forecast = spent + dailyAverage * daysRemaining
  } else {
    forecast = spent
  }

  const willOverspend = forecast > budget.limitAmount

  return {
    categoryId: budget.categoryId,
    period: budget.period,
    limit: budget.limitAmount,
    spent,
    remaining,
    forecast,
    isOverspent,
    willOverspend,
    daysRemaining,
    daysInMonth,
  }
}

export const getCurrentPeriod = (date: Date = new Date()): string => {
  return format(date, 'yyyy-MM')
}

export const getSpendingRate = (status: BudgetStatus): number => {
  if (status.limit === 0) return 0
  return status.spent / status.limit
}

export const getDailyBudgetRemaining = (status: BudgetStatus): number => {
  if (status.daysRemaining === 0) return 0
  return status.remaining / status.daysRemaining
}
