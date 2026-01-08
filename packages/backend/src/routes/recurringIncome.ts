import type { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from '../db/index.js'
import { randomUUID } from 'crypto'

const recurringIncomeSchema = z.object({
  name: z.string().min(1),
  amount: z.number(),
  period: z.enum(['weekly', 'monthly', 'monthly_on_day']),
  dayOfMonth: z.number().optional(),
  dayOfWeek: z.number().optional(),
  destinationType: z.enum(['card', 'savings']),
  savingsAccountId: z.string().optional(),
})

const recurringIncomeUpdateSchema = recurringIncomeSchema.partial()

export async function recurringIncomeRoutes(app: FastifyInstance) {
  app.get('/api/recurring-income', { preHandler: [app.authenticate] }, async () => {
    const result = await db.select().from(schema.recurringIncome)

    return result.map(item => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      period: item.period,
      dayOfMonth: item.dayOfMonth,
      dayOfWeek: item.dayOfWeek,
      destination: item.destinationType === 'savings' && item.savingsAccountId
        ? { type: 'savings' as const, savingsAccountId: item.savingsAccountId }
        : { type: 'card' as const },
    }))
  })

  app.post('/api/recurring-income', { preHandler: [app.authenticate] }, async (request, reply) => {
    const result = recurringIncomeSchema.safeParse(request.body)

    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: result.error.errors })
    }

    const income = {
      id: randomUUID(),
      name: result.data.name,
      amount: result.data.amount,
      period: result.data.period,
      dayOfMonth: result.data.dayOfMonth ?? null,
      dayOfWeek: result.data.dayOfWeek ?? null,
      destinationType: result.data.destinationType,
      savingsAccountId: result.data.savingsAccountId ?? null,
    }

    await db.insert(schema.recurringIncome).values(income)

    return {
      id: income.id,
      name: income.name,
      amount: income.amount,
      period: income.period,
      dayOfMonth: income.dayOfMonth,
      dayOfWeek: income.dayOfWeek,
      destination: income.destinationType === 'savings' && income.savingsAccountId
        ? { type: 'savings' as const, savingsAccountId: income.savingsAccountId }
        : { type: 'card' as const },
    }
  })

  app.put('/api/recurring-income/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = recurringIncomeUpdateSchema.safeParse(request.body)

    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: result.error.errors })
    }

    const existing = await db.select().from(schema.recurringIncome).where(eq(schema.recurringIncome.id, id))

    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Recurring income not found' })
    }

    const updateData: Record<string, unknown> = {}
    if (result.data.name !== undefined) updateData.name = result.data.name
    if (result.data.amount !== undefined) updateData.amount = result.data.amount
    if (result.data.period !== undefined) updateData.period = result.data.period
    if (result.data.dayOfMonth !== undefined) updateData.dayOfMonth = result.data.dayOfMonth
    if (result.data.dayOfWeek !== undefined) updateData.dayOfWeek = result.data.dayOfWeek
    if (result.data.destinationType !== undefined) updateData.destinationType = result.data.destinationType
    if (result.data.savingsAccountId !== undefined) updateData.savingsAccountId = result.data.savingsAccountId

    await db.update(schema.recurringIncome).set(updateData).where(eq(schema.recurringIncome.id, id))

    const updated = await db.select().from(schema.recurringIncome).where(eq(schema.recurringIncome.id, id))
    const item = updated[0]!

    return {
      id: item.id,
      name: item.name,
      amount: item.amount,
      period: item.period,
      dayOfMonth: item.dayOfMonth,
      dayOfWeek: item.dayOfWeek,
      destination: item.destinationType === 'savings' && item.savingsAccountId
        ? { type: 'savings' as const, savingsAccountId: item.savingsAccountId }
        : { type: 'card' as const },
    }
  })

  app.delete('/api/recurring-income/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const existing = await db.select().from(schema.recurringIncome).where(eq(schema.recurringIncome.id, id))

    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Recurring income not found' })
    }

    await db.delete(schema.recurringIncome).where(eq(schema.recurringIncome.id, id))
    return { success: true }
  })
}
