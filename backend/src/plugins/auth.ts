import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { username: string }
    user: { username: string }
  }
}

export async function registerAuth(app: FastifyInstance) {
  await app.register(cookie)

  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    cookie: {
      cookieName: 'token',
      signed: false,
    },
  })

  app.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()
    } catch {
      reply.status(401).send({ error: 'Unauthorized' })
    }
  })
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}
