import type { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from '../db/index.js'

const settingsSchema = z.object({
  currentBalance: z.number(),
})

const DEFAULT_SETTINGS_ID = 'default'

export async function settingsRoutes(app: FastifyInstance) {
  app.get('/api/settings', { preHandler: [app.authenticate] }, async () => {
    const result = await db.select().from(schema.appSettings).where(eq(schema.appSettings.id, DEFAULT_SETTINGS_ID))

    if (result.length === 0) {
      const defaultSettings = { id: DEFAULT_SETTINGS_ID, currentBalance: 0 }
      await db.insert(schema.appSettings).values(defaultSettings)
      return defaultSettings
    }

    return result[0]
  })

  app.put('/api/settings', { preHandler: [app.authenticate] }, async (request, reply) => {
    const result = settingsSchema.safeParse(request.body)

    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: result.error.errors })
    }

    const existing = await db.select().from(schema.appSettings).where(eq(schema.appSettings.id, DEFAULT_SETTINGS_ID))

    if (existing.length === 0) {
      const settings = { id: DEFAULT_SETTINGS_ID, ...result.data }
      await db.insert(schema.appSettings).values(settings)
      return settings
    }

    await db.update(schema.appSettings).set(result.data).where(eq(schema.appSettings.id, DEFAULT_SETTINGS_ID))

    const updated = await db.select().from(schema.appSettings).where(eq(schema.appSettings.id, DEFAULT_SETTINGS_ID))
    return updated[0]
  })
}
