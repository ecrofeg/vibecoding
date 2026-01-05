import { atom } from 'jotai'
import { isWithinInterval } from 'date-fns'
import { transactionsAtom } from './transactionsAtom'
import { dateFilterAtom } from './dateFilterAtom'
import { searchFilterAtom } from './searchFilterAtom'
import type { Transaction } from '@/shared/types'

export const filteredTransactionsAtom = atom((get): Transaction[] => {
  const transactions = get(transactionsAtom)
  const filter = get(dateFilterAtom)
  const searchQuery = get(searchFilterAtom).toLowerCase().trim()
  
  return transactions.filter((tx: Transaction) => {
    if (!tx.date || isNaN(tx.date.getTime())) {
      return false
    }
    try {
      const isInDateRange = isWithinInterval(tx.date, {
        start: filter.startDate,
        end: filter.endDate,
      })
      
      if (!isInDateRange) {
        return false
      }
      
      if (searchQuery) {
        const matchesDescription = tx.description.toLowerCase().includes(searchQuery)
        const matchesName = tx.name.toLowerCase().includes(searchQuery)
        return matchesDescription || matchesName
      }
      
      return true
    } catch {
      return false
    }
  })
})

export const expensesAtom = atom((get): Transaction[] => {
  const transactions = get(filteredTransactionsAtom)
  return transactions.filter((tx: Transaction) => tx.amount < 0)
})

export const incomeAtom = atom((get): Transaction[] => {
  const transactions = get(filteredTransactionsAtom)
  return transactions.filter((tx: Transaction) => tx.amount > 0)
})

