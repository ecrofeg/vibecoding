import type { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from '../db/index.js'
import { randomUUID } from 'crypto'

const cardSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['debit', 'credit']),
  color: z.string().min(1),
})

const cardUpdateSchema = cardSchema.partial()

export async function cardsRoutes(app: FastifyInstance) {
  app.get('/api/cards', { preHandler: [app.authenticate] }, async () => {
    const result = await db.select().from(schema.cards)
    return result
  })

  app.post('/api/cards', { preHandler: [app.authenticate] }, async (request, reply) => {
    const result = cardSchema.safeParse(request.body)

    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: result.error.errors })
    }

    const card = {
      id: randomUUID(),
      ...result.data,
    }

    await db.insert(schema.cards).values(card)
    return card
  })

  app.put('/api/cards/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = cardUpdateSchema.safeParse(request.body)

    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: result.error.errors })
    }

    const existing = await db.select().from(schema.cards).where(eq(schema.cards.id, id))

    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Card not found' })
    }

    await db.update(schema.cards).set(result.data).where(eq(schema.cards.id, id))

    const updated = await db.select().from(schema.cards).where(eq(schema.cards.id, id))
    return updated[0]
  })

  app.delete('/api/cards/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const existing = await db.select().from(schema.cards).where(eq(schema.cards.id, id))

    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Card not found' })
    }

    await db.delete(schema.cards).where(eq(schema.cards.id, id))
    return { success: true }
  })
}
