import type { RawRow } from '@/entities/transaction/lib/pdfParser'

export type NormContext = {
  bankId: string
  instrumentTypeHint?: string
  transferKeywords?: string[]
}

export const buildNormalizePrompt = (rows: RawRow[], context: NormContext): string => {
  return `
You are a financial statement parser. Convert the provided raw rows into a JSON array of transactions.

Context:
- bank_id: ${context.bankId}
- instrument_type_hint: ${context.instrumentTypeHint ?? 'unknown'}
- transfer_keywords: ${(context.transferKeywords ?? []).join(', ') || 'none'}

Input rows:
${rows.map(row => `(${row.page}:${row.rowNo}) ${row.rowText}`).join('\n')}

Output JSON only, with fields:
id, sourceId, source, bankId, accountId, cardLast4, date, postedDate, amount, currency,
descriptionRaw, merchantRaw, merchantNorm, categoryId, needType, txType, isTransfer,
isRecurring, notes, categorySource, categoryConfidence, normalizationConfidence.
Dates must be ISO strings.
`
}
