import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateImage } from '@/lib/image'

const captions = [
  '今天天气不错，出来走走，顺便……嗯，就顺便。',
  '我跟你说啊，这个角度拍照特别好看，你要不要试试？',
  '做人呢，偶尔晒晒太阳，对身体好。',
  '你看这个光线，像不像我昨天晚上想你的样子？',
]

function getImageCaption() {
  return captions[Math.floor(Math.random() * captions.length)]
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, message: '未登录' }, { status: 401 })
    }

    const body = await req.json()
    const { prompt } = body

    const tempImageUrl = await generateImage(
      prompt || 'young man in casual clothes, warm smile, daily life scene'
    )

    if (!tempImageUrl) {
      return NextResponse.json({ success: false, message: '生成图片失败' }, { status: 500 })
    }

    const caption = getImageCaption()

    const imageResponse = await fetch(tempImageUrl)
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
    const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`

    return NextResponse.json({
      success: true,
      message: 'success',
      data: { imageUrl: base64Image, caption },
    })
  } catch (error) {
    console.error('[Image API] 错误：', error)
    return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 })
  }
}
