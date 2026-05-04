import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const existingConfig = await prisma.characterConfig.findUnique({
      where: { key: 'base_image_url' }
    })

    if (existingConfig) {
      console.log('base_image_url 配置已存在:', existingConfig.value)
    } else {
      const newConfig = await prisma.characterConfig.create({
        data: {
          key: 'base_image_url',
          value: '/axing-base.webp'
        }
      })
      console.log('成功插入 base_image_url 配置:', newConfig)
    }
  } catch (error) {
    console.error('插入配置失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
