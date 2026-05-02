import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { generateImage, getImageCaption } from '@/lib/image'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: '请先登录',
        data: null
      }, { status: 401 })
    }
    
    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: '登录已过期，请重新登录',
        data: null
      }, { status: 401 })
    }
    
    const { prompt } = await request.json()
    
    const imageUrl = await generateImage(prompt || 'young man in casual clothes, warm smile, daily life scene')
    const caption = getImageCaption()
    
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
