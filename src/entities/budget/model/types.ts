export type RecurrencePeriod = 'weekly' | 'monthly' | 'monthly_on_day'

export type IncomeDestination = 
  | { type: 'card' }
  | { type: 'savings'; savingsAccountId: string }

// Откуда списываются деньги для трат
export type ExpenseSource = 
  | { type: 'card' }
  | { type: 'savings'; savingsAccountId: string }

export type RecurringExpense = {
  id: string
  name: string
  amount: number
  period: RecurrencePeriod
  dayOfMonth?: number      // для 'monthly_on_day'
  dayOfWeek?: number       // для 'weekly' (0-6)
  source: ExpenseSource    // откуда списывается: карта или накопительный счет
}

export type RecurringIncome = {
  id: string
  name: string
  amount: number
  period: RecurrencePeriod
  dayOfMonth?: number      // для 'monthly_on_day'
  dayOfWeek?: number       // для 'weekly' (0-6)
  destination: IncomeDestination  // куда поступает: карта или накопительный счет
}

export type SavingsAccount = {
  id: string
  name: string
  amount: number
  annualInterestRate: number  // в процентах, например 10 для 10%
}

export type PlannedExpense = {
  id: string
  name: string
  amount: number
  date: Date
  source: ExpenseSource    // откуда списывается: карта или накопительный счет
}

export type BudgetData = {
  currentBalance: number
  recurringExpenses: RecurringExpense[]
  recurringIncome: RecurringIncome[]
  savingsAccounts: SavingsAccount[]
  plannedExpenses: PlannedExpense[]
}

export type ForecastHorizon = '1m' | '3m' | '6m' | '1y'

export type ForecastPoint = {
  date: Date
  cardBalance: number
  savingsBalance: number
  totalBalance: number
}

