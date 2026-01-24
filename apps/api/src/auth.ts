import { hash, compare } from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const SALT_ROUNDS = 10

export class AuthService {
  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return await hash(password, SALT_ROUNDS)
  }

  /**
   * Compare password with hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await compare(password, hash)
  }

  /**
   * Register new user
   */
  static async register(email: string, password: string, name: string, tenantId?: string) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new Error('User already exists')
    }

    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }

    if (!email || !email.includes('@')) {
      throw new Error('Invalid email')
    }

    const hashedPassword = await this.hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: name.split(' ')[0] || '',
        lastName: name.split(' ').slice(1).join(' ') || '',
        role: 'editor',
        ...(tenantId && { tenantId }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    })

    return user
  }

  /**
   * Login user
   */
  static async login(email: string, password: string) {
    if (!email || !password) {
      throw new Error('Email and password required')
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new Error('Invalid email or password')
    }

    const passwordValid = await this.verifyPassword(password, user.password)

    if (!passwordValid) {
      throw new Error('Invalid email or password')
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }
}
