import type { Rule, Transaction, CategorySource, NeedType } from '@/shared/types'
import { CATEGORIES } from '@/entities/category'

export type CategorizedResult = {
  categoryId: string
  needType: NeedType
  categorySource: CategorySource
  ruleId: string | null
}

const matchRule = (tx: Transaction, rule: Rule): boolean => {
  const merchant = tx.merchantNorm.toLowerCase()
  const pattern = rule.pattern.toLowerCase()

  switch (rule.matchType) {
    case 'exact':
      return merchant === pattern
    case 'contains':
      return merchant.includes(pattern)
    case 'regex':
      try {
        return new RegExp(rule.pattern, 'i').test(tx.merchantNorm)
      } catch {
        return false
      }
  }
}

export const categorizeTransaction = (
  tx: Transaction,
  rules: Rule[],
  deepseekEnabled: boolean,
): CategorizedResult => {
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority)

  for (const rule of sortedRules) {
    if (matchRule(tx, rule)) {
      return {
        categoryId: rule.categoryId,
        needType: rule.needType ?? 'unknown',
        categorySource: 'rule',
        ruleId: rule.id,
      }
    }
  }

  if (deepseekEnabled) {
    return {
      categoryId: CATEGORIES.find(category => category.id === 'other')?.id ?? 'other',
      needType: 'unknown',
      categorySource: 'model',
      ruleId: null,
    }
  }

  return {
    categoryId: CATEGORIES.find(category => category.id === 'other')?.id ?? 'other',
    needType: 'unknown',
    categorySource: 'manual',
    ruleId: null,
  }
}
