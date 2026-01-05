export { db } from './db/database'
export { migrateFromLocalStorage, clearLegacyStorage } from './db/migration'
export { calculateLeaks, calculateTopMerchants, detectSpikes } from './lib/insights'
export type { LeaksInsight, TopMerchantsInsight } from './lib/insights'
