import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { email, password, turnstileToken } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: '邮箱和密码不能为空',
        data: null
      }, { status: 400 })
    }

    if (!turnstileToken) {
      return NextResponse.json({
        success: false,
        message: '请完成人机验证',
        data: null
      }, { status: 400 })
    }

    const secret = process.env.TURNSTILE_SECRET_KEY
    if (!secret) {
      return NextResponse.json({
        success: false,
        message: '服务器配置错误',
        data: null
      }, { status: 500 })
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret,
        response: turnstileToken,
      }),
    })

    const data = await response.json()
    
    if (!data.success) {
      return NextResponse.json({
        success: false,
        message: '人机验证失败',
        data: null
      }, { status: 403 })
    }
    
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: '这个邮箱已经被注册了哦',
        data: null
      }, { status: 400 })
    }
    
    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        dailyLimit: 20,
        todayUsed: 0,
        lastUsedDate: new Date().toISOString().split('T')[0]
      }
    })
    
    // 注册成功后发欢迎邮件
    try {
      await sendWelcomeEmail(user.email, user.name ?? user.email)
    } catch (error) {
      console.error('欢迎邮件发送失败：', error)
    }
    
    const token = generateToken(user.id)
    
    return NextResponse.json({
      success: true,
      message: '注册成功！阿星在等你哦~',
      data: { token, user: { id: user.id, email: user.email } }
    })
  } catch {
    return NextResponse.json({
      success: false,
      message: '注册失败，请稍后再试',
      data: null
    }, { status: 500 })
  }
}
