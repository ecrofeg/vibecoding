import type { Transaction } from '@/shared/types'

const TRANSFER_PATTERNS = [
  'перевод между счетами',
  'перевод между своими счетами',
  'сбп',
  'пополнение счета',
  'перевод',
]

const REFUND_PATTERNS = ['возврат', 'refund', 'chargeback']

export const isRefundTransaction = (tx: Transaction): boolean => {
  if (tx.amount <= 0) {
    return false
  }
  const haystack = `${tx.descriptionRaw} ${tx.merchantRaw}`.toLowerCase()
  return REFUND_PATTERNS.some(pattern => haystack.includes(pattern))
}

const hasTransferKeyword = (text: string): boolean => {
  const haystack = text.toLowerCase()
  return TRANSFER_PATTERNS.some(pattern => haystack.includes(pattern))
}

const hasPairMatch = (tx: Transaction, transactions: Transaction[]): boolean => {
  const dayMs = 24 * 60 * 60 * 1000
  return transactions.some(other => {
    if (other.id === tx.id) {
      return false
    }
    if (Math.abs(Math.abs(other.amount) - Math.abs(tx.amount)) > 0.01) {
      return false
    }
    const diff = Math.abs(other.date.getTime() - tx.date.getTime())
    return diff <= dayMs
  })
}

export const isTransferTransaction = (tx: Transaction, transactions: Transaction[]): boolean => {
  if (hasTransferKeyword(tx.descriptionRaw) || hasTransferKeyword(tx.merchantRaw)) {
    return true
  }
  return hasPairMatch(tx, transactions)
}
