import { atomWithStorage } from 'jotai/utils'
import type { BudgetData } from './types'

const defaultBudgetData: BudgetData = {
  currentBalance: 0,
  recurringExpenses: [],
  recurringIncome: [],
  savingsAccounts: [],
  plannedExpenses: [],
}

const storage = {
  getItem: (key: string): BudgetData => {
    try {
      const item = localStorage.getItem(key)
      if (!item) return defaultBudgetData
      
      const parsed = JSON.parse(item)
      
      // Преобразуем даты из строк обратно в Date объекты
      if (parsed.plannedExpenses && Array.isArray(parsed.plannedExpenses)) {
        parsed.plannedExpenses = parsed.plannedExpenses.map((expense: { date: string; source?: unknown; [key: string]: unknown }) => ({
          ...expense,
          date: new Date(expense.date),
          // Миграция: добавляем дефолтный source если его нет
          source: expense.source || { type: 'card' },
        }))
      }
      
      // Миграция: добавляем дефолтный source для recurringExpenses если его нет
      if (parsed.recurringExpenses && Array.isArray(parsed.recurringExpenses)) {
        parsed.recurringExpenses = parsed.recurringExpenses.map((expense: { source?: unknown; [key: string]: unknown }) => ({
          ...expense,
          source: expense.source || { type: 'card' },
        }))
      }
      
      return {
        ...defaultBudgetData,
        ...parsed,
      }
    } catch {
      return defaultBudgetData
    }
  },
  setItem: (key: string, value: BudgetData): void => {
    // Преобразуем Date объекты в строки для хранения
    const toStore = {
      ...value,
      plannedExpenses: value.plannedExpenses.map(expense => ({
        ...expense,
        date: expense.date.toISOString(),
      })),
    }
    localStorage.setItem(key, JSON.stringify(toStore))
  },
  removeItem: (key: string): void => {
    localStorage.removeItem(key)
  },
}

export const budgetAtom = atomWithStorage<BudgetData>(
  'money-manager-budget',
  defaultBudgetData,
  storage
)

