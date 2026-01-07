import type { Transaction, TransactionCategory } from '@/shared/types'

export const categorizeTransactions = async (
  transactions: Transaction[]
): Promise<Transaction[]> => {
  console.log('DeepSeek categorization temporarily disabled')
  return transactions.map((tx) => ({ ...tx, category: 'other' as TransactionCategory }))
}

/*
// Temporarily disabled DeepSeek API categorization
// To re-enable: uncomment this code and replace the simple implementation above

import { getDeepseekApiKey } from './apiKey'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'
const BATCH_SIZE = 25

const CATEGORIES_PROMPT = `You are a financial transaction categorization assistant. 
Categorize each transaction into one of these categories:
- food_home: Groceries, supermarkets, food stores
- food_out: Restaurants, cafes, dining out
- delivery: Food delivery services
- coffee_snacks: Coffee shops, bakeries, quick snacks
- transport: Public transport, fuel, parking
- taxi: Taxi, ride-sharing services
- shopping: Retail purchases, online shopping, clothing, electronics
- subscriptions: Monthly subscriptions, streaming services, software
- health: Pharmacies, medical services, fitness
- other: Everything else

Respond with a JSON object where keys are array indices (0, 1, 2...) and values are category names.
Example: {"0": "food_home", "1": "taxi", "2": "shopping"}`

type CategoryResponse = Record<string, string>

const validCategories: TransactionCategory[] = [
  'food_home',
  'food_out',
  'delivery',
  'coffee_snacks',
  'transport',
  'taxi',
  'shopping',
  'subscriptions',
  'health',
  'other',
]

const isValidCategory = (category: string): category is TransactionCategory => {
  return validCategories.includes(category as TransactionCategory)
}

const categorizeBatch = async (
  transactions: Array<{ description: string; name: string }>,
  apiKey: string
): Promise<CategoryResponse> => {
  try {
    const transactionDescriptions = transactions.map(
      (tx, idx) => `${idx}: ${tx.name} - ${tx.description}`
    )

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: CATEGORIES_PROMPT },
          { role: 'user', content: transactionDescriptions.join('\n') },
        ],
        response_format: { type: 'json_object' },
        temperature: 1.0,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DeepSeek API error:', response.status, errorText)
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No content in API response')
    }

    const categories = JSON.parse(content) as CategoryResponse
    return categories
  } catch (error) {
    console.error('Error in categorizeBatch:', error)
    throw error
  }
}

export const categorizeTransactions = async (
  transactions: Transaction[]
): Promise<Transaction[]> => {
  const apiKey = getDeepseekApiKey()

  if (!apiKey) {
    console.log('No DeepSeek API key found, defaulting to "other" category')
    return transactions.map((tx) => ({ ...tx, category: 'other' as TransactionCategory }))
  }

  const expenseTransactions = transactions.filter((tx) => tx.type === 'expense')

  if (expenseTransactions.length === 0) {
    return transactions
  }

  try {
    const categorized = [...expenseTransactions]

    for (let i = 0; i < expenseTransactions.length; i += BATCH_SIZE) {
      const batch = expenseTransactions.slice(i, i + BATCH_SIZE)
      const batchData = batch.map((tx) => ({
        description: tx.description,
        name: tx.name,
      }))

      console.log(`Categorizing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} transactions)`)

      const categories = await categorizeBatch(batchData, apiKey)

      for (let j = 0; j < batch.length; j++) {
        const categoryString = categories[j.toString()]
        const category: TransactionCategory = 
          categoryString && isValidCategory(categoryString) 
            ? categoryString 
            : 'other'
        categorized[i + j] = { ...categorized[i + j], category }
      }
    }

    const result: Transaction[] = transactions.map((tx) => {
      if (tx.type === 'expense') {
        const categorizedTx = categorized.find((ctx) => ctx.id === tx.id)
        return categorizedTx || { ...tx, category: 'other' as TransactionCategory }
      }
      return { ...tx, category: 'other' as TransactionCategory }
    })

    return result
  } catch (error) {
    console.error('Error categorizing transactions, falling back to "other":', error)
    return transactions.map((tx) => ({ ...tx, category: 'other' as TransactionCategory }))
  }
}
*/
