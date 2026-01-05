export type NeedType = 'need' | 'want' | 'mixed' | 'unknown'
export type CategorySource = 'rule' | 'model' | 'manual'
export type TxType =
  | 'expense'
  | 'income'
  | 'transfer'
  | 'refund'
  | 'cash_withdrawal'
  | 'fee'

export type Transaction = {
  id: string
  sourceId: string
  source: string
  bankId: string
  accountId: string | null
  cardLast4: string | null
  date: Date
  postedDate: Date | null
  amount: number
  currency: string
  descriptionRaw: string
  merchantRaw: string
  merchantNorm: string
  categoryId: string | null
  needType: NeedType
  txType: TxType
  isTransfer: boolean
  isRecurring: boolean
  notes: string | null
  categorySource: CategorySource | null
  categoryConfidence: number | null
  normalizationConfidence: number | null
}

export type MatchType = 'exact' | 'contains' | 'regex'

export type Rule = {
  id: string
  priority: number
  matchType: MatchType
  pattern: string
  targetMerchantNorm: string | null
  categoryId: string
  needType: NeedType | null
  createdAt: Date
  updatedAt: Date
}

export type Budget = {
  id: string
  period: string
  categoryId: string
  limitAmount: number
  currency: string
}

export type Setting = {
  key: string
  value: string
}

export type Category = {
  id: string
  name: string
  nameEn: string
  color: string
  defaultNeedType: NeedType
}

export type DateFilter = {
  startDate: Date
  endDate: Date
}
