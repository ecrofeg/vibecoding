import type { Transaction } from '@/shared/types'
import { CATEGORIES } from '@/entities/category'

export const buildCategorizePrompt = (transactions: Transaction[]): string => {
  const categories = CATEGORIES.map(category => `${category.id} (${category.nameEn})`).join(', ')
  return `
You are a finance categorization assistant. For each transaction provide a category_id, need_type, confidence, and suggested_rule.
Use only these categories: ${categories}.

Input transactions (JSON):
${JSON.stringify(transactions, null, 2)}

Output JSON array with fields:
id, category_id, need_type, confidence, suggested_rule
`
}
