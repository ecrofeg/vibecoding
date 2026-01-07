import type { FastifyInstance } from 'fastify'
import { eq, and, gte, lte, like } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from '../db/index.js'
import { randomUUID } from 'crypto'

const transactionSchema = z.object({
  cardId: z.string().min(1),
  documentId: z.string().min(1),
  date: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  amount: z.number(),
  type: z.enum(['expense', 'transfer', 'refund']),
  category: z.enum([
    'food_home',
    'food_out',
    'delivery',
    'coffee_snacks',
    'transport',
    'taxi',
    'shopping',
    'subscriptions',
    'health',
    'other',
  ]),
  linkedTransactionId: z.string().optional(),
})

const transactionUpdateSchema = transactionSchema.partial()

const bulkTransactionSchema = z.array(transactionSchema)

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/api/transactions', { preHandler: [app.authenticate] }, async (request) => {
    const { startDate, endDate, cardId, category } = request.query as {
      startDate?: string
      endDate?: string
      cardId?: string
      category?: string
    }

    const conditions = []

    if (startDate) {
      conditions.push(gte(schema.transactions.date, startDate))
    }

    if (endDate) {
      conditions.push(lte(schema.transactions.date, endDate))
    }

    if (cardId) {
      conditions.push(eq(schema.transactions.cardId, cardId))
    }

    if (category) {
      conditions.push(eq(schema.transactions.category, category))
    }

    const result = conditions.length > 0
      ? await db.select().from(schema.transactions).where(and(...conditions))
      : await db.select().from(schema.transactions)

    return result.map(t => ({
      ...t,
      date: new Date(t.date).toISOString(),
    }))
  })

  app.post('/api/transactions', { preHandler: [app.authenticate] }, async (request, reply) => {
    const result = transactionSchema.safeParse(request.body)

    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: result.error.errors })
    }

    const transaction = {
      id: randomUUID(),
      ...result.data,
    }

    await db.insert(schema.transactions).values(transaction)
    return { ...transaction, date: new Date(transaction.date).toISOString() }
  })

  app.post('/api/transactions/bulk', { preHandler: [app.authenticate] }, async (request, reply) => {
    const result = bulkTransactionSchema.safeParse(request.body)

    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: result.error.errors })
    }

    const transactions = result.data.map(t => ({
      id: randomUUID(),
      ...t,
    }))

    if (transactions.length > 0) {
      await db.insert(schema.transactions).values(transactions)
    }

    return { success: true, count: transactions.length }
  })

  app.put('/api/transactions/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = transactionUpdateSchema.safeParse(request.body)

    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: result.error.errors })
    }

    const existing = await db.select().from(schema.transactions).where(eq(schema.transactions.id, id))

    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Transaction not found' })
    }

    await db.update(schema.transactions).set(result.data).where(eq(schema.transactions.id, id))

    const updated = await db.select().from(schema.transactions).where(eq(schema.transactions.id, id))
    return updated[0] ? { ...updated[0], date: new Date(updated[0].date).toISOString() } : null
  })

  app.delete('/api/transactions/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const existing = await db.select().from(schema.transactions).where(eq(schema.transactions.id, id))

    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Transaction not found' })
    }

    await db.delete(schema.transactions).where(eq(schema.transactions.id, id))
    return { success: true }
  })
}
