import { atom } from 'jotai'
import { db } from '@/shared/db/database'
import type { Rule } from '@/shared/types'

const rulesStateAtom = atom<Rule[]>([])

rulesStateAtom.onMount = (set) => {
  let active = true

  const load = async () => {
    const all = await db.rules.toArray()
    if (active) {
      set(all)
    }
  }

  void load()

  return () => {
    active = false
  }
}

const persistRules = async (rules: Rule[]) => {
  await db.rules.clear()
  await db.rules.bulkPut(rules)
}

export const rulesAtom = atom(
  (get) => get(rulesStateAtom),
  (_get, set, newValue: Rule[] | ((prev: Rule[]) => Rule[])) => {
    set(rulesStateAtom, (prev) => {
      const next = typeof newValue === 'function' ? newValue(prev) : newValue
      void persistRules(next)
      return next
    })
  }
)
