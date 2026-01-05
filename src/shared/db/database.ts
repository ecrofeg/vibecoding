import Dexie, { Table } from 'dexie'
import type { Transaction, Rule, Budget, Setting } from '@/shared/types'

class BudgetDatabase extends Dexie {
  transactions!: Table<Transaction>
  rules!: Table<Rule>
  budgets!: Table<Budget>
  settings!: Table<Setting>

  constructor() {
    super('budget-tracker')
    this.version(1).stores({
      transactions: 'id, sourceId, date, merchantNorm, categoryId, isTransfer',
      rules: 'id, priority, merchantNorm',
      budgets: 'id, [period+categoryId]',
      settings: 'key',
    })
  }
}

export const db = new BudgetDatabase()
