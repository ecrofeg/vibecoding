import type { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from '../db/index.js'
import { randomUUID } from 'crypto'

const savingsAccountSchema = z.object({
  name: z.string().min(1),
  amount: z.number(),
  annualInterestRate: z.number(),
})

const savingsAccountUpdateSchema = savingsAccountSchema.partial()

export async function savingsAccountsRoutes(app: FastifyInstance) {
  app.get('/api/savings-accounts', { preHandler: [app.authenticate] }, async () => {
    return await db.select().from(schema.savingsAccounts)
  })

  app.post('/api/savings-accounts', { preHandler: [app.authenticate] }, async (request, reply) => {
    const result = savingsAccountSchema.safeParse(request.body)

    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: result.error.errors })
    }

    const account = {
      id: randomUUID(),
      ...result.data,
    }

    await db.insert(schema.savingsAccounts).values(account)
    return account
  })

  app.put('/api/savings-accounts/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = savingsAccountUpdateSchema.safeParse(request.body)

    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: result.error.errors })
    }

    const existing = await db.select().from(schema.savingsAccounts).where(eq(schema.savingsAccounts.id, id))

    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Savings account not found' })
    }

    await db.update(schema.savingsAccounts).set(result.data).where(eq(schema.savingsAccounts.id, id))

    const updated = await db.select().from(schema.savingsAccounts).where(eq(schema.savingsAccounts.id, id))
    return updated[0]
  })

  app.delete('/api/savings-accounts/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const existing = await db.select().from(schema.savingsAccounts).where(eq(schema.savingsAccounts.id, id))

    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Savings account not found' })
    }

    await db.delete(schema.savingsAccounts).where(eq(schema.savingsAccounts.id, id))
    return { success: true }
  })
}
