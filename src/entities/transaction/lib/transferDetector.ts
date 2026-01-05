import type { Transaction } from '../../../shared/types'

const TRANSFER_KEYWORDS = [
  'перевод между счетами',
  'пополнение счета',
  'пополнение карты',
  'внутренний перевод',
  'transfer between accounts',
  'account transfer',
  'internal transfer',
  'себе',
  'на свой счет',
  'на свою карту',
]

const REFUND_KEYWORDS = [
  'возврат',
  'отмена операции',
  'refund',
  'chargeback',
  'reversal',
  'cancellation',
]

const SBP_KEYWORDS = ['сбп', 'sbp', 'система быстрых платежей']

export const detectTransfer = (tx: Transaction): boolean => {
  const searchText = `${tx.descriptionRaw} ${tx.merchantRaw}`.toLowerCase()

  const hasTransferKeyword = TRANSFER_KEYWORDS.some(keyword =>
    searchText.includes(keyword.toLowerCase())
  )

  if (hasTransferKeyword) {
    return true
  }

  const isSBP = SBP_KEYWORDS.some(keyword =>
    searchText.includes(keyword.toLowerCase())
  )

  if (isSBP && tx.amount > 0) {
    return true
  }

  return false
}

export const detectRefund = (tx: Transaction): boolean => {
  if (tx.amount <= 0) {
    return false
  }

  const searchText = `${tx.descriptionRaw} ${tx.merchantRaw}`.toLowerCase()

  return REFUND_KEYWORDS.some(keyword =>
    searchText.includes(keyword.toLowerCase())
  )
}

export const detectPairedTransfer = (
  tx: Transaction,
  allTransactions: Transaction[]
): Transaction | null => {
  const targetAmount = -tx.amount
  const txDate = new Date(tx.date)
  const oneDayBefore = new Date(txDate)
  oneDayBefore.setDate(oneDayBefore.getDate() - 1)
  const oneDayAfter = new Date(txDate)
  oneDayAfter.setDate(oneDayAfter.getDate() + 1)

  const paired = allTransactions.find(other => {
    if (other.id === tx.id) return false

    const otherDate = new Date(other.date)
    if (otherDate < oneDayBefore || otherDate > oneDayAfter) return false

    return Math.abs(other.amount - targetAmount) < 0.01
  })

  return paired || null
}

export const getTxType = (tx: Transaction): Transaction['txType'] => {
  if (detectRefund(tx)) {
    return 'refund'
  }

  if (detectTransfer(tx)) {
    return 'transfer'
  }

  const searchText = `${tx.descriptionRaw} ${tx.merchantRaw}`.toLowerCase()

  if (searchText.includes('снятие наличных') || searchText.includes('cash withdrawal')) {
    return 'cash_withdrawal'
  }

  if (searchText.includes('комиссия') || searchText.includes('fee') || searchText.includes('commission')) {
    return 'fee'
  }

  return tx.amount < 0 ? 'expense' : 'income'
}
