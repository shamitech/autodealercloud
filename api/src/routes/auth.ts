import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

// Hardcoded admin credentials
const ADMIN_USERNAME = 'jaredshami'
const ADMIN_PASSWORD = 'Children$6'

export async function registerAuthRoutes(fastify: FastifyInstance) {
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const { username, password } = request.body as { username?: string; password?: string }

    // Validate input
    if (!username || !password) {
      return reply.status(400).send({
        success: false,
        message: 'Username and password are required',
      })
    }

    // Check credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return reply.send({
        success: true,
        message: 'Authenticated',
        user: {
          id: '1',
          username: ADMIN_USERNAME,
        },
      })
    }

    // Invalid credentials
    return reply.status(401).send({
      success: false,
      message: 'Invalid username or password',
    })
  })

  fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      success: true,
      message: 'Logged out',
    })
  })
}
