import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    await prisma.$executeRaw`ALTER TABLE "Conversation" ADD COLUMN "imageUrl" TEXT;`
    console.log('Successfully added imageUrl column to Conversation table')
  } catch (error) {
    console.error('Error adding column:', error)
    if ((error as any).code === '42701') {
      console.log('Column already exists')
    }
  } finally {
    await prisma.$disconnect()
  }
}

main()