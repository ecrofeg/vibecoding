import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core'

export const cards = sqliteTable('cards', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'debit' | 'credit'
  color: text('color').notNull(),
})

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  cardId: text('card_id').notNull().references(() => cards.id, { onDelete: 'cascade' }),
  documentId: text('document_id').notNull(),
  date: text('date').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  amount: real('amount').notNull(),
  type: text('type').notNull(), // 'expense' | 'transfer' | 'refund'
  category: text('category').notNull(),
  linkedTransactionId: text('linked_transaction_id'),
})

export const savingsAccounts = sqliteTable('savings_accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  amount: real('amount').notNull(),
  annualInterestRate: real('annual_interest_rate').notNull(),
})

export const recurringExpenses = sqliteTable('recurring_expenses', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  amount: real('amount').notNull(),
  period: text('period').notNull(), // 'weekly' | 'monthly' | 'monthly_on_day'
  dayOfMonth: integer('day_of_month'),
  dayOfWeek: integer('day_of_week'),
  sourceType: text('source_type').notNull(), // 'card' | 'savings'
  savingsAccountId: text('savings_account_id').references(() => savingsAccounts.id, { onDelete: 'set null' }),
})

export const recurringIncome = sqliteTable('recurring_income', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  amount: real('amount').notNull(),
  period: text('period').notNull(), // 'weekly' | 'monthly' | 'monthly_on_day'
  dayOfMonth: integer('day_of_month'),
  dayOfWeek: integer('day_of_week'),
  destinationType: text('destination_type').notNull(), // 'card' | 'savings'
  savingsAccountId: text('savings_account_id').references(() => savingsAccounts.id, { onDelete: 'set null' }),
})

export const plannedExpenses = sqliteTable('planned_expenses', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  amount: real('amount').notNull(),
  date: text('date').notNull(),
  sourceType: text('source_type').notNull(), // 'card' | 'savings'
  savingsAccountId: text('savings_account_id').references(() => savingsAccounts.id, { onDelete: 'set null' }),
})

export const appSettings = sqliteTable('app_settings', {
  id: text('id').primaryKey(),
  currentBalance: real('current_balance').notNull().default(0),
})
