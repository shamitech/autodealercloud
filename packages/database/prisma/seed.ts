// Prisma migration template for initial setup
// Run: npm run db:migrate

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@autodealercloud.com',
      password: await bcrypt.hash('ChangeMe123!', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
    },
  })

  console.log('Created admin user:', adminUser.email)

  // Create core component atoms
  const buttonAtom = await prisma.component.create({
    data: {
      type: 'atom',
      name: 'Button',
      slug: 'button',
      category: 'form',
      description: 'Clickable button component',
      metadata: {
        props: {
          text: 'string',
          href: 'string',
          variant: 'primary|secondary|danger',
          size: 'small|medium|large',
        },
      },
    },
  })

  const inputAtom = await prisma.component.create({
    data: {
      type: 'atom',
      name: 'Input',
      slug: 'input',
      category: 'form',
      description: 'Text input field',
      metadata: {
        props: {
          type: 'text|email|password|number',
          placeholder: 'string',
          required: 'boolean',
        },
      },
    },
  })

  const imageAtom = await prisma.component.create({
    data: {
      type: 'atom',
      name: 'Image',
      slug: 'image',
      category: 'content',
      description: 'Image component',
      metadata: {
        props: {
          src: 'string',
          alt: 'string',
          width: 'number',
          height: 'number',
        },
      },
    },
  })

  const textAtom = await prisma.component.create({
    data: {
      type: 'atom',
      name: 'Text',
      slug: 'text',
      category: 'content',
      description: 'Text content component',
      metadata: {
        props: {
          content: 'string',
          variant: 'body|heading|caption',
          size: 'small|medium|large',
        },
      },
    },
  })

  // Create molecules
  const cardMolecule = await prisma.component.create({
    data: {
      type: 'molecule',
      name: 'Card',
      slug: 'card',
      category: 'layout',
      description: 'Card container component',
    },
  })

  const teaserContentMolecule = await prisma.component.create({
    data: {
      type: 'molecule',
      name: 'Teaser Content',
      slug: 'teaser-content',
      category: 'content',
      description: 'Title, subtitle, and description component group',
      metadata: {
        props: {
          title: 'string',
          subtitle: 'string',
          description: 'string',
        },
      },
    },
  })

  // Create organisms
  const heroOrganism = await prisma.component.create({
    data: {
      type: 'organism',
      name: 'Hero',
      slug: 'hero',
      category: 'layout',
      description: 'Hero section with background, title, and CTA',
    },
  })

  const navbarOrganism = await prisma.component.create({
    data: {
      type: 'organism',
      name: 'Navbar',
      slug: 'navbar',
      category: 'navigation',
      description: 'Navigation bar component',
    },
  })

  console.log('Created core components')
  console.log('Database seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
