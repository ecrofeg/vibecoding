import { api, endpoints } from '@/shared/api'
import type {
  RecurringExpense,
  RecurringIncome,
  SavingsAccount,
  PlannedExpense,
  RecurrencePeriod,
  ExpenseSource,
  IncomeDestination,
} from '../model/types'

export type SettingsResponse = {
  id: string
  currentBalance: number
}

export type SavingsAccountCreateRequest = {
  name: string
  amount: number
  annualInterestRate: number
}

export type RecurringExpenseCreateRequest = {
  name: string
  amount: number
  period: RecurrencePeriod
  dayOfMonth?: number
  dayOfWeek?: number
  sourceType: 'card' | 'savings'
  savingsAccountId?: string
}

export type RecurringIncomeCreateRequest = {
  name: string
  amount: number
  period: RecurrencePeriod
  dayOfMonth?: number
  dayOfWeek?: number
  destinationType: 'card' | 'savings'
  savingsAccountId?: string
}

export type PlannedExpenseCreateRequest = {
  name: string
  amount: number
  date: string
  sourceType: 'card' | 'savings'
  savingsAccountId?: string
}

export type ApiRecurringExpense = Omit<RecurringExpense, 'source'> & {
  source: ExpenseSource
}

export type ApiRecurringIncome = Omit<RecurringIncome, 'destination'> & {
  destination: IncomeDestination
}

export type ApiPlannedExpense = Omit<PlannedExpense, 'date' | 'source'> & {
  date: string
  source: ExpenseSource
}

export const budgetApi = {
  getSettings: () => api.get<SettingsResponse>(endpoints.settings),

  updateSettings: (data: { currentBalance: number }) =>
    api.put<SettingsResponse>(endpoints.settings, data),

  getSavingsAccounts: () =>
    api.get<SavingsAccount[]>(endpoints.savingsAccounts),

  createSavingsAccount: (data: SavingsAccountCreateRequest) =>
    api.post<SavingsAccount>(endpoints.savingsAccounts, data),

  updateSavingsAccount: (id: string, data: Partial<SavingsAccountCreateRequest>) =>
    api.put<SavingsAccount>(endpoints.savingsAccount(id), data),

  deleteSavingsAccount: (id: string) =>
    api.delete<{ success: boolean }>(endpoints.savingsAccount(id)),

  getRecurringExpenses: () =>
    api.get<ApiRecurringExpense[]>(endpoints.recurringExpenses),

  createRecurringExpense: (data: RecurringExpenseCreateRequest) =>
    api.post<ApiRecurringExpense>(endpoints.recurringExpenses, data),

  updateRecurringExpense: (id: string, data: Partial<RecurringExpenseCreateRequest>) =>
    api.put<ApiRecurringExpense>(endpoints.recurringExpense(id), data),

  deleteRecurringExpense: (id: string) =>
    api.delete<{ success: boolean }>(endpoints.recurringExpense(id)),

  getRecurringIncome: () =>
    api.get<ApiRecurringIncome[]>(endpoints.recurringIncome),

  createRecurringIncome: (data: RecurringIncomeCreateRequest) =>
    api.post<ApiRecurringIncome>(endpoints.recurringIncome, data),

  updateRecurringIncome: (id: string, data: Partial<RecurringIncomeCreateRequest>) =>
    api.put<ApiRecurringIncome>(endpoints.recurringIncomeItem(id), data),

  deleteRecurringIncome: (id: string) =>
    api.delete<{ success: boolean }>(endpoints.recurringIncomeItem(id)),

  getPlannedExpenses: () =>
    api.get<ApiPlannedExpense[]>(endpoints.plannedExpenses),

  createPlannedExpense: (data: PlannedExpenseCreateRequest) =>
    api.post<ApiPlannedExpense>(endpoints.plannedExpenses, data),

  updatePlannedExpense: (id: string, data: Partial<PlannedExpenseCreateRequest>) =>
    api.put<ApiPlannedExpense>(endpoints.plannedExpense(id), data),

  deletePlannedExpense: (id: string) =>
    api.delete<{ success: boolean }>(endpoints.plannedExpense(id)),
}
