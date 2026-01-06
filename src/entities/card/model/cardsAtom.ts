import { atomWithStorage } from 'jotai/utils'
import type { Card } from '../../../shared/types'

const defaultCards: Card[] = [
  {
    id: 'default-debit',
    name: 'Дебетовая',
    type: 'debit',
    color: '#3182CE',
  },
  {
    id: 'default-credit',
    name: 'Кредитная',
    type: 'credit',
    color: '#805AD5',
  },
]

export const cardsAtom = atomWithStorage<Card[]>('vibecoding:cards', defaultCards)

