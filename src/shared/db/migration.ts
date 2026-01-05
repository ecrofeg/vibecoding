import { db } from './database'
import { normalizeMerchant } from '@/entities/transaction/lib/merchantNormalizer'
import type { Transaction } from '@/shared/types'

type StoredLegacyTransaction = {
  id: string
  documentId?: string
  date: string
  name?: string
  description: string
  amount: number
}

const LEGACY_KEY = 'money-manager-transactions'

const parseLegacyRecord = (value: string): StoredLegacyTransaction[] => {
  const parsed = JSON.parse(value)
  if (Array.isArray(parsed)) {
    return parsed as StoredLegacyTransaction[]
  }
  if (typeof parsed === 'object' && parsed !== null) {
    return Object.values(parsed) as StoredLegacyTransaction[]
  }
  return []
}

const toTransaction = (legacy: StoredLegacyTransaction): Transaction | null => {
  const date = new Date(legacy.date)
  if (isNaN(date.getTime())) {
    return null
  }

  const description = legacy.description?.trim() || legacy.name?.trim() || 'Unknown'
  const merchantRaw = legacy.name?.trim() || description
  const merchantNorm = normalizeMerchant(merchantRaw)
  const amount = Number(legacy.amount)
  if (!Number.isFinite(amount)) {
    return null
  }

  const txType = amount >= 0 ? 'income' : 'expense'

  return {
    id: legacy.id,
    sourceId: legacy.documentId || legacy.id,
    source: 'legacy',
    bankId: 'unknown',
    accountId: null,
    cardLast4: null,
    date,
    postedDate: null,
    amount,
    currency: 'RUB',
    descriptionRaw: description,
    merchantRaw,
    merchantNorm,
    categoryId: null,
    needType: 'unknown',
    txType,
    isTransfer: false,
    isRecurring: false,
    notes: null,
    categorySource: null,
    categoryConfidence: null,
    normalizationConfidence: null,
  }
}

export const migrateLegacyTransactions = async (): Promise<void> => {
  const existingCount = await db.transactions.count()
  if (existingCount > 0) {
    return
  }

  const legacyValue = localStorage.getItem(LEGACY_KEY)
  if (!legacyValue) {
    return
  }

  const legacyTransactions = parseLegacyRecord(legacyValue)
  if (legacyTransactions.length === 0) {
    return
  }

  const converted: Transaction[] = []
  for (const item of legacyTransactions) {
    const tx = toTransaction(item)
    if (tx) {
      converted.push(tx)
    }
  }

  if (converted.length > 0) {
    await db.transactions.bulkPut(converted)
  }
}
