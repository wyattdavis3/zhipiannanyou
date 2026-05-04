import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({
        success: false,
        message: '请提供重置令牌和新密码',
        data: null
      }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: '重置链接已过期或无效',
        data: null
      }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    return NextResponse.json({
      success: true,
      message: '密码重置成功！现在可以用新密码登录啦~',
      data: null
    })
  } catch (error) {
    console.error('重置密码失败：', error)
    return NextResponse.json({
      success: false,
      message: '重置密码失败，请稍后再试',
      data: null
    }, { status: 500 })
  }
}
