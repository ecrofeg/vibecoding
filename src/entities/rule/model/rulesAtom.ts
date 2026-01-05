import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { db } from '../../../shared/db/database'
import type { Rule } from '../../../shared/types'

export const rulesAtom = atomWithStorage<Rule[]>('budget-tracker-rules', [])

export const loadRulesFromDB = atom(null, async (get, set) => {
  const rules = await db.rules.toArray()
  set(rulesAtom, rules)
  return rules
})

export const saveRuleToDB = atom(null, async (get, set, rule: Rule) => {
  await db.rules.put(rule)
  const rules = get(rulesAtom)
  const existingIndex = rules.findIndex(r => r.id === rule.id)
  
  if (existingIndex >= 0) {
    const updated = [...rules]
    updated[existingIndex] = rule
    set(rulesAtom, updated)
  } else {
    set(rulesAtom, [...rules, rule])
  }
})

export const deleteRuleFromDB = atom(null, async (get, set, ruleId: string) => {
  await db.rules.delete(ruleId)
  const rules = get(rulesAtom)
  set(rulesAtom, rules.filter(r => r.id !== ruleId))
})

export const saveAllRulesToDB = atom(null, async (get, set, rules: Rule[]) => {
  await db.rules.clear()
  await db.rules.bulkAdd(rules)
  set(rulesAtom, rules)
})
