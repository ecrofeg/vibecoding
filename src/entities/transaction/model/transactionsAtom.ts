import { atomWithStorage } from 'jotai/utils'
import { atom } from 'jotai'
import type { Transaction } from '@/shared/types'

type StoredTransaction = {
  id: string
  documentId: string
  date: string
  name: string
  description: string
  amount: number
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
          record[documentId] = {
            id: tx.id,
            documentId,
            date,
            name: tx.name || tx.description.trim(),
            description: tx.description,
            amount: tx.amount,
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
          record[documentId] = {
            id: tx.id,
            documentId: tx.documentId || documentId,
            date,
            name: tx.name || tx.description.trim(),
            description: tx.description,
            amount: tx.amount,
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

