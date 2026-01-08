import type { BudgetData, ForecastPoint, ForecastHorizon } from '@/entities/budget'
import { addDays, addMonths, isSameDay, getDay, getDate } from 'date-fns'

const getHorizonEndDate = (startDate: Date, horizon: ForecastHorizon): Date => {
  switch (horizon) {
    case '1m':
      return addMonths(startDate, 1)
    case '3m':
      return addMonths(startDate, 3)
    case '6m':
      return addMonths(startDate, 6)
    case '1y':
      return addMonths(startDate, 12)
  }
}

const shouldApplyRecurringItem = (
  item: { period: string; dayOfMonth?: number; dayOfWeek?: number },
  currentDate: Date
): boolean => {
  if (item.period === 'monthly') {
    // Применяем в первый день каждого месяца
    return getDate(currentDate) === 1
  }

  if (item.period === 'monthly_on_day' && item.dayOfMonth) {
    // Применяем в указанный день месяца
    return getDate(currentDate) === item.dayOfMonth
  }

  if (item.period === 'weekly' && item.dayOfWeek !== undefined) {
    // Применяем в указанный день недели
    return getDay(currentDate) === item.dayOfWeek
  }

  return false
}

export const calculateForecast = (
  budget: BudgetData,
  horizon: ForecastHorizon
): { points: ForecastPoint[]; totalIncome: number; totalExpenses: number } => {
  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)
  const endDate = getHorizonEndDate(startDate, horizon)
  
  const points: ForecastPoint[] = []
  let cardBalance = budget.currentBalance
  const savingsBalances: Record<string, number> = {}
  
  // Инициализируем балансы накопительных счетов
  for (const account of budget.savingsAccounts) {
    savingsBalances[account.id] = account.amount
  }

  let totalIncome = 0
  let totalExpenses = 0

  let currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    // Начисление процентов по накопительным счетам (ежедневно)
    for (const account of budget.savingsAccounts) {
      const balance = savingsBalances[account.id] || 0
      const dailyInterest = balance * (account.annualInterestRate / 100) / 365
      savingsBalances[account.id] = balance + dailyInterest
    }

    // Регулярные поступления
    for (const income of budget.recurringIncome) {
      if (shouldApplyRecurringItem(income, currentDate)) {
        totalIncome += income.amount
        
        if (income.destination.type === 'card') {
          cardBalance += income.amount
        } else {
          // Пополнение накопительного счета
          const accountId = income.destination.savingsAccountId
          savingsBalances[accountId] = (savingsBalances[accountId] || 0) + income.amount
        }
      }
    }

    // Регулярные траты
    for (const expense of budget.recurringExpenses) {
      if (shouldApplyRecurringItem(expense, currentDate)) {
        totalExpenses += expense.amount
        
        if (expense.source.type === 'card') {
          cardBalance -= expense.amount
        } else {
          // Списание с накопительного счета
          const accountId = expense.source.savingsAccountId
          savingsBalances[accountId] = (savingsBalances[accountId] || 0) - expense.amount
        }
      }
    }

    // Плановые расходы
    for (const plannedExpense of budget.plannedExpenses) {
      if (isSameDay(plannedExpense.date, currentDate)) {
        totalExpenses += plannedExpense.amount
        
        if (plannedExpense.source.type === 'card') {
          cardBalance -= plannedExpense.amount
        } else {
          // Списание с накопительного счета
          const accountId = plannedExpense.source.savingsAccountId
          savingsBalances[accountId] = (savingsBalances[accountId] || 0) - plannedExpense.amount
        }
      }
    }

    // Сохраняем точку прогноза
    const savingsBalance = Object.values(savingsBalances).reduce((sum, bal) => sum + bal, 0)
    const totalBalance = cardBalance + savingsBalance

    points.push({
      date: new Date(currentDate),
      cardBalance,
      savingsBalance,
      totalBalance,
    })

    // Переходим к следующему дню
    currentDate = addDays(currentDate, 1)
  }

  return { points, totalIncome, totalExpenses }
}

