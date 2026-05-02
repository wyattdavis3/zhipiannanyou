import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: '邮箱和密码不能为空',
        data: null
      }, { status: 400 })
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
