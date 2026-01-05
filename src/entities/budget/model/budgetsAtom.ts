import { atom } from 'jotai'
import { db } from '@/shared/db/database'
import type { Budget } from '@/shared/types'

const budgetsStateAtom = atom<Budget[]>([])

budgetsStateAtom.onMount = (set) => {
  let active = true

  const load = async () => {
    const all = await db.budgets.toArray()
    if (active) {
      set(all)
    }
  }

  void load()

  return () => {
    active = false
  }
}

const persistBudgets = async (budgets: Budget[]) => {
  await db.budgets.clear()
  await db.budgets.bulkPut(budgets)
}

export const budgetsAtom = atom(
  (get) => get(budgetsStateAtom),
  (_get, set, newValue: Budget[] | ((prev: Budget[]) => Budget[])) => {
    set(budgetsStateAtom, (prev) => {
      const next = typeof newValue === 'function' ? newValue(prev) : newValue
      void persistBudgets(next)
      return next
    })
  }
)
