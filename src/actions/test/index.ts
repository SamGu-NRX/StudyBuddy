import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    await prisma.user.create({
      data: {
        firstName: 'Rich',
        lastName: 'Hickey',
        email: 'hello@prisma.com',
        password: 'hello',
      },
    })

    const allUsers = await prisma.user.findMany();
    console.dir(allUsers, { depth: null })
  }

  main()
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })