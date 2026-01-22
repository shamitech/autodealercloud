import Fastify from 'fastify'
import cors from '@fastify/cors'

const app = Fastify({
  logger: true,
})

await app.register(cors, {
  origin: true,
})

// Health check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Tenant routes
app.post('/api/v1/tenants', async (request, reply) => {
  // Create tenant
  return { message: 'Tenant creation not implemented yet' }
})

app.get('/api/v1/tenants/:id', async (request: any) => {
  // Get tenant
  return { message: 'Tenant fetch not implemented yet' }
})

// Component routes
app.get('/api/v1/components', async () => {
  // List all shared components
  return { message: 'Component fetch not implemented yet' }
})

app.post('/api/v1/components', async (request, reply) => {
  // Create new component (admin only)
  return { message: 'Component creation not implemented yet' }
})

// Page routes
app.get('/api/v1/tenants/:tenantId/pages', async (request: any) => {
  // List pages for tenant
  return { message: 'Page fetch not implemented yet' }
})

app.post('/api/v1/tenants/:tenantId/pages', async (request: any) => {
  // Create page
  return { message: 'Page creation not implemented yet' }
})

// Content routes
app.put('/api/v1/tenants/:tenantId/content/:contentId', async (request: any) => {
  // Update content
  return { message: 'Content update not implemented yet' }
})

const PORT = process.env.PORT || 3004

try {
  await app.listen({ port: Number(PORT), host: '0.0.0.0' })
  console.log(`API Server running on port ${PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}

export default app
