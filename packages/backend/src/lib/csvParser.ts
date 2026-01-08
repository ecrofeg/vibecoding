import Papa from 'papaparse'
import { parse, isValid } from 'date-fns'
import { randomUUID } from 'crypto'

export type TransactionType = 'expense' | 'transfer' | 'refund'

export type TransactionCategory =
  | 'food_home'
  | 'food_out'
  | 'delivery'
  | 'coffee_snacks'
  | 'transport'
  | 'taxi'
  | 'shopping'
  | 'subscriptions'
  | 'health'
  | 'other'

export type ParsedTransaction = {
  id: string
  documentId: string
  date: string
  name: string
  description: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  cardId: string
  linkedTransactionId: string | null
}

type ParsedRow = Record<string, string>

const hashString = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

const generateSyntheticId = (date: Date, amount: number, description: string): string => {
  const str = `${date.toISOString()}|${amount}|${description}`
  return `synthetic_${hashString(str)}`
}

const dateFormats = [
  'dd.MM.yyyy HH:mm',
  'dd.MM.yyyy',
  'MM/dd/yyyy',
  'yyyy-MM-dd',
  'dd/MM/yyyy',
  'MM-dd-yyyy',
  'yyyy/MM/dd',
]

const parseDate = (dateStr: string): Date | null => {
  const trimmed = dateStr.trim()

  for (const format of dateFormats) {
    const parsed = parse(trimmed, format, new Date())
    if (isValid(parsed)) {
      return parsed
    }
  }

  const isoDate = new Date(trimmed)
  if (!isNaN(isoDate.getTime())) {
    return isoDate
  }

  return null
}

const parseAmount = (amountStr: string): number | null => {
  if (!amountStr || typeof amountStr !== 'string') {
    return null
  }

  let cleaned = amountStr.trim()

  if (cleaned === '' || cleaned === '-') {
    return null
  }

  cleaned = cleaned.replace(/\s/g, '')
  cleaned = cleaned.replace(/,/g, '.')

  const parsed = parseFloat(cleaned)

  if (isNaN(parsed) || !isFinite(parsed)) {
    return null
  }

  return parsed
}

const findColumn = (headers: string[], possibleNames: string[]): number => {
  const lowerHeaders = headers.map(h => h.toLowerCase().trim())

  for (const name of possibleNames) {
    const index = lowerHeaders.findIndex(h => h.includes(name.toLowerCase()))
    if (index !== -1) {
      return index
    }
  }

  return -1
}

const determineTransactionType = (description: string): TransactionType => {
  const lowerDescription = description.toLowerCase()

  if (lowerDescription.includes('перевод') || lowerDescription.includes('пополнение')) {
    return 'transfer'
  }

  if (lowerDescription.includes('возврат') || lowerDescription.includes('refund')) {
    return 'refund'
  }

  return 'expense'
}

const linkRefundsToExpenses = (transactions: ParsedTransaction[]): ParsedTransaction[] => {
  const expenses = transactions.filter(tx => tx.type === 'expense' && tx.amount < 0)
  const refunds = transactions.filter(tx => tx.type === 'refund')

  for (const refund of refunds) {
    const refundAmount = Math.abs(refund.amount)
    const refundNameLower = refund.name.toLowerCase()

    const matchingExpense = expenses.find(expense => {
      const expenseAmount = Math.abs(expense.amount)
      const expenseNameLower = expense.name.toLowerCase()

      const amountsMatch = Math.abs(refundAmount - expenseAmount) < 0.01
      const namesSimilar = expenseNameLower.includes(refundNameLower) ||
                          refundNameLower.includes(expenseNameLower) ||
                          expenseNameLower.split(' ').some(word =>
                            word.length > 3 && refundNameLower.includes(word)
                          )

      return amountsMatch && namesSimilar && !expense.linkedTransactionId
    })

    if (matchingExpense) {
      refund.linkedTransactionId = matchingExpense.id
      matchingExpense.linkedTransactionId = refund.id
    }
  }

  return transactions
}

export const parseCSV = (csvContent: string, cardId: string): ParsedTransaction[] => {
  let cleanedContent = csvContent.trim()

  if (cleanedContent.charCodeAt(0) === 0xFEFF) {
    cleanedContent = cleanedContent.slice(1)
  }

  cleanedContent = cleanedContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  const delimiter = cleanedContent.includes(';') ? ';' : ','

  const result = Papa.parse<ParsedRow>(cleanedContent, {
    header: true,
    skipEmptyLines: true,
    delimiter,
    transformHeader: (header) => header.trim(),
    quoteChar: '"',
  })

  if (result.data.length === 0) {
    return []
  }

  const rows = result.data.filter((row) => {
    return Object.keys(row).length > 0 && Object.values(row).some((val) => {
      if (typeof val === 'string') {
        return val.trim() !== ''
      }
      return val != null && val !== ''
    })
  })

  if (rows.length === 0) {
    return []
  }

  const headers = Object.keys(rows[0]!)

  const dateIndex = findColumn(headers, [
    'дата операции',
    'date',
    'transaction date',
    'posting date',
    'posted date',
  ])

  const descriptionIndex = findColumn(headers, [
    'детали операции',
    'назначение платежа',
    'description',
    'memo',
    'details',
    'transaction',
    'merchant',
    'payee',
  ])

  const documentIdIndex = findColumn(headers, [
    'номер документа',
    'document id',
    'document number',
    'transaction id',
    'id',
  ])

  const incomeIndex = findColumn(headers, [
    'сумма в валюте счета (поступления)',
    'сумма поступления',
    'income',
    'credit',
    'deposit',
  ])

  const expenseIndex = findColumn(headers, [
    'сумма в валюте счета (расходы)',
    'сумма расходы',
    'amount',
    'debit',
    'expense',
    'transaction amount',
  ])

  if (dateIndex === -1 || descriptionIndex === -1) {
    throw new Error('Could not find required columns. Expected: date, description')
  }

  if (incomeIndex === -1 && expenseIndex === -1) {
    throw new Error('Could not find amount columns. Expected: income or expense column')
  }

  const dateHeader = headers[dateIndex]!
  const descriptionHeader = headers[descriptionIndex]!
  const documentIdHeader = documentIdIndex !== -1 ? headers[documentIdIndex] : null
  const incomeHeader = incomeIndex !== -1 ? headers[incomeIndex] : null
  const expenseHeader = expenseIndex !== -1 ? headers[expenseIndex] : null

  const transactions: ParsedTransaction[] = []

  for (const row of rows) {
    try {
      const dateStr = row[dateHeader] ? String(row[dateHeader]).trim() : ''
      const description = row[descriptionHeader] ? String(row[descriptionHeader]).trim() : ''

      if (!dateStr || !description) {
        continue
      }

      const date = parseDate(dateStr)
      if (!date) {
        continue
      }

      let amount: number | null = null

      if (expenseHeader && expenseHeader in row) {
        const expenseValue = row[expenseHeader] ? String(row[expenseHeader]).trim() : ''
        if (expenseValue !== '') {
          const expenseAmount = parseAmount(expenseValue)
          if (expenseAmount !== null && expenseAmount !== 0) {
            amount = -Math.abs(expenseAmount)
          }
        }
      }

      if (amount === null && incomeHeader && incomeHeader in row) {
        const incomeValue = row[incomeHeader] ? String(row[incomeHeader]).trim() : ''
        if (incomeValue !== '') {
          const incomeAmount = parseAmount(incomeValue)
          if (incomeAmount !== null && incomeAmount !== 0) {
            amount = Math.abs(incomeAmount)
          }
        }
      }

      if (amount === null) {
        continue
      }

      const name = description.trim()

      let documentId: string
      if (documentIdHeader && documentIdHeader in row) {
        const docIdValue = row[documentIdHeader] ? String(row[documentIdHeader]).trim() : ''
        if (docIdValue !== '') {
          documentId = docIdValue
        } else {
          documentId = generateSyntheticId(date, amount, description)
        }
      } else {
        documentId = generateSyntheticId(date, amount, description)
      }

      const type = determineTransactionType(description)

      transactions.push({
        id: randomUUID(),
        documentId,
        date: date.toISOString(),
        name,
        description,
        amount,
        type,
        category: 'other',
        cardId,
        linkedTransactionId: null,
      })
    } catch {
      continue
    }
  }

  return linkRefundsToExpenses(transactions)
}
