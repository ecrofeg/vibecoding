import Fastify from 'fastify'
import { registerCors } from './plugins/cors.js'
import { registerAuth } from './plugins/auth.js'
import { authRoutes } from './routes/auth.js'
import { cardsRoutes } from './routes/cards.js'
import { transactionsRoutes } from './routes/transactions.js'
import { settingsRoutes } from './routes/settings.js'
import { savingsAccountsRoutes } from './routes/savingsAccounts.js'
import { recurringExpensesRoutes } from './routes/recurringExpenses.js'
import { recurringIncomeRoutes } from './routes/recurringIncome.js'
import { plannedExpensesRoutes } from './routes/plannedExpenses.js'
import { analyticsRoutes } from './routes/analytics.js'

const app = Fastify({
  logger: true,
})

async function main() {
  await registerCors(app)
  await registerAuth(app)

  await app.register(authRoutes)
  await app.register(cardsRoutes)
  await app.register(transactionsRoutes)
  await app.register(settingsRoutes)
  await app.register(savingsAccountsRoutes)
  await app.register(recurringExpensesRoutes)
  await app.register(recurringIncomeRoutes)
  await app.register(plannedExpensesRoutes)
  await app.register(analyticsRoutes)

  app.get('/api/health', async () => {
    return { status: 'ok' }
  })

  const port = parseInt(process.env.PORT || '3000', 10)
  const host = process.env.HOST || '0.0.0.0'

  await app.listen({ port, host })
  console.log(`Server running at http://${host}:${port}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
