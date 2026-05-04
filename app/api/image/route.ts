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
    
    if (!tempImageUrl) {
      console.error('Image generation failed: tempImageUrl is empty')
      return NextResponse.json({
        success: false,
        message: '生成图片失败',
        data: null
      }, { status: 500 })
    }
    
    let imageUrl = tempImageUrl
    
    try {
      const imageResponse = await fetch(tempImageUrl)
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
      const fileName = `images/${Date.now()}-${Math.random().toString(36).slice(2)}.png`
      
      console.log('[R2] 开始上传，文件名：', fileName)
      console.log('[R2] R2_ENDPOINT:', process.env.R2_ENDPOINT)
      console.log('[R2] R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME)
      console.log('[R2] R2_PUBLIC_URL:', process.env.R2_PUBLIC_URL)
      
      const permanentUrl = await uploadToR2(imageBuffer, fileName, 'image/png')
      console.log('[R2] 上传成功，永久链接：', permanentUrl)
      imageUrl = permanentUrl
    } catch (r2Error) {
      console.error('[R2] 上传失败，错误：', r2Error)
      console.log('[R2] 降级使用临时链接：', tempImageUrl)
    }
    
    console.log('[Image API] 最终返回给前端的 imageUrl：', imageUrl)
    
    return NextResponse.json({
      success: true,
      message: 'success',
      data: { imageUrl, caption }
    })
  } catch (error) {
    console.error('Image API Error:', error)
    return NextResponse.json({
      success: false,
      message: '生成图片失败',
      data: null
    }, { status: 500 })
  }
}
