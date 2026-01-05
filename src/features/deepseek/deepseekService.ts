import type { Transaction } from '@/shared/types'
import type { RawRow } from '@/entities/transaction/lib/pdfParser'
import { buildNormalizePrompt, type NormContext } from './normalizePrompt'
import { buildCategorizePrompt } from './categorizePrompt'

type DeepSeekConfig = {
  apiKey: string
  baseUrl?: string
}

type CategorizedTx = {
  id: string
  category_id: string
  need_type: string
  confidence: number
  suggested_rule?: string
}

const DEFAULT_BASE_URL = 'https://api.deepseek.com/v1'

const parseResponse = async (response: Response): Promise<string> => {
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`DeepSeek API error: ${response.status} ${errorText}`)
  }
  const json = await response.json()
  const content = json.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('DeepSeek response missing content')
  }
  return content.trim()
}

export class DeepSeekService {
  private apiKey: string
  private baseUrl: string

  constructor(config: DeepSeekConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL
  }

  private async request(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    })

    return parseResponse(response)
  }

  async normalizeTransactions(rawRows: RawRow[], context: NormContext): Promise<Transaction[]> {
    const prompt = buildNormalizePrompt(rawRows, context)
    const content = await this.request(prompt)
    const parsed = JSON.parse(content) as Array<Omit<Transaction, 'date' | 'postedDate'> & {
      date: string
      postedDate: string | null
    }>
    return parsed.map(item => ({
      ...item,
      date: new Date(item.date),
      postedDate: item.postedDate ? new Date(item.postedDate) : null,
    }))
  }

  async categorizeTransactions(transactions: Transaction[]): Promise<CategorizedTx[]> {
    const prompt = buildCategorizePrompt(transactions)
    const content = await this.request(prompt)
    return JSON.parse(content) as CategorizedTx[]
  }
}
