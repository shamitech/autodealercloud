// Load environment variables FIRST, before any other imports
import 'dotenv/config'

// Set DATABASE_URL fallback if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://autodealercloud:autodealercloud_pass_2026@localhost:5432/autodealercloud'
}

import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'

const app = Fastify({
  logger: true,
})

const prisma = new PrismaClient()

// Register CORS plugin
app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
  preflightContinue: false,
})

// Health check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Parse domain from request to find tenant
async function getTenantByDomain(domain: string) {
  try {
    const customDomain = await prisma.customDomain.findUnique({
      where: { domain },
      include: { tenant: true },
    })
    return customDomain?.tenant
  } catch (error) {
    console.error('Error finding tenant by domain:', error)
    return null
  }
}

// Render published page
async function renderPage(tenantId: string, slug: string) {
  try {
    const page = await prisma.page.findFirst({
      where: {
        tenantId,
        slug,
        status: 'published',
      },
      include: {
        tenant: true,
        template: true,
      },
    })

    if (!page) {
      return null
    }

    return page
  } catch (error) {
    console.error('Error fetching page:', error)
    return null
  }
}

// Catch-all route to serve published pages
app.get('/', async (request: any, reply: any) => {
  try {
    // Get domain from request (in production, nginx sends X-Tenant-Domain header)
    const domain = request.headers['x-tenant-domain'] || request.headers.host
    
    if (!domain) {
      reply.status(400)
      return { error: 'Domain not found' }
    }

    // Find tenant by custom domain
    const tenant = await getTenantByDomain(domain)

    if (!tenant) {
      reply.status(404)
      return {
        error: 'Tenant not found',
        domain,
      }
    }

    // Get the home page (slug: 'home' or first published page)
    const page = await renderPage(tenant.id, 'home')

    if (!page) {
      // If no home page, show a default message
      return {
        message: 'Welcome to your published site',
        tenantName: tenant.name,
        tenantId: tenant.id,
      }
    }

    return {
      success: true,
      page: {
        id: page.id,
        title: page.title,
        slug: page.slug,
        description: page.description,
        content: page.content,
        metadata: page.metadata,
        publishedAt: page.publishedAt,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
      },
    }
  } catch (error: any) {
    reply.status(500)
    return { error: error.message }
  }
})

// Get specific page by slug
app.get('/:slug', async (request: any, reply: any) => {
  try {
    const { slug } = request.params
    const domain = request.headers['x-tenant-domain'] || request.headers.host

    if (!domain) {
      reply.status(400)
      return { error: 'Domain not found' }
    }

    // Find tenant by custom domain
    const tenant = await getTenantByDomain(domain)

    if (!tenant) {
      reply.status(404)
      return {
        error: 'Tenant not found',
        domain,
      }
    }

    // Get page by slug
    const page = await renderPage(tenant.id, slug)

    if (!page) {
      reply.status(404)
      return {
        error: 'Page not found',
        tenantId: tenant.id,
        slug,
      }
    }

    return {
      success: true,
      page: {
        id: page.id,
        title: page.title,
        slug: page.slug,
        description: page.description,
        content: page.content,
        metadata: page.metadata,
        publishedAt: page.publishedAt,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
      },
    }
  } catch (error: any) {
    reply.status(500)
    return { error: error.message }
  }
})

const PORT = process.env.PUBLISH_PORT || 3002

try {
  await app.listen({ port: Number(PORT), host: '0.0.0.0' })
  console.log(`Publish service running on port ${PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}

export default app
