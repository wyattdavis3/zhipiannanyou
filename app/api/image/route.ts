import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { generateImage, getImageCaption } from '@/lib/image'
import { uploadToR2 } from '@/lib/r2'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({
        success: false,
        message: '请先登录',
        data: null
      }, { status: 401 })
    }
    
    const { prompt } = await request.json()
    
    const tempImageUrl = await generateImage(prompt || 'young man in casual clothes, warm smile, daily life scene')
    const caption = getImageCaption()
    
    let imageUrl = tempImageUrl
    
    try {
      const response = await fetch(tempImageUrl)
      const buffer = await response.arrayBuffer()
      imageUrl = await uploadToR2(Buffer.from(buffer), 'image/png')
    } catch (error) {
      console.error('上传图片到 R2 失败，使用临时链接：', error)
    }
    
    return NextResponse.json({
      success: true,
      message: 'success',
      data: { imageUrl, caption }
    })
  } catch {
    return NextResponse.json({
      success: false,
      message: '生成图片失败',
      data: null
    }, { status: 500 })
  }
}
