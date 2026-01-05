import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { db } from '../../../shared/db/database'
import type { Budget } from '../../../shared/types'

export const budgetsAtom = atomWithStorage<Budget[]>('budget-tracker-budgets', [])

export const loadBudgetsFromDB = atom(null, async (get, set) => {
  const budgets = await db.budgets.toArray()
  set(budgetsAtom, budgets)
  return budgets
})

export const saveBudgetToDB = atom(null, async (get, set, budget: Budget) => {
  await db.budgets.put(budget)
  const budgets = get(budgetsAtom)
  const existingIndex = budgets.findIndex(b => b.id === budget.id)
  
  if (existingIndex >= 0) {
    const updated = [...budgets]
    updated[existingIndex] = budget
    set(budgetsAtom, updated)
  } else {
    set(budgetsAtom, [...budgets, budget])
  }
})

export const deleteBudgetFromDB = atom(null, async (get, set, budgetId: string) => {
  await db.budgets.delete(budgetId)
  const budgets = get(budgetsAtom)
  set(budgetsAtom, budgets.filter(b => b.id !== budgetId))
})

export const getBudgetForPeriodAndCategory = atom((get) => {
  return (period: string, categoryId: string): Budget | undefined => {
    const budgets = get(budgetsAtom)
    return budgets.find(b => b.period === period && b.categoryId === categoryId)
  }
})
