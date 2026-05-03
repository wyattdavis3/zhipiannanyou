import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'

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
    
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({
        success: false,
        message: '这个邮箱还没注册哦',
        data: null
      }, { status: 400 })
    }
    
    if (!user.password) {
      return NextResponse.json({
        success: false,
        message: '密码不对哦，再想想？',
        data: null
      }, { status: 400 })
    }
    
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: '密码不对哦，再想想？',
        data: null
      }, { status: 400 })
    }
    
    const token = generateToken(user.id)
    
    return NextResponse.json({
      success: true,
      message: '欢迎回来！',
      data: { token, user: { id: user.id, email: user.email } }
    })
  } catch {
    return NextResponse.json({
      success: false,
      message: '登录失败，请稍后再试',
      data: null
    }, { status: 500 })
  }
}
