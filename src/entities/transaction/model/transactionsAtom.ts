import { atom } from 'jotai'
import { db } from '../../../shared/db/database'
import type { Transaction } from '@/shared/types'

export const transactionsAtom = atom<Transaction[]>([])

export const loadTransactionsFromDB = atom(null, async (get, set) => {
  const transactions = await db.transactions.toArray()
  
  const sorted = transactions.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })
  
  set(transactionsAtom, sorted)
  return sorted
})

export const addTransactions = atom(null, async (get, set, newTransactions: Transaction[]) => {
  const existingSourceIds = new Set(
    (await db.transactions.toArray()).map(tx => tx.sourceId)
  )

  const uniqueTransactions = newTransactions.filter(
    tx => !existingSourceIds.has(tx.sourceId)
  )

  if (uniqueTransactions.length > 0) {
    await db.transactions.bulkAdd(uniqueTransactions)
  }

  const allTransactions = await db.transactions.toArray()
  const sorted = allTransactions.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })
  
  set(transactionsAtom, sorted)
  
  return {
    added: uniqueTransactions.length,
    duplicates: newTransactions.length - uniqueTransactions.length,
  }
})

export const updateTransaction = atom(null, async (get, set, transaction: Transaction) => {
  await db.transactions.put(transaction)
  
  const transactions = get(transactionsAtom)
  const index = transactions.findIndex(tx => tx.id === transaction.id)
  
  if (index >= 0) {
    const updated = [...transactions]
    updated[index] = transaction
    set(transactionsAtom, updated)
  } else {
    set(transactionsAtom, [...transactions, transaction])
  }
})

export const deleteTransaction = atom(null, async (get, set, transactionId: string) => {
  await db.transactions.delete(transactionId)
  
  const transactions = get(transactionsAtom)
  set(transactionsAtom, transactions.filter(tx => tx.id !== transactionId))
})

export const clearTransactionsAtom = atom(null, async (_get, set) => {
  await db.transactions.clear()
  set(transactionsAtom, [])
})

