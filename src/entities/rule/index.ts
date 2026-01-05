export { categorizeTransaction, applyRulesToTransactions } from './lib/ruleEngine'
export { rulesAtom, loadRulesFromDB, saveRuleToDB, deleteRuleFromDB, saveAllRulesToDB } from './model/rulesAtom'
export type { CategorizedResult } from './lib/ruleEngine'
