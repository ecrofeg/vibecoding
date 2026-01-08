import type { FastifyInstance } from 'fastify'
import { eq, and, gte, lte } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from '../db/index.js'
import { randomUUID } from 'crypto'
import { parseCSV } from '../lib/csvParser.js'

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

  app.post('/api/transactions/upload-csv', { preHandler: [app.authenticate] }, async (request, reply) => {
    const data = await request.file()

    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' })
    }

    const cardId = (request.query as { cardId?: string }).cardId

    if (!cardId) {
      return reply.status(400).send({ error: 'cardId query parameter is required' })
    }

    const buffer = await data.toBuffer()
    const csvContent = buffer.toString('utf-8')

    let parsedTransactions
    try {
      parsedTransactions = parseCSV(csvContent, cardId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to parse CSV'
      return reply.status(400).send({ error: message })
    }

    if (parsedTransactions.length === 0) {
      return reply.status(400).send({ error: 'No valid transactions found in CSV' })
    }

    const existingTransactions = await db
      .select({ documentId: schema.transactions.documentId })
      .from(schema.transactions)
      .where(eq(schema.transactions.cardId, cardId))

    const existingDocIds = new Set(existingTransactions.map(t => t.documentId))

    const newTransactions = parsedTransactions.filter(t => !existingDocIds.has(t.documentId))
    const updatedTransactions = parsedTransactions.filter(t => existingDocIds.has(t.documentId))

    if (newTransactions.length > 0) {
      await db.insert(schema.transactions).values(newTransactions)
    }

    for (const tx of updatedTransactions) {
      await db
        .update(schema.transactions)
        .set({
          date: tx.date,
          name: tx.name,
          description: tx.description,
          amount: tx.amount,
          type: tx.type,
          linkedTransactionId: tx.linkedTransactionId,
        })
        .where(
          and(
            eq(schema.transactions.documentId, tx.documentId),
            eq(schema.transactions.cardId, cardId)
          )
        )
    }

    const allTransactions = await db
      .select()
      .from(schema.transactions)
      .where(eq(schema.transactions.cardId, cardId))

    return {
      success: true,
      total: parsedTransactions.length,
      new: newTransactions.length,
      updated: updatedTransactions.length,
      transactions: allTransactions.map(t => ({
        ...t,
        date: new Date(t.date).toISOString(),
      })),
    }
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
