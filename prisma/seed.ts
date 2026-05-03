import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const existingConfig = await prisma.characterConfig.findFirst({
    where: { key: 'base_image_url' }
  })

  if (!existingConfig) {
    await prisma.characterConfig.create({
      data: {
        key: 'base_image_url',
        value: 'http://localhost:3002/axing-base.webp'
      }
    })
    console.log('Created base_image_url config')
  } else {
    console.log('base_image_url config already exists')
  }
}

main()
  .catch((e: unknown) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
