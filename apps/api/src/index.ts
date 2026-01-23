// Load environment variables FIRST, before any other imports
import 'dotenv/config'

import Fastify from 'fastify'
import { PrismaClient } from '@autodealercloud/database'
import jwt from 'jsonwebtoken'
import { AuthService } from './auth'

const app = Fastify({
  logger: true,
})

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'

// Manually register JSON content-type parser
app.addContentTypeParser('application/json', { parseAs: 'string' }, async (req: any, body: string) => {
  try {
    return JSON.parse(body)
  } catch (err) {
    throw new Error('Invalid JSON')
  }
})

// Add CORS headers manually
app.addHook('onSend', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*')
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
})

// Middleware to verify JWT token
async function authenticate(request: any, reply: any) {
  try {
    const token = request.headers.authorization?.split(' ')[1]

    if (!token) {
      reply.status(401).send({ error: 'No token provided' })
      return
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      request.user = decoded
    } catch (err) {
      reply.status(401).send({ error: 'Invalid token' })
    }
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' })
  }
}

// Health check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// ============================================
// Authentication Routes
// ============================================

// Register
app.post('/api/v1/auth/register', async (request: any, reply: any) => {
  try {
    const { email, password, name, tenantId } = request.body

    const user = await AuthService.register(email, password, name, tenantId)
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

    return { success: true, data: { user, token } }
  } catch (error: any) {
    reply.status(400)
    return { error: error.message }
  }
})

// Login
app.post('/api/v1/auth/login', async (request: any, reply: any) => {
  try {
    const { email, password } = request.body

    const user = await AuthService.login(email, password)
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

    return { success: true, data: { user, token } }
  } catch (error: any) {
    reply.status(401)
    return { error: error.message }
  }
})

// Get current user
app.get('/api/v1/auth/me', { preHandler: authenticate }, async (request: any) => {
  try {
    const userId = request.user.sub
    const user = await AuthService.getUserById(userId)
    return { success: true, data: user }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Verify token
app.post('/api/v1/auth/verify', async (request: any, reply: any) => {
  try {
    const token = request.headers.authorization?.split(' ')[1]

    if (!token) {
      reply.status(401)
      return { error: 'No token provided' }
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      return { success: true, data: decoded }
    } catch (err) {
      reply.status(401)
      return { error: 'Invalid token' }
    }
  } catch (error: any) {
    reply.status(400)
    return { error: error.message }
  }
})

// ============================================
// Tenant Routes
// ============================================

// Create tenant (protected)
app.post('/api/v1/tenants', { preHandler: authenticate }, async (request: any, reply: any) => {
  try {
    const { name, slug, description, email, plan } = request.body

    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        description,
      },
      include: {
        users: true,
      },
    })

    return { success: true, data: tenant }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Get tenant by ID
app.get('/api/v1/tenants/:id', async (request: any) => {
  try {
    const { id } = request.params

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: true,
        pages: true,
        components: true,
      },
    })

    if (!tenant) {
      return { error: 'Tenant not found' }
    }

    return { success: true, data: tenant }
  } catch (error: any) {
    return { error: error.message }
  }
})

// List all tenants
app.get('/api/v1/tenants', async (request: any) => {
  try {
    const { skip = 0, take = 10 } = request.query

    const tenants = await prisma.tenant.findMany({
      skip: parseInt(skip),
      take: parseInt(take),
      include: {
        users: { select: { id: true, email: true, role: true } },
        _count: {
          select: { pages: true, components: true },
        },
      },
    })

    const total = await prisma.tenant.count()

    return { success: true, data: tenants, total }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Update tenant (protected)
app.put('/api/v1/tenants/:id', { preHandler: authenticate }, async (request: any) => {
  try {
    const { id } = request.params
    const { name, description, status } = request.body

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(status && { status }),
      },
    })

    return { success: true, data: tenant }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Delete tenant (protected)
app.delete('/api/v1/tenants/:id', { preHandler: authenticate }, async (request: any) => {
  try {
    const { id } = request.params

    await prisma.tenant.delete({
      where: { id },
    })

    return { success: true, message: 'Tenant deleted' }
  } catch (error: any) {
    return { error: error.message }
  }
})

// ============================================
// User Routes
// ============================================

// Create user (protected)
app.post('/api/v1/users', { preHandler: authenticate }, async (request: any, reply: any) => {
  try {
    const { email, password, name, tenantId, role } = request.body

    const user = await AuthService.register(email, password, name, tenantId)
    return { success: true, data: user }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Get user by ID
app.get('/api/v1/users/:id', async (request: any) => {
  try {
    const { id } = request.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    return { success: true, data: user }
  } catch (error: any) {
    return { error: error.message }
  }
})

// List users for tenant
app.get('/api/v1/tenants/:tenantId/users', async (request: any) => {
  try {
    const { tenantId } = request.params
    const { skip = 0, take = 10 } = request.query

    const users = await prisma.user.findMany({
      where: { tenantId },
      skip: parseInt(skip),
      take: parseInt(take),
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })

    const total = await prisma.user.count({ where: { tenantId } })

    return { success: true, data: users, total }
  } catch (error: any) {
    return { error: error.message }
  }
})

// ============================================
// Component Routes
// ============================================

// List all shared components
app.get('/api/v1/components', async (request: any) => {
  try {
    const { type, category, skip = 0, take = 20 } = request.query

    const components = await prisma.component.findMany({
      where: {
        ...(type && { type }),
        ...(category && { category }),
      },
      skip: parseInt(skip),
      take: parseInt(take),
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { versions: true },
        },
      },
    })

    const total = await prisma.component.count()

    return { success: true, data: components, total }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Create component (protected)
app.post('/api/v1/components', { preHandler: authenticate }, async (request: any) => {
  try {
    const { type, name, slug, description, category, metadata } = request.body

    if (!type || !name || !slug) {
      return { error: 'Type, name, and slug are required' }
    }

    const component = await prisma.component.create({
      data: {
        type,
        name,
        slug,
        description,
        category,
        metadata: metadata || {},
      },
    })

    return { success: true, data: component }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Get component by ID
app.get('/api/v1/components/:id', async (request: any) => {
  try {
    const { id } = request.params

    const component = await prisma.component.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
        },
        usedInComponents: {
          include: { parentComponent: true },
        },
      },
    })

    if (!component) {
      return { error: 'Component not found' }
    }

    return { success: true, data: component }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Create component version (protected)
app.post('/api/v1/components/:componentId/versions', { preHandler: authenticate }, async (request: any) => {
  try {
    const { componentId } = request.params
    const { version, htmlContent, cssContent, jsContent } = request.body

    if (!version) {
      return { error: 'Version is required' }
    }

    const componentVersion = await prisma.componentVersion.create({
      data: {
        version,
        htmlContent,
        cssContent,
        jsContent,
        componentId,
      },
    })

    return { success: true, data: componentVersion }
  } catch (error: any) {
    return { error: error.message }
  }
})

// ============================================
// Page Routes
// ============================================

// List pages for tenant
app.get('/api/v1/tenants/:tenantId/pages', async (request: any) => {
  try {
    const { tenantId } = request.params
    const { status, skip = 0, take = 10 } = request.query

    const pages = await prisma.page.findMany({
      where: {
        tenantId,
        ...(status && { status }),
      },
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.page.count({
      where: { tenantId, ...(status && { status }) },
    })

    return { success: true, data: pages, total }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Create page (protected)
app.post('/api/v1/tenants/:tenantId/pages', { preHandler: authenticate }, async (request: any) => {
  try {
    const { tenantId } = request.params
    const { title, slug, description, content, metadata, templateId } = request.body

    if (!title || !slug) {
      return { error: 'Title and slug are required' }
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        description,
        content: content || {},
        metadata: metadata || {},
        templateId,
        tenantId,
      },
    })

    return { success: true, data: page }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Get page by ID
app.get('/api/v1/pages/:pageId', async (request: any) => {
  try {
    const { pageId } = request.params

    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: {
        tenant: { select: { id: true, name: true } },
        template: true,
      },
    })

    if (!page) {
      return { error: 'Page not found' }
    }

    return { success: true, data: page }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Update page (protected)
app.put('/api/v1/pages/:pageId', { preHandler: authenticate }, async (request: any) => {
  try {
    const { pageId } = request.params
    const { title, description, content, metadata, status, templateId } = request.body

    const page = await prisma.page.update({
      where: { id: pageId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(content && { content }),
        ...(metadata && { metadata }),
        ...(status && { status }),
        ...(templateId && { templateId }),
      },
    })

    return { success: true, data: page }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Publish page (protected)
app.post('/api/v1/pages/:pageId/publish', { preHandler: authenticate }, async (request: any) => {
  try {
    const { pageId } = request.params

    const page = await prisma.page.update({
      where: { id: pageId },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    })

    return { success: true, data: page, message: 'Page published' }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Delete page (protected)
app.delete('/api/v1/pages/:pageId', { preHandler: authenticate }, async (request: any) => {
  try {
    const { pageId } = request.params

    await prisma.page.delete({
      where: { id: pageId },
    })

    return { success: true, message: 'Page deleted' }
  } catch (error: any) {
    return { error: error.message }
  }
})

// ============================================
// Content Routes
// ============================================

// Get content for page
app.get('/api/v1/pages/:pageId/content', async (request: any) => {
  try {
    const { pageId } = request.params

    const content = await prisma.content.findMany({
      where: { pageId },
    })

    return { success: true, data: content }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Update content (protected)
app.put('/api/v1/content/:contentId', { preHandler: authenticate }, async (request: any) => {
  try {
    const { contentId } = request.params
    const { data } = request.body

    const content = await prisma.content.update({
      where: { id: contentId },
      data: {
        data: data || {},
      },
    })

    return { success: true, data: content }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Create content (protected)
app.post('/api/v1/pages/:pageId/content', { preHandler: authenticate }, async (request: any) => {
  try {
    const { pageId } = request.params
    const { tenantId, componentPath, componentType, data } = request.body

    if (!tenantId || !componentPath) {
      return { error: 'tenantId and componentPath are required' }
    }

    const content = await prisma.content.create({
      data: {
        pageId,
        tenantId,
        componentPath,
        componentType,
        data: data || {},
      },
    })

    return { success: true, data: content }
  } catch (error: any) {
    return { error: error.message }
  }
})

// ============================================
// Analytics Routes
// ============================================

// Track analytics event (protected)
app.post('/api/v1/analytics/events', { preHandler: authenticate }, async (request: any) => {
  try {
    const { tenantId, eventType, data } = request.body

    if (!tenantId || !eventType) {
      return { error: 'tenantId and eventType are required' }
    }

    const event = await prisma.analyticsEvent.create({
      data: {
        tenantId,
        eventType,
        data: data || {},
      },
    })

    return { success: true, data: event }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Get analytics for tenant
app.get('/api/v1/tenants/:tenantId/analytics', async (request: any) => {
  try {
    const { tenantId } = request.params
    const { eventType, days = 7 } = request.query

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))

    const events = await prisma.analyticsEvent.findMany({
      where: {
        tenantId,
        createdAt: { gte: startDate },
        ...(eventType && { eventType }),
      },
      orderBy: { createdAt: 'desc' },
    })

    const summary = {
      totalEvents: events.length,
      eventTypes: [...new Set(events.map((e: any) => e.eventType))],
      byType: events.reduce(
        (acc: any, event: any) => {
          acc[event.eventType] = (acc[event.eventType] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
    }

    return { success: true, data: { events, summary } }
  } catch (error: any) {
    return { error: error.message }
  }
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
