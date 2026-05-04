import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { buildSystemPrompt, callLLM, extractUserInfo } from '@/lib/llm'
import { generateImage, getImageCaption } from '@/lib/image'

const cleanResponse = (text: string): string => {
  const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/gu
  
  let result = text
  
  const bracketPattern = /[（\(](.*?)[）\)]/g
  result = result.replace(bracketPattern, (match, content) => {
    const emojis = content.match(emojiRegex)
    return emojis ? emojis.join('') : ''
  })
  
  return result.trim()
}

const extractUserInfoAsync = async (userId: string, message: string) => {
  try {
    const extractedInfo = await extractUserInfo(message)
    console.log('Extracted user info:', extractedInfo)
    
    if (extractedInfo.key !== null && extractedInfo.value !== null) {
      await prisma.userProfile.upsert({
        where: { userId_key: { userId, key: extractedInfo.key } },
        update: { value: extractedInfo.value },
        create: { userId, key: extractedInfo.key, value: extractedInfo.value }
      })
      console.log(`Saved user profile: ${extractedInfo.key} = ${extractedInfo.value}`)
    }
  } catch (error) {
    console.error('Error extracting user info:', error)
  }
}

export async function POST(request: Request) {
  try {
    console.log('=== Chat API Called ===')
    console.log('Request timestamp:', new Date().toISOString())
    
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      console.log('Session not found or user not logged in')
      return NextResponse.json({
        success: false,
        message: '请先登录',
        data: null
      }, { status: 401 })
    }
    
    console.log('User ID:', session.user.id)
    
    const { message } = await request.json()
    if (!message) {
      console.log('Empty message received')
      return NextResponse.json({
        success: false,
        message: '请输入消息',
        data: null
      }, { status: 400 })
    }
    
    console.log('Message:', message)
    
    let user
    try {
      user = await prisma.user.findUnique({ where: { id: session.user.id } })
    } catch (dbError) {
      console.error('Database error (user lookup):', dbError)
      throw new Error('Database connection failed')
    }
    
    if (!user) {
      console.log('User not found in database')
      return NextResponse.json({
        success: false,
        message: '用户不存在',
        data: null
      }, { status: 404 })
    }
    
    console.log('User found:', user.email)
    
    const imageKeywords = ['想看你', '来张照片', '发张照片', '照片', '图片', '看看你']
    const needsImage = imageKeywords.some(keyword => message.includes(keyword))
    
    let response = ''
    let imageUrl = ''
    
    if (needsImage) {
      console.log('=== Image Generation Triggered ===')
      const config = await prisma.characterConfig.findFirst({
        where: { key: 'base_image_url' },
        select: { value: true }
      })
      
      let baseImageUrl = ''
      if (config?.value) {
        baseImageUrl = config.value
        console.log('Base image URL from DB:', baseImageUrl.substring(0, 50) + '...')
      } else {
        console.error('[Image Error] 数据库中未找到 base_image_url 配置')
        baseImageUrl = process.env.AXING_BASE_IMAGE_URL || ''
        console.log('Falling back to environment variable AXING_BASE_IMAGE_URL:', baseImageUrl ? 'found' : 'not set')
      }
      
      if (baseImageUrl && !baseImageUrl.startsWith('http')) {
        baseImageUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${baseImageUrl}`
        console.log('Converted to full URL:', baseImageUrl.substring(0, 50) + '...')
      }
      
      console.log('Final baseImageUrl:', baseImageUrl ? baseImageUrl.substring(0, 80) + '...' : 'empty')
      
      const prompt = `young man in casual clothes, warm smile, daily life scene, ${message}`
      imageUrl = await generateImage(prompt, baseImageUrl)
      response = getImageCaption()
      console.log('Image generated:', imageUrl ? 'success' : 'failed')
      console.log('Generated image URL:', imageUrl || 'empty')
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
    
    const cleanedResponse = cleanResponse(response)
    
    await prisma.conversation.createMany({
      data: [
        { userId: user.id, role: 'user', content: message },
        { userId: user.id, role: 'assistant', content: cleanedResponse }
      ]
    })
    
    extractUserInfoAsync(user.id, message).catch(console.error)
    
    return NextResponse.json({
      success: true,
      message: 'success',
      data: {
        response: cleanedResponse,
        imageUrl: needsImage ? imageUrl : null
      }
    })
  } catch (error) {
    console.error('=== Chat API Error ===')
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : 'N/A')
    return NextResponse.json({
      success: false,
      message: '对话失败，请稍后再试',
      data: null
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({
        success: false,
        message: '请先登录',
        data: null
      }, { status: 401 })
    }
    
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
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