import { prisma } from './prisma'

export const generateImage = async (prompt: string): Promise<string> => {
  const config = await prisma.characterConfig.findUnique({
    where: { key: 'base_image_url' }
  })
  
  const baseImageUrl = config?.value || process.env.AXING_BASE_IMAGE_URL || ''
  
  if (!baseImageUrl) {
    return ''
  }
  
  try {
    const response = await fetch('https://ark.cn-beijing.volces.com/api/text2image/v1/image/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VOLC_API_KEY}`
      },
      body: JSON.stringify({
        endpoint_id: process.env.VOLC_IMAGE_MODEL,
        prompt: prompt,
        image_url: baseImageUrl,
        strength: 0.7,
        guidance_scale: 7.5
      })
    })
    
    const data = await response.json()
    return data.result?.image_url || ''
  } catch {
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
