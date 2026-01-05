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
    const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date)
    
    if (!txDate || isNaN(txDate.getTime())) {
      return false
    }
    
    try {
      const isInDateRange = isWithinInterval(txDate, {
        start: filter.startDate,
        end: filter.endDate,
      })
      
      if (!isInDateRange) {
        return false
      }
      
      if (searchQuery) {
        const matchesDescription = tx.descriptionRaw.toLowerCase().includes(searchQuery)
        const matchesMerchant = tx.merchantRaw.toLowerCase().includes(searchQuery) ||
                                tx.merchantNorm.toLowerCase().includes(searchQuery)
        return matchesDescription || matchesMerchant
      }
      
      return true
    } catch {
      return false
    }
  })
})

export const expensesAtom = atom((get): Transaction[] => {
  const transactions = get(filteredTransactionsAtom)
  return transactions.filter((tx: Transaction) => tx.txType === 'expense' && !tx.isTransfer)
})

export const incomeAtom = atom((get): Transaction[] => {
  const transactions = get(filteredTransactionsAtom)
  return transactions.filter((tx: Transaction) => tx.txType === 'income')
})

