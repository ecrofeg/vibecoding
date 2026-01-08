import type { FastifyInstance } from 'fastify'
import { and, gte, lte, sql } from 'drizzle-orm'
import { db, schema } from '../db/index.js'

export async function analyticsRoutes(app: FastifyInstance) {
  app.get('/api/analytics/category-breakdown', { preHandler: [app.authenticate] }, async (request) => {
    const { startDate, endDate } = request.query as {
      startDate?: string
      endDate?: string
    }

    const conditions = [
      sql`${schema.transactions.amount} < 0`,
    ]

    if (startDate) {
      conditions.push(gte(schema.transactions.date, startDate))
    }

    if (endDate) {
      conditions.push(lte(schema.transactions.date, endDate))
    }

    const result = await db
      .select({
        category: schema.transactions.category,
        total: sql<number>`SUM(ABS(${schema.transactions.amount}))`.as('total'),
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(schema.transactions)
      .where(and(...conditions))
      .groupBy(schema.transactions.category)

    return result.map(r => ({
      category: r.category,
      total: r.total ?? 0,
      count: r.count ?? 0,
    }))
  })

  app.get('/api/analytics/monthly-trend', { preHandler: [app.authenticate] }, async (request) => {
    const { startDate, endDate } = request.query as {
      startDate?: string
      endDate?: string
    }

    const conditions = []

    if (startDate) {
      conditions.push(gte(schema.transactions.date, startDate))
    }

    if (endDate) {
      conditions.push(lte(schema.transactions.date, endDate))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const result = await db
      .select({
        month: sql<string>`strftime('%Y-%m', ${schema.transactions.date})`.as('month'),
        income: sql<number>`SUM(CASE WHEN ${schema.transactions.amount} > 0 THEN ${schema.transactions.amount} ELSE 0 END)`.as('income'),
        expenses: sql<number>`SUM(CASE WHEN ${schema.transactions.amount} < 0 THEN ABS(${schema.transactions.amount}) ELSE 0 END)`.as('expenses'),
      })
      .from(schema.transactions)
      .where(whereClause)
      .groupBy(sql`strftime('%Y-%m', ${schema.transactions.date})`)
      .orderBy(sql`month`)

    return result.map(r => ({
      month: r.month,
      income: r.income ?? 0,
      expenses: r.expenses ?? 0,
    }))
  })
}
