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

    // 第一步：生成图片，拿到火山引擎临时链接
    const tempImageUrl = await generateImage(
      prompt || 'young man in casual clothes, warm smile, daily life scene'
    )

    if (!tempImageUrl) {
      return NextResponse.json({ success: false, message: '生成图片失败' }, { status: 500 })
    }

    const caption = getImageCaption()

    // 第二步：下载图片并转成 base64 data URL
    const imageResponse = await fetch(tempImageUrl)
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
    const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`

    // 第三步：返回 base64 图片给前端
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

/*
// 原来的 R2 上传逻辑（已禁用，改用 base64）
// import { uploadToR2 } from '@/lib/r2'

// let imageUrl = tempImageUrl
// try {
//   console.log('[Image API] 开始处理图片上传')
//   console.log('[Image API] 临时链接:', tempImageUrl)
//
//   const imageResponse = await fetch(tempImageUrl)
//   console.log('[Image API] 获取图片响应状态:', imageResponse.status)
//
//   const arrayBuffer = await imageResponse.arrayBuffer()
//   const imageBuffer = Buffer.from(arrayBuffer)
//   console.log('[Image API] 图片大小:', imageBuffer.length, 'bytes')
//
//   const fileName = `images/${Date.now()}-${Math.random().toString(36).slice(2)}.png`
//   console.log('[Image API] 生成文件名:', fileName)
//
//   console.log('[R2] 开始上传 - ENDPOINT:', process.env.R2_ENDPOINT)
//   console.log('[R2] 开始上传 - BUCKET:', process.env.R2_BUCKET_NAME)
//   console.log('[R2] 开始上传 - ACCESS_KEY_ID存在:', !!process.env.R2_ACCESS_KEY_ID)
//
//   const permanentUrl = await uploadToR2(imageBuffer, fileName, 'image/png')
//   imageUrl = permanentUrl
//   console.log('[R2] 上传成功！永久链接:', permanentUrl)
// } catch (r2Error) {
//   console.error('[R2] 上传失败 =======================')
//   console.error('[R2] 错误类型:', (r2Error as Error).constructor.name)
//   console.error('[R2] 错误消息:', (r2Error as Error).message)
//   console.error('[R2] 错误堆栈:', (r2Error as Error).stack)
//   console.log('[R2] 降级使用临时链接:', tempImageUrl)
// }
*/
