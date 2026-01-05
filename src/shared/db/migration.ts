import { v4 as uuidv4 } from 'uuid'
import { db } from './database'
import type { Transaction } from '../types'

type LegacyTransaction = {
  id: string
  documentId: string
  date: string | Date
  name: string
  description: string
  amount: number
}

const normalizeMerchantName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\u0400-\u04FF-]/g, '')
    .slice(0, 100)
}

const transformLegacyTransaction = (legacy: LegacyTransaction): Transaction => {
  const date = typeof legacy.date === 'string' ? new Date(legacy.date) : legacy.date
  const merchantRaw = legacy.name || 'Unknown'
  
  return {
    id: legacy.id || uuidv4(),
    sourceId: legacy.documentId || legacy.id || uuidv4(),
    source: 'csv',
    bankId: 'unknown',
    accountId: null,
    cardLast4: null,
    date,
    postedDate: null,
    amount: legacy.amount,
    currency: 'RUB',
    descriptionRaw: legacy.description || '',
    merchantRaw,
    merchantNorm: normalizeMerchantName(merchantRaw),
    categoryId: null,
    needType: 'unknown',
    txType: legacy.amount < 0 ? 'expense' : 'income',
    isTransfer: false,
    isRecurring: false,
    notes: null,
    categorySource: null,
    categoryConfidence: null,
    normalizationConfidence: null,
  }
}

export const migrateFromLocalStorage = async (): Promise<number> => {
  const existingCount = await db.transactions.count()
  if (existingCount > 0) {
    console.log('Database already has transactions, skipping migration')
    return 0
  }

  const legacyData = localStorage.getItem('money-manager-transactions')
  if (!legacyData) {
    console.log('No legacy data found in localStorage')
    return 0
  }

  try {
    const parsed = JSON.parse(legacyData)
    const legacyTransactions: LegacyTransaction[] = Array.isArray(parsed) ? parsed : []

    if (legacyTransactions.length === 0) {
      console.log('No transactions to migrate')
      return 0
    }

    const newTransactions = legacyTransactions.map(transformLegacyTransaction)
    await db.transactions.bulkAdd(newTransactions)

    console.log(`Migrated ${newTransactions.length} transactions from localStorage to IndexedDB`)
    
    return newTransactions.length
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

export const clearLegacyStorage = (): void => {
  localStorage.removeItem('money-manager-transactions')
  console.log('Cleared legacy localStorage data')
}
