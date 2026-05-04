import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendResetPasswordEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({
        success: false,
        message: '请输入邮箱地址',
        data: null
      }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({
        success: true,
        message: '如果这个邮箱已注册，你会收到一封重置密码的邮件哦',
        data: null
      })
    }

    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const resetTokenExpiry = new Date(Date.now() + 3600000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    await sendResetPasswordEmail(email, resetToken)

    return NextResponse.json({
      success: true,
      message: '密码重置邮件已发送，请注意查收哦~',
      data: null
    })
  } catch (error) {
    console.error('忘记密码失败：', error)
    return NextResponse.json({
      success: false,
      message: '发送邮件失败，请稍后再试',
      data: null
    }, { status: 500 })
  }
}
