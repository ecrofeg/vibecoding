import type { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from '../db/index.js'
import { randomUUID } from 'crypto'

const plannedExpenseSchema = z.object({
  name: z.string().min(1),
  amount: z.number(),
  date: z.string().min(1),
  sourceType: z.enum(['card', 'savings']),
  savingsAccountId: z.string().optional(),
})

const plannedExpenseUpdateSchema = plannedExpenseSchema.partial()

export async function plannedExpensesRoutes(app: FastifyInstance) {
  app.get('/api/planned-expenses', { preHandler: [app.authenticate] }, async () => {
    const result = await db.select().from(schema.plannedExpenses)

    return result.map(item => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      date: new Date(item.date).toISOString(),
      source: item.sourceType === 'savings' && item.savingsAccountId
        ? { type: 'savings' as const, savingsAccountId: item.savingsAccountId }
        : { type: 'card' as const },
    }))
  })

  app.post('/api/planned-expenses', { preHandler: [app.authenticate] }, async (request, reply) => {
    const result = plannedExpenseSchema.safeParse(request.body)

    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: result.error.errors })
    }

    const expense = {
      id: randomUUID(),
      name: result.data.name,
      amount: result.data.amount,
      date: result.data.date,
      sourceType: result.data.sourceType,
      savingsAccountId: result.data.savingsAccountId ?? null,
    }

    await db.insert(schema.plannedExpenses).values(expense)

    return {
      id: expense.id,
      name: expense.name,
      amount: expense.amount,
      date: new Date(expense.date).toISOString(),
      source: expense.sourceType === 'savings' && expense.savingsAccountId
        ? { type: 'savings' as const, savingsAccountId: expense.savingsAccountId }
        : { type: 'card' as const },
    }
  })

  app.put('/api/planned-expenses/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = plannedExpenseUpdateSchema.safeParse(request.body)

    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: result.error.errors })
    }

    const existing = await db.select().from(schema.plannedExpenses).where(eq(schema.plannedExpenses.id, id))

    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Planned expense not found' })
    }

    const updateData: Record<string, unknown> = {}
    if (result.data.name !== undefined) updateData.name = result.data.name
    if (result.data.amount !== undefined) updateData.amount = result.data.amount
    if (result.data.date !== undefined) updateData.date = result.data.date
    if (result.data.sourceType !== undefined) updateData.sourceType = result.data.sourceType
    if (result.data.savingsAccountId !== undefined) updateData.savingsAccountId = result.data.savingsAccountId

    await db.update(schema.plannedExpenses).set(updateData).where(eq(schema.plannedExpenses.id, id))

    const updated = await db.select().from(schema.plannedExpenses).where(eq(schema.plannedExpenses.id, id))
    const item = updated[0]!

    return {
      id: item.id,
      name: item.name,
      amount: item.amount,
      date: new Date(item.date).toISOString(),
      source: item.sourceType === 'savings' && item.savingsAccountId
        ? { type: 'savings' as const, savingsAccountId: item.savingsAccountId }
        : { type: 'card' as const },
    }
  })

  app.delete('/api/planned-expenses/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const existing = await db.select().from(schema.plannedExpenses).where(eq(schema.plannedExpenses.id, id))

    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Planned expense not found' })
    }

    await db.delete(schema.plannedExpenses).where(eq(schema.plannedExpenses.id, id))
    return { success: true }
  })
}
