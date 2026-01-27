import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function authRoutes(app: FastifyInstance) {
  // Login endpoint
  app.post<{ Body: { email: string; password: string; tenantId: string } }>(
    '/api/v1/auth/login',
    async (request, reply) => {
      try {
        const { email, password, tenantId } = request.body

        if (!email || !password || !tenantId) {
          return reply.status(400).send({
            error: 'Missing email, password, or tenantId',
          })
        }

        // Find user by email and tenant
        const user = await prisma.user.findFirst({
          where: {
            email,
            tenantId,
          },
          include: {
            tenant: true,
          },
        })

        if (!user) {
          return reply.status(401).send({
            error: 'Invalid credentials',
          })
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
          return reply.status(401).send({
            error: 'Invalid credentials',
          })
        }

        // Create JWT token
        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            tenantId: user.tenantId,
            role: user.role,
          },
          process.env.JWT_SECRET || 'your-secret-key-change-in-production',
          { expiresIn: '24h' }
        )

        return reply.send({
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
            name: user.tenant.name,
          },
        })
      } catch (error: any) {
        console.error('Auth error:', error)
        return reply.status(500).send({
          error: error.message,
        })
      }
    }
  )

  // Create user endpoint (for admin to create new users)
  app.post<{ Body: { tenantId: string; email: string; password: string; firstName: string; lastName: string; role: string } }>(
    '/api/v1/auth/users',
    async (request, reply) => {
      try {
        const { tenantId, email, password, firstName, lastName, role } = request.body

        if (!tenantId || !email || !password) {
          return reply.status(400).send({
            error: 'Missing required fields',
          })
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email },
        })

        if (existingUser) {
          return reply.status(409).send({
            error: 'User already exists',
          })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            firstName: firstName || email.split('@')[0],
            lastName: lastName || 'User',
            role: role || 'editor',
            tenantId,
          },
        })

        return reply.status(201).send({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        })
      } catch (error: any) {
        console.error('Create user error:', error)
        return reply.status(500).send({
          error: error.message,
        })
      }
    }
  )

  // Get tenant users
  app.get<{ Params: { tenantId: string } }>(
    '/api/v1/tenants/:tenantId/users',
    async (request, reply) => {
      try {
        const { tenantId } = request.params

        const users = await prisma.user.findMany({
          where: { tenantId },
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

        return reply.send({
          success: true,
          users,
        })
      } catch (error: any) {
        console.error('Get users error:', error)
        return reply.status(500).send({
          error: error.message,
        })
      }
    }
  )
}
