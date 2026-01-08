import type { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from '../db/index.js'
import { randomUUID } from 'crypto'

const recurringExpenseSchema = z.object({
  name: z.string().min(1),
  amount: z.number(),
  period: z.enum(['weekly', 'monthly', 'monthly_on_day']),
  dayOfMonth: z.number().optional(),
  dayOfWeek: z.number().optional(),
  sourceType: z.enum(['card', 'savings']),
  savingsAccountId: z.string().optional(),
})

const recurringExpenseUpdateSchema = recurringExpenseSchema.partial()

export async function recurringExpensesRoutes(app: FastifyInstance) {
  app.get('/api/recurring-expenses', { preHandler: [app.authenticate] }, async () => {
    const result = await db.select().from(schema.recurringExpenses)

    return result.map(item => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      period: item.period,
      dayOfMonth: item.dayOfMonth,
      dayOfWeek: item.dayOfWeek,
      source: item.sourceType === 'savings' && item.savingsAccountId
        ? { type: 'savings' as const, savingsAccountId: item.savingsAccountId }
        : { type: 'card' as const },
    }))
  })

  app.post('/api/recurring-expenses', { preHandler: [app.authenticate] }, async (request, reply) => {
    const result = recurringExpenseSchema.safeParse(request.body)

    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: result.error.errors })
    }

    const expense = {
      id: randomUUID(),
      name: result.data.name,
      amount: result.data.amount,
      period: result.data.period,
      dayOfMonth: result.data.dayOfMonth ?? null,
      dayOfWeek: result.data.dayOfWeek ?? null,
      sourceType: result.data.sourceType,
      savingsAccountId: result.data.savingsAccountId ?? null,
    }

    await db.insert(schema.recurringExpenses).values(expense)

    return {
      id: expense.id,
      name: expense.name,
      amount: expense.amount,
      period: expense.period,
      dayOfMonth: expense.dayOfMonth,
      dayOfWeek: expense.dayOfWeek,
      source: expense.sourceType === 'savings' && expense.savingsAccountId
        ? { type: 'savings' as const, savingsAccountId: expense.savingsAccountId }
        : { type: 'card' as const },
    }
  })

  app.put('/api/recurring-expenses/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = recurringExpenseUpdateSchema.safeParse(request.body)

    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: result.error.errors })
    }

    const existing = await db.select().from(schema.recurringExpenses).where(eq(schema.recurringExpenses.id, id))

    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Recurring expense not found' })
    }

    const updateData: Record<string, unknown> = {}
    if (result.data.name !== undefined) updateData.name = result.data.name
    if (result.data.amount !== undefined) updateData.amount = result.data.amount
    if (result.data.period !== undefined) updateData.period = result.data.period
    if (result.data.dayOfMonth !== undefined) updateData.dayOfMonth = result.data.dayOfMonth
    if (result.data.dayOfWeek !== undefined) updateData.dayOfWeek = result.data.dayOfWeek
    if (result.data.sourceType !== undefined) updateData.sourceType = result.data.sourceType
    if (result.data.savingsAccountId !== undefined) updateData.savingsAccountId = result.data.savingsAccountId

    await db.update(schema.recurringExpenses).set(updateData).where(eq(schema.recurringExpenses.id, id))

    const updated = await db.select().from(schema.recurringExpenses).where(eq(schema.recurringExpenses.id, id))
    const item = updated[0]!

    return {
      id: item.id,
      name: item.name,
      amount: item.amount,
      period: item.period,
      dayOfMonth: item.dayOfMonth,
      dayOfWeek: item.dayOfWeek,
      source: item.sourceType === 'savings' && item.savingsAccountId
        ? { type: 'savings' as const, savingsAccountId: item.savingsAccountId }
        : { type: 'card' as const },
    }
  })

  app.delete('/api/recurring-expenses/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const existing = await db.select().from(schema.recurringExpenses).where(eq(schema.recurringExpenses.id, id))

    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Recurring expense not found' })
    }

    await db.delete(schema.recurringExpenses).where(eq(schema.recurringExpenses.id, id))
    return { success: true }
  })
}
