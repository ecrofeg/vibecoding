export type TransactionType = 'expense' | 'transfer' | 'refund'

export type TransactionCategory =
  | 'food_home'
  | 'food_out'
  | 'delivery'
  | 'coffee_snacks'
  | 'transport'
  | 'taxi'
  | 'shopping'
  | 'subscriptions'
  | 'health'
  | 'other'

export type CardType = 'debit' | 'credit'

export type RecurrencePeriod = 'weekly' | 'monthly' | 'monthly_on_day'

export type SourceDestinationType = 'card' | 'savings'
