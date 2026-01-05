import type { Transaction, Rule } from '../../shared/types'
import { CATEGORIES } from '../../entities/category/model/categories'
import { normalizeMerchantName } from '../../entities/transaction/lib/merchantNormalizer'
import { getTxType } from '../../entities/transaction/lib/transferDetector'

export type DeepSeekConfig = {
  apiKey: string
  baseUrl?: string
}

export type RawRow = {
  id: string
  rowText: string
  page?: number
  rowNo?: number
}

export type NormContext = {
  bankId: string
  instrumentTypeHint?: 'card' | 'account'
  transferKeywords?: string[]
}

export type CategorizeResult = {
  transactionId: string
  categoryId: string
  needType: Transaction['needType']
  confidence: number
  suggestedRule?: {
    pattern: string
    matchType: Rule['matchType']
  }
}

class DeepSeekService {
  private config: DeepSeekConfig
  private baseUrl: string

  constructor(config: DeepSeekConfig) {
    this.config = config
    this.baseUrl = config.baseUrl || 'https://api.deepseek.com/v1'
  }

  private async makeRequest(messages: Array<{ role: string; content: string }>) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content
  }

  async normalizeTransactions(
    rawRows: RawRow[],
    context: NormContext
  ): Promise<Transaction[]> {
    const systemPrompt = `You are a financial data parser. Parse raw transaction rows into structured JSON format.

Output format:
{
  "transactions": [
    {
      "row_id": "string",
      "date": "YYYY-MM-DD",
      "posted_date": "YYYY-MM-DD" or null,
      "merchant_raw": "string",
      "description": "string",
      "amount": number (negative for expenses),
      "currency": "RUB",
      "account_id": "string or null",
      "card_last4": "string or null"
    }
  ]
}

Rules:
- Extract dates in YYYY-MM-DD format
- Identify merchant/payee name
- Parse amounts (negative = expense, positive = income)
- Extract card last 4 digits if present
- Identify currency (default RUB)
- Skip header rows and non-transaction data`

    const userPrompt = `Bank: ${context.bankId}
Instrument: ${context.instrumentTypeHint || 'unknown'}

Raw rows:
${rawRows.map(r => `[${r.id}] ${r.rowText}`).join('\n')}

Parse these transactions:`

    const result = await this.makeRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ])

    const parsed = JSON.parse(result)
    const transactions: Transaction[] = []

    for (const tx of parsed.transactions) {
      const merchantRaw = tx.merchant_raw || 'Unknown'
      const transaction: Transaction = {
        id: crypto.randomUUID(),
        sourceId: tx.row_id,
        source: 'pdf',
        bankId: context.bankId,
        accountId: tx.account_id,
        cardLast4: tx.card_last4,
        date: new Date(tx.date),
        postedDate: tx.posted_date ? new Date(tx.posted_date) : null,
        amount: tx.amount,
        currency: tx.currency || 'RUB',
        descriptionRaw: tx.description || '',
        merchantRaw,
        merchantNorm: normalizeMerchantName(merchantRaw),
        categoryId: null,
        needType: 'unknown',
        txType: 'expense',
        isTransfer: false,
        isRecurring: false,
        notes: null,
        categorySource: null,
        categoryConfidence: null,
        normalizationConfidence: tx.confidence || null,
      }

      transaction.txType = getTxType(transaction)
      transaction.isTransfer = transaction.txType === 'transfer'

      transactions.push(transaction)
    }

    return transactions
  }

  async categorizeTransactions(
    transactions: Transaction[]
  ): Promise<CategorizeResult[]> {
    const categoriesDesc = CATEGORIES.map(
      c => `- ${c.id}: ${c.nameEn} (${c.name}), need_type: ${c.defaultNeedType}`
    ).join('\n')

    const systemPrompt = `You are a financial transaction categorizer. Assign categories to transactions.

Available categories:
${categoriesDesc}

Output format:
{
  "results": [
    {
      "transaction_id": "string",
      "category_id": "string",
      "need_type": "need" | "want" | "mixed" | "unknown",
      "confidence": number (0-1),
      "suggested_rule": {
        "pattern": "string",
        "match_type": "exact" | "contains" | "regex"
      }
    }
  ]
}

Rules:
- Analyze merchant name and description
- Assign most appropriate category
- Determine if it's a need or want
- Confidence: 1.0 = certain, 0.5 = uncertain
- Suggest reusable rule pattern for future transactions`

    const txList = transactions.map(tx => ({
      id: tx.id,
      merchant: tx.merchantNorm,
      description: tx.descriptionRaw,
      amount: tx.amount,
    }))

    const userPrompt = `Categorize these transactions:
${JSON.stringify(txList, null, 2)}`

    const result = await this.makeRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ])

    const parsed = JSON.parse(result)
    return parsed.results
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest([
        { role: 'user', content: 'Test connection. Reply with {"status": "ok"}' },
      ])
      return true
    } catch {
      return false
    }
  }
}

export default DeepSeekService
