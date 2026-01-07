import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export async function authRoutes(app: FastifyInstance) {
  app.post('/api/auth/login', async (request, reply) => {
    const result = loginSchema.safeParse(request.body)

    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid request body' })
    }

    const { username, password } = result.data
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin'

    if (username !== adminUsername || password !== adminPassword) {
      return reply.status(401).send({ error: 'Invalid credentials' })
    }

    const token = app.jwt.sign({ username })

    reply.setCookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true, username }
  })

  app.get('/api/auth/me', { preHandler: [app.authenticate] }, async (request) => {
    return { username: request.user.username }
  })

  app.post('/api/auth/logout', async (_request, reply) => {
    reply.clearCookie('token', { path: '/' })
    return { success: true }
  })
}
