import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

// Prisma client will be injected into fastify app
export async function registerTenantRoutes(fastify: FastifyInstance) {
  const prisma = (fastify as any).prisma

  fastify.post('/tenants', async (request: FastifyRequest, reply: FastifyReply) => {
    const { name, slug, domain } = request.body as {
      name?: string
      slug?: string
      domain?: string
    }

    // Validate input
    if (!name || !slug) {
      return reply.status(400).send({
        success: false,
        message: 'Name and slug are required',
      })
    }

    try {
      // Check if slug already exists
      const existingTenant = await prisma.tenant.findUnique({
        where: { slug },
      })

      if (existingTenant) {
        return reply.status(409).send({
          success: false,
          message: 'Slug already exists',
        })
      }

      // Create tenant
      const tenant = await prisma.tenant.create({
        data: {
          name,
          slug,
          domain: domain || null,
        },
      })

      return reply.status(201).send({
        success: true,
        message: 'Tenant created',
        tenant,
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        message: 'Error creating tenant',
      })
    }
  })

  fastify.get('/tenants', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenants = await prisma.tenant.findMany()
      return reply.send({
        success: true,
        tenants,
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        success: false,
        message: 'Error fetching tenants',
      })
    }
  })
}
