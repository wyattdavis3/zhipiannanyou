import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { buildSystemPrompt, callLLM, extractUserInfo } from '@/lib/llm'
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
    
    const { message } = await request.json()
    if (!message) {
      return NextResponse.json({
        success: false,
        message: '请输入消息',
        data: null
      }, { status: 400 })
    }
    
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
    if (!user) {
      return NextResponse.json({
        success: false,
        message: '用户不存在',
        data: null
      }, { status: 404 })
    }
    
    const imageKeywords = ['想看你', '来张照片', '发张照片', '照片', '图片', '看看你']
    const needsImage = imageKeywords.some(keyword => message.includes(keyword))
    
    let response = ''
    let imageUrl = ''
    
    if (needsImage) {
      const prompt = `young man in casual clothes, warm smile, daily life scene, ${message}`
      imageUrl = await generateImage(prompt)
      response = getImageCaption()
    } else {
      const systemPrompt = await buildSystemPrompt(user.id)
      
      const recentMessages = await prisma.conversation.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
      
      const history = recentMessages.reverse().map(m => ({
        role: m.role,
        content: m.content
      }))
      
      console.log('=== Chat Context Debug ===')
      console.log('History messages count:', history.length)
      console.log('History:', JSON.stringify(history, null, 2))
      console.log('Current message:', message)
      console.log('=========================')
      
      response = await callLLM(systemPrompt, [...history, { role: 'user', content: message }])
      console.log('LLM Response:', response)
      console.log('VOLC_CHAT_MODEL:', process.env.VOLC_CHAT_MODEL)
      console.log('VOLC_API_KEY:', process.env.VOLC_API_KEY)
    }
    
    await prisma.conversation.createMany({
      data: [
        { userId: user.id, role: 'user', content: message },
        { userId: user.id, role: 'assistant', content: response }
      ]
    })
    
    const extractedInfo = extractUserInfo(message)
    for (const info of extractedInfo) {
      await prisma.userProfile.upsert({
        where: { userId_key: { userId: user.id, key: info.key } },
        update: { value: info.value },
        create: { userId: user.id, key: info.key, value: info.value }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'success',
      data: {
        response,
        imageUrl: needsImage ? imageUrl : null
      }
    })
  } catch {
    return NextResponse.json({
      success: false,
      message: '对话失败，请稍后再试',
      data: null
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
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
    
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
    if (!user) {
      return NextResponse.json({
        success: false,
        message: '用户不存在',
        data: null
      }, { status: 404 })
    }
    
    const messages = await prisma.conversation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' }
    })
    
    return NextResponse.json({
      success: true,
      message: 'success',
      data: {
        messages
      }
    })
  } catch {
    return NextResponse.json({
      success: false,
      message: '获取对话失败',
      data: null
    }, { status: 500 })
  }
}
