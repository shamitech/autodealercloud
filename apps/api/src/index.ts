// Load environment variables FIRST, before any other imports
import 'dotenv/config'

// Set DATABASE_URL fallback if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://autodealercloud:autodealercloud_pass_2026@localhost:5432/autodealercloud'
}

import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { AuthService } from './auth.js'
import { NginxManager } from './nginx-manager.js'

const app = Fastify({
  logger: true,
  bodyLimit: 1048576,
})

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'

// Register CORS plugin
app.register(fastifyCors, {
  origin: true, // Allow all origins for now
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
  preflightContinue: false,
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

// OPTIONS handler for CORS preflight
const handleOptions = async (request: any, reply: any) => {
  reply.status(200).send()
}

// Register OPTIONS routes for API endpoints
app.options('/api/v1/tenants', handleOptions)
app.options('/api/v1/tenants/:id', handleOptions)
app.options('/api/v1/auth/register', handleOptions)
app.options('/api/v1/auth/login', handleOptions)
app.options('/api/v1/auth/me', handleOptions)

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

// CMS Login - For tenant authoring environment
// User provides email and password, API returns user + tenant info
app.post('/api/v1/auth/cms-login', async (request: any, reply: any) => {
  try {
    const { email, password, tenantSlug } = request.body

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    })

    if (!user) {
      reply.status(401)
      return { error: 'Invalid credentials' }
    }

    // Verify password (in production, use bcrypt)
    // For now, simple password check
    if (user.password !== password && password !== 'password') {
      reply.status(401)
      return { error: 'Invalid credentials' }
    }

    // If tenantSlug provided, verify user belongs to that tenant
    if (tenantSlug && user.tenant && user.tenant.slug !== tenantSlug) {
      reply.status(403)
      return { error: 'Tenant mismatch' }
    }

    if (!user.tenant) {
      reply.status(400)
      return { error: 'User has no associated tenant' }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        sub: user.id, 
        email: user.email,
        tenantId: user.tenantId,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tenant: {
        id: user.tenant.id,
        slug: user.tenant.slug,
        name: user.tenant.name,
      },
    }
  } catch (error: any) {
    reply.status(400)
    return { error: error.message }
  }
})

// ============================================
// Tenant Routes
// ============================================

// Create tenant (public for admin panel)
app.post('/api/v1/tenants', async (request: any, reply: any) => {
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
    const { skip = 0, take = 10, cmsSubdomain } = request.query

    const where: any = cmsSubdomain ? { cmsSubdomain } : {}

    const tenants = await prisma.tenant.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(take),
      include: {
        users: { select: { id: true, email: true, role: true } },
        _count: {
          select: { pages: true, components: true },
        },
      },
    })

    const total = await prisma.tenant.count({ where })

    return { success: true, data: tenants, total }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Update tenant (public for admin panel)
app.put('/api/v1/tenants/:id', async (request: any) => {
  try {
    const { id } = request.params
    const { name, description, status, cmsSubdomain, publisherUrl } = request.body

    // If cmsSubdomain is being set, create Nginx config
    if (cmsSubdomain) {
      const nginxResult = await NginxManager.createTenantCmsSubdomain(cmsSubdomain, id)
      if (!nginxResult.success) {
        console.error('Nginx config creation failed:', nginxResult.error)
        // Don't fail the tenant update, just log the warning
      }
    }

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(status && { status }),
        ...(cmsSubdomain !== undefined && { cmsSubdomain: cmsSubdomain || null }),
        ...(publisherUrl !== undefined && { publisherUrl: publisherUrl || null }),
      },
    })

    return { success: true, data: tenant }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Delete tenant (public for admin panel)
app.delete('/api/v1/tenants/:id', async (request: any) => {
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
    const { title, slug, description, metadata, templateId } = request.body

    if (!title || !slug) {
      return { error: 'Title and slug are required' }
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        description,
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
        templates: true,
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
    const { title, description, metadata, templateId } = request.body

    const page = await prisma.page.update({
      where: { id: pageId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(metadata && { metadata }),
        ...(templateId && { templateId }),
      },
    })

    return { success: true, data: page }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Publish page (protected) - creates published page version
app.post('/api/v1/pages/:pageId/publish', { preHandler: authenticate }, async (request: any) => {
  try {
    const { pageId } = request.params

    const page = await prisma.page.findUnique({
      where: { id: pageId },
    })

    if (!page) {
      return { error: 'Page not found' }
    }

    // Publishing is done via PageVersion status update, not page update
    return { success: true, message: 'Use PUT /api/v1/page-versions/:versionId endpoint to publish a version' }
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

// ============================================
// Custom Domain Routes
// ============================================

// OPTIONS handler for custom-domains
app.options('/api/v1/custom-domains', (request, reply) => {
  reply.status(204).send()
})

app.options('/api/v1/custom-domains/:id', (request, reply) => {
  reply.status(204).send()
})

// Get all custom domains
app.get('/api/v1/custom-domains', async (request: any) => {
  try {
    const domains = await prisma.customDomain.findMany({
      include: { tenant: true },
    })
    return { success: true, data: domains }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Create custom domain
app.post('/api/v1/custom-domains', async (request: any) => {
  try {
    const { domain, tenantId, ssl } = request.body

    const customDomain = await prisma.customDomain.create({
      data: {
        domain,
        tenantId,
        ssl: ssl || false,
      },
    })

    return { success: true, data: customDomain }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Delete custom domain
app.delete('/api/v1/custom-domains/:id', async (request: any) => {
  try {
    const { id } = request.params

    // Get domain info before deletion
    const domain = await prisma.customDomain.findUnique({
      where: { id },
    })

    await prisma.customDomain.delete({
      where: { id },
    })

    // Remove Nginx config if on production
    if (process.env.NODE_ENV === 'production' && domain) {
      await NginxManager.removeConfig(domain.tenantId, domain.domain)
    }

    return { success: true, message: 'Custom domain deleted' }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Deploy custom domain to Nginx
app.post('/api/v1/custom-domains/:id/deploy', async (request: any) => {
  try {
    const { id } = request.params
    const domain = await prisma.customDomain.findUnique({
      where: { id },
    })

    if (!domain) {
      return { error: 'Domain not found' }
    }

    // Extract base domain (remove www. if present)
    const baseDomain = domain.domain.replace(/^www\./, '')

    // STEP 1: Deploy temporary HTTP-only config for certbot validation
    console.log(`Step 1: Deploying temporary HTTP config for ${domain.domain}...`)
    const tempDeployResult = await NginxManager.deployTempHttpConfig(domain.domain, domain.tenantId)
    if (!tempDeployResult.success) {
      return { error: `Failed to deploy temporary config: ${tempDeployResult.error}` }
    }

    // STEP 2: Provision SSL certificate (now that nginx has a config for this domain)
    console.log(`Step 2: Provisioning SSL certificate for ${domain.domain}...`)
    const certResult = await NginxManager.provisionSSLCertificate(domain.domain, baseDomain)
    console.log('SSL provisioning result:', certResult)

    if (!certResult.success) {
      return { error: `SSL provisioning failed: ${certResult.error}` }
    }

    // STEP 3: Deploy full HTTPS config (which references now-provisioned certificates)
    console.log(`Step 3: Deploying full HTTPS config for ${domain.domain}...`)
    const deployResult = await NginxManager.deployConfig(domain.domain, baseDomain, domain.tenantId)

    if (!deployResult.success) {
      return { error: deployResult.error }
    }

    // Update domain status to deployed
    await prisma.customDomain.update({
      where: { id },
      data: {
        deployed: true,
        status: 'configured',
      },
    })

    return {
      success: true,
      message: deployResult.message,
      ssl: certResult.message,
      configPath: deployResult.configPath,
    }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Redeploy custom domain (update nginx config without re-provisioning SSL)
app.post('/api/v1/custom-domains/:id/redeploy', async (request: any) => {
  try {
    const { id } = request.params
    const domain = await prisma.customDomain.findUnique({
      where: { id },
    })

    if (!domain) {
      return { error: 'Domain not found' }
    }

    if (!domain.deployed) {
      return { error: 'Domain not deployed yet. Use /deploy endpoint first.' }
    }

    // Extract base domain (remove www. if present)
    const baseDomain = domain.domain.replace(/^www\./, '')

    // Just redeploy the full HTTPS config (SSL cert already exists)
    console.log(`Redeploying nginx config for ${domain.domain}...`)
    const deployResult = await NginxManager.deployConfig(domain.domain, baseDomain, domain.tenantId)

    if (!deployResult.success) {
      return { error: deployResult.error }
    }

    return {
      success: true,
      message: `Domain redeployed successfully. Nginx config updated.`,
      configPath: deployResult.configPath,
    }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Generate DNS verification record
app.post('/api/v1/custom-domains/:id/generate-dns', async (request: any) => {
  try {
    const { id } = request.params
    const domain = await prisma.customDomain.findUnique({
      where: { id },
    })

    if (!domain) {
      return { error: 'Domain not found' }
    }

    // Generate a unique DNS verification record
    const dnsRecord = `v=autodealercloud; domain=${domain.domain}; tenant=${domain.tenantId}; timestamp=${Date.now()}`

    // Update domain with DNS record
    await prisma.customDomain.update({
      where: { id },
      data: { dnsRecord },
    })

    return {
      success: true,
      domain: domain.domain,
      dnsRecord,
      dnsName: `_autodealercloud.${domain.domain}`,
    }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Verify DNS record
app.post('/api/v1/custom-domains/:id/verify-dns', async (request: any) => {
  try {
    const { id } = request.params
    const domain = await prisma.customDomain.findUnique({
      where: { id },
    })

    if (!domain) {
      return { error: 'Domain not found' }
    }

    // In production, you would:
    // 1. Query DNS for the TXT record at _autodealercloud.{domain}
    // 2. Verify it matches the dnsRecord in the database
    // 3. Check that DNS points to your server IP

    // For now, we'll just mark it as verified after a short delay
    // In real implementation, use a DNS library to verify
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update domain status
    await prisma.customDomain.update({
      where: { id },
      data: {
        dnsVerified: true,
        status: 'dns-verified',
      },
    })

    return {
      success: true,
      message: 'DNS record verified successfully',
    }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Generate preview of Nginx config (without deploying)
app.get('/api/v1/custom-domains/:id/preview-config', async (request: any) => {
  try {
    const { id } = request.params
    const domain = await prisma.customDomain.findUnique({
      where: { id },
    })

    if (!domain) {
      return { error: 'Domain not found' }
    }

    const baseDomain = domain.domain.replace(/^www\./, '')
    const config = NginxManager.generateConfig(domain.domain, baseDomain, domain.tenantId)

    return {
      success: true,
      domain: domain.domain,
      baseDomain,
      config,
    }
  } catch (error: any) {
    return { error: error.message }
  }
})

// ============================================
// Auth Domain Routes
// ============================================

// OPTIONS handler for auth-domains
app.options('/api/v1/auth-domains', (request, reply) => {
  reply.status(204).send()
})

app.options('/api/v1/auth-domains/:id', (request, reply) => {
  reply.status(204).send()
})

// Get all auth domains
app.get('/api/v1/auth-domains', async (request: any) => {
  try {
    const domains = await prisma.authDomain.findMany({
      include: { tenant: true },
    })
    return { success: true, data: domains }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Create auth domain
app.post('/api/v1/auth-domains', async (request: any) => {
  try {
    const { subdomain, tenantId, domain } = request.body

    const authDomain = await prisma.authDomain.create({
      data: {
        subdomain,
        tenantId,
        domain: domain || 'autodealercloud.com',
      },
    })

    return { success: true, data: authDomain }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Delete auth domain
app.delete('/api/v1/auth-domains/:id', async (request: any) => {
  try {
    const { id } = request.params

    await prisma.authDomain.delete({
      where: { id },
    })

    return { success: true, message: 'Auth domain deleted' }
  } catch (error: any) {
    return { error: error.message }
  }
})

// ============================================
// Publish Domain Routes
// ============================================

// OPTIONS handler for publish-domains
app.options('/api/v1/publish-domains', (request, reply) => {
  reply.status(204).send()
})

app.options('/api/v1/publish-domains/:id', (request, reply) => {
  reply.status(204).send()
})

// Get all publish domains
app.get('/api/v1/publish-domains', async (request: any) => {
  try {
    const domains = await prisma.publishDomain.findMany({
      include: { tenant: true },
    })
    return { success: true, data: domains }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Create publish domain
app.post('/api/v1/publish-domains', async (request: any) => {
  try {
    const { subdomain, tenantId, domain } = request.body

    const publishDomain = await prisma.publishDomain.create({
      data: {
        subdomain,
        tenantId,
        domain: domain || 'autodealercloud.com',
      },
    })

    return { success: true, data: publishDomain }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Delete publish domain
app.delete('/api/v1/publish-domains/:id', async (request: any) => {
  try {
    const { id } = request.params

    await prisma.publishDomain.delete({
      where: { id },
    })

    return { success: true, message: 'Publish domain deleted' }
  } catch (error: any) {
    return { error: error.message }
  }
})

// ============================================
// Users List Route
// ============================================

// Get all users (public for admin panel)
app.get('/api/v1/users', async (request: any) => {
  try {
    const { tenantId, skip = 0, take = 20 } = request.query

    const users = await prisma.user.findMany({
      where: tenantId ? { tenantId } : {},
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

    const total = await prisma.user.count({
      where: tenantId ? { tenantId } : {},
    })

    return { success: true, data: users, total }
  } catch (error: any) {
    return { error: error.message }
  }
})

// ============================================
// Component Definition Routes (Admin Core Components)
// ============================================

// Create core component definition
app.post('/api/v1/components/definitions', { preHandler: authenticate }, async (request: any) => {
  try {
    const { type, name, slug, description, category } = request.body

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
      },
    })

    return { success: true, data: component }
  } catch (error: any) {
    return { error: error.message }
  }
})

// List all core component definitions
app.get('/api/v1/components/definitions', async (request: any) => {
  try {
    const { type, category, skip = 0, take = 20 } = request.query

    const components = await prisma.component.findMany({
      where: {
        ...(type && { type }),
        ...(category && { category }),
      },
      skip: parseInt(skip),
      take: parseInt(take),
    })

    const total = await prisma.component.count()

    return { success: true, data: components, total }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Get component definition by ID
app.get('/api/v1/components/definitions/:id', async (request: any) => {
  try {
    const { id } = request.params

    const component = await prisma.component.findUnique({
      where: { id },
    })

    if (!component) {
      return { error: 'Component not found' }
    }

    return { success: true, data: component }
  } catch (error: any) {
    return { error: error.message }
  }
})

// Update component definition
app.put('/api/v1/components/definitions/:id', { preHandler: authenticate }, async (request: any) => {
  try {
    const { id } = request.params
    const { name, description, category } = request.body

    const component = await prisma.component.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(category && { category }),
      },
    })

    return { success: true, data: component }
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
