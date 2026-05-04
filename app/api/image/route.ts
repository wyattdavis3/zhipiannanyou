import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateImage } from '@/lib/image'
import { uploadToR2 } from '@/lib/r2'

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

    // 第一步：生成图片，拿到火山引擎临时链接
    const tempImageUrl = await generateImage(
      prompt || 'young man in casual clothes, warm smile, daily life scene'
    )

    if (!tempImageUrl) {
      return NextResponse.json({ success: false, message: '生成图片失败' }, { status: 500 })
    }

    const caption = getImageCaption()

    // 第二步：尝试上传到 R2，失败则降级用临时链接
    let imageUrl = tempImageUrl
    try {
      const imageResponse = await fetch(tempImageUrl)
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
      const fileName = `images/${Date.now()}-${Math.random().toString(36).slice(2)}.png`
      const permanentUrl = await uploadToR2(imageBuffer, fileName, 'image/png')
      imageUrl = permanentUrl
      console.log('[R2] 上传成功：', permanentUrl)
    } catch (r2Error) {
      console.error('[R2] 上传失败，使用临时链接：', r2Error)
      // 降级：继续用 tempImageUrl
    }

    return NextResponse.json({
      success: true,
      message: 'success',
      data: { imageUrl, caption },
    })
  } catch (error) {
    console.error('[Image API] 错误：', error)
    return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 })
  }
}
