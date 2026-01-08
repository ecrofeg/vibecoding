import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { username: string }
    user: { username: string }
  }
}

const COOKIE_MAX_AGE = 60 * 60 // 1 hour

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: COOKIE_MAX_AGE,
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

      const newToken = app.jwt.sign({ username: request.user.username })
      reply.setCookie('token', newToken, cookieOptions)
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
