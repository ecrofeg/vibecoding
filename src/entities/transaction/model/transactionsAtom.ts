import { atomWithStorage } from 'jotai/utils'
import { atom } from 'jotai'
import type { Transaction, TransactionType, TransactionCategory } from '@/shared/types'

type StoredTransaction = {
  id: string
  documentId: string
  date: string
  name: string
  description: string
  amount: number
  type?: TransactionType
  category?: TransactionCategory
  cardId?: string
  linkedTransactionId?: string
}

const determineTransactionTypeFromDescription = (description: string, amount: number): TransactionType => {
  const lowerDescription = description.toLowerCase()
  
  if (lowerDescription.includes('перевод') || lowerDescription.includes('пополнение')) {
    return 'transfer'
  }
  
  if (lowerDescription.includes('возврат') || lowerDescription.includes('refund')) {
    return 'refund'
  }
  
  return 'expense'
}

const storage = {
  getItem: (key: string): Record<string, Transaction> => {
    try {
      const item = localStorage.getItem(key)
      if (!item) return {}
      
      const parsed = JSON.parse(item)
      
      if (Array.isArray(parsed)) {
        const record: Record<string, Transaction> = {}
        for (const tx of parsed as StoredTransaction[]) {
          const date = new Date(tx.date)
          if (isNaN(date.getTime())) {
            continue
          }
          const documentId = tx.documentId || tx.id
          const description = tx.description || ''
          record[documentId] = {
            id: tx.id,
            documentId,
            date,
            name: tx.name || description.trim(),
            description,
            amount: tx.amount,
            type: tx.type || determineTransactionTypeFromDescription(description, tx.amount),
            category: tx.category || 'other',
            cardId: tx.cardId || 'default-debit',
            linkedTransactionId: tx.linkedTransactionId,
          }
        }
        return record
      }
      
      if (typeof parsed === 'object' && parsed !== null) {
        const record: Record<string, Transaction> = {}
        for (const [documentId, tx] of Object.entries(parsed) as [string, StoredTransaction][]) {
          const date = new Date(tx.date)
          if (isNaN(date.getTime())) {
            continue
          }
          const description = tx.description || ''
          record[documentId] = {
            id: tx.id,
            documentId: tx.documentId || documentId,
            date,
            name: tx.name || description.trim(),
            description,
            amount: tx.amount,
            type: tx.type || determineTransactionTypeFromDescription(description, tx.amount),
            category: tx.category || 'other',
            cardId: tx.cardId || 'default-debit',
            linkedTransactionId: tx.linkedTransactionId,
          }
        }
        return record
      }
      
      return {}
    } catch {
      return {}
    }
  },
  setItem: (key: string, value: Record<string, Transaction>): void => {
    const stored: Record<string, StoredTransaction> = {}
    for (const [documentId, tx] of Object.entries(value)) {
      stored[documentId] = {
        id: tx.id,
        documentId: tx.documentId,
        date: tx.date.toISOString(),
        name: tx.name,
        description: tx.description,
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        cardId: tx.cardId,
        linkedTransactionId: tx.linkedTransactionId,
      }
    }
    localStorage.setItem(key, JSON.stringify(stored))
  },
  removeItem: (key: string): void => {
    localStorage.removeItem(key)
  },
}

const transactionsRecordAtom = atomWithStorage<Record<string, Transaction>>(
  'money-manager-transactions',
  {},
  storage
)

export const transactionsAtom = atom(
  (get) => {
    const record = get(transactionsRecordAtom)
    return Object.values(record)
  },
  (get, set, newValue: Transaction[] | ((prev: Transaction[]) => Transaction[])) => {
    const currentRecord = get(transactionsRecordAtom)
    const currentArray = Object.values(currentRecord)
    
    const newArray = typeof newValue === 'function' ? newValue(currentArray) : newValue
    
    const updatedRecord: Record<string, Transaction> = {}
    for (const tx of newArray) {
      updatedRecord[tx.documentId] = tx
    }
    
    set(transactionsRecordAtom, updatedRecord)
  }
)

export const clearTransactionsAtom = atom(null, (_get, set) => {
  set(transactionsRecordAtom, {})
})

