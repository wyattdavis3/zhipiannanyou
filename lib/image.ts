import { prisma } from './prisma'

export const generateImage = async (prompt: string, baseImageUrl?: string): Promise<string> => {
  if (!baseImageUrl) {
    const config = await prisma.characterConfig.findUnique({
      where: { key: 'base_image_url' }
    })
    baseImageUrl = config?.value || process.env.AXING_BASE_IMAGE_URL || ''
  }
  
  console.log('[Image Generation] baseImageUrl:', baseImageUrl || 'NOT SET')
  console.log('[Image Generation] AXING_BASE_IMAGE_URL env:', process.env.AXING_BASE_IMAGE_URL || 'NOT SET')
  
  if (!baseImageUrl) {
    console.error('[Image Error] 数据库中未找到 base_image_url 配置，且环境变量 AXING_BASE_IMAGE_URL 也未设置')
    return ''
  }
  
  if (!baseImageUrl.startsWith('http')) {
    baseImageUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${baseImageUrl}`
  }
  
  try {
    console.log('=== Image Generation Debug ===')
    console.log('VOLC_API_KEY exists:', !!process.env.VOLC_API_KEY)
    console.log('VOLC_IMAGE_MODEL:', process.env.VOLC_IMAGE_MODEL)
    console.log('baseImageUrl:', baseImageUrl ? baseImageUrl.substring(0, 50) + '...' : 'empty')
    console.log('prompt:', prompt)
    
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VOLC_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.VOLC_IMAGE_MODEL,
        prompt: prompt,
        image_url: baseImageUrl,
        size: '2048x2048',
        strength: 0.7
      })
    })
    
    console.log('Image API Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Image API Error:', errorText)
      return ''
    }
    
    const data = await response.json()
    console.log('Image API Response:', JSON.stringify(data, null, 2))
    
    let imageUrl = ''
    if (data.data?.[0]?.url) {
      imageUrl = data.data[0].url
    } else if (data.result?.image_url) {
      imageUrl = data.result.image_url
    } else if (data.urls?.[0]) {
      imageUrl = data.urls[0]
    } else if (data.image_url) {
      imageUrl = data.image_url
    }
    
    console.log('Generated image URL:', imageUrl ? imageUrl.substring(0, 50) + '...' : 'empty')
    
    return imageUrl
  } catch (error) {
    console.error('Image generation error:', error)
    return ''
  }
}

export const getImageCaption = (): string => {
  const captions = [
    '哎，刚路过看到个风景不错，顺手拍了一张。其实也不是特意拍给你的啦……',
    '你看这个云，像不像我昨天晚上想你的样子？算了，当我没说。',
    '今天天气不错，出来走走，顺便……嗯，就顺便。',
    '给你看个东西，不许笑啊……其实还挺好看的对吧？',
    '路过一个地方，感觉你会喜欢，就拍下来了。真的只是路过！',
    '我跟你说啊，这个角度拍照特别好看，你要不要试试？',
    '突然发现，原来好看的风景要分享给好看的人。哎呀，我不是说你好看啊！',
  ]
  
  return captions[Math.floor(Math.random() * captions.length)]
}
