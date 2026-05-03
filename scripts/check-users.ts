import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('=== Checking Database Connection ===')
    
    const users = await prisma.user.findMany()
    console.log(`Total users in database: ${users.length}`)
    
    if (users.length > 0) {
      console.log('=== User List ===')
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}, Email: ${user.email}`)
      })
    } else {
      console.log('No users found in database')
    }
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('Database connection error:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

main()