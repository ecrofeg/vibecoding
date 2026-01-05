export type Transaction = {
  id: string
  documentId: string
  date: Date
  name: string
  description: string
  amount: number
}

export type DateFilter = {
  startDate: Date
  endDate: Date
}

