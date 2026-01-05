import { atom } from 'jotai'
import type { Transaction } from '@/shared/types'
import { db } from '@/shared/db/database'
import { migrateLegacyTransactions } from '@/shared/db/migration'

const transactionsStateAtom = atom<Transaction[]>([])

transactionsStateAtom.onMount = (set) => {
  let active = true

  const load = async () => {
    await migrateLegacyTransactions()
    const all = await db.transactions.toArray()
    if (active) {
      set(all)
    }
  }

  void load()

  return () => {
    active = false
  }
}

const persistTransactions = async (transactions: Transaction[]) => {
  await db.transactions.clear()
  await db.transactions.bulkPut(transactions)
}

export const transactionsAtom = atom(
  (get) => get(transactionsStateAtom),
  (_get, set, newValue: Transaction[] | ((prev: Transaction[]) => Transaction[])) => {
    set(transactionsStateAtom, (prev) => {
      const next = typeof newValue === 'function' ? newValue(prev) : newValue
      void persistTransactions(next)
      return next
    })
  }
)

export const clearTransactionsAtom = atom(null, (_get, set) => {
  set(transactionsStateAtom, [])
  void db.transactions.clear()
})
