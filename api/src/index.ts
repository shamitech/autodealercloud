import Fastify from 'fastify'
import 'dotenv/config'
import { registerAuthRoutes } from './routes/auth'
import { registerTenantRoutes } from './routes/tenants'

// Dynamically import Prisma only when needed
let prismaClient: any = null

async function getPrismaClient() {
  if (!prismaClient) {
    const { PrismaClient } = require('@prisma/client')
    prismaClient = new PrismaClient()
  }
  return prismaClient
}

const app = Fastify({ logger: true })

const PORT = 3001
const HOST = '0.0.0.0'

app.get('/health', async () => {
  return { status: 'ok' }
})

// Initialize Prisma on app startup
app.addHook('onRoute', async () => {
  if (!(app as any).prisma) {
    (app as any).prisma = await getPrismaClient()
  }
})

// Register routes
registerAuthRoutes(app)
registerTenantRoutes(app)

async function start() {
  try {
    await app.listen({ port: PORT, host: HOST })
    console.log(`Server running at http://localhost:${PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
