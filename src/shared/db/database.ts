import Dexie, { type EntityTable } from 'dexie'
import type { Transaction, Rule, Budget, Setting } from '../types'

class BudgetDatabase extends Dexie {
  transactions!: EntityTable<Transaction, 'id'>
  rules!: EntityTable<Rule, 'id'>
  budgets!: EntityTable<Budget, 'id'>
  settings!: EntityTable<Setting, 'key'>

  constructor() {
    super('budget-tracker')
    
    this.version(1).stores({
      transactions: 'id, sourceId, date, merchantNorm, categoryId, isTransfer, bankId',
      rules: 'id, priority, merchantNorm, categoryId',
      budgets: 'id, [period+categoryId], categoryId',
      settings: 'key'
    })
  }
}

export const db = new BudgetDatabase()
