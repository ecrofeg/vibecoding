import type { Transaction, Rule } from '../../../shared/types'
import { CATEGORIES } from '../../category/model/categories'

export type CategorizedResult = {
  categoryId: string
  needType: Transaction['needType']
  categorySource: Transaction['categorySource']
  categoryConfidence: number
}

const matchRule = (tx: Transaction, rule: Rule): boolean => {
  const target = tx.merchantNorm.toLowerCase()
  const pattern = rule.pattern.toLowerCase()

  switch (rule.matchType) {
    case 'exact':
      return target === pattern
    case 'contains':
      return target.includes(pattern)
    case 'regex':
      try {
        const regex = new RegExp(pattern, 'i')
        return regex.test(target)
      } catch {
        return false
      }
    default:
      return false
  }
}

export const categorizeTransaction = (
  tx: Transaction,
  rules: Rule[]
): CategorizedResult | null => {
  if (tx.isTransfer) {
    return null
  }

  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority)

  for (const rule of sortedRules) {
    if (matchRule(tx, rule)) {
      const category = CATEGORIES.find(c => c.id === rule.categoryId)
      return {
        categoryId: rule.categoryId,
        needType: rule.needType || category?.defaultNeedType || 'unknown',
        categorySource: 'rule',
        categoryConfidence: 1.0,
      }
    }
  }

  return null
}

export const applyRulesToTransactions = (
  transactions: Transaction[],
  rules: Rule[]
): Transaction[] => {
  return transactions.map(tx => {
    if (tx.categoryId && tx.categorySource === 'manual') {
      return tx
    }

    const result = categorizeTransaction(tx, rules)
    if (result) {
      return {
        ...tx,
        categoryId: result.categoryId,
        needType: result.needType,
        categorySource: result.categorySource,
        categoryConfidence: result.categoryConfidence,
      }
    }

    return tx
  })
}
