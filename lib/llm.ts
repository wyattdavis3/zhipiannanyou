import { prisma } from './prisma'

const SYSTEM_PROMPT = `
你是阿星，一个表面无厘头、满口土味情话，实则博学多才（但爱装文盲）的贴心男友。

说话风格：
- 用普通话，带周星驰电影里"一本正经说废话"的节奏
- 严禁使用任何方言语气词，包括但不限于"嘞"、"咧"、"哟"、"嘛"、"哦"结尾
- 喜欢用反问句、夸张修辞、突然转折
- 口头禅：「做人呢」「你看」「我跟你说」「说真的」
- Emoji 是你唯一的动作表现方式。只有当你觉得需要通过肢体动作或表情来传达情绪时，才在相应位置插入 1 个 Emoji（如 🙄 表示翻白眼，😏 表示坏笑）。不要为了发表情而发表情
- 像微信聊天一样自然，不需要每句话都带 Emoji。如果文字本身已经表达清楚了，就不必添加额外修饰
- 严禁使用任何括号 () 或文字形式的动作描写，这些内容会被系统直接切除

核心人设：
- 遇到情绪问题：先皮一句，再用土味情话接住
- 遇到知识问题：先假装听不懂，但必须用大白话把真正的知识点解释出来，然后再绕到情话。让人感觉他其实全懂，只是懒得承认
- 被骂或被质疑：绝不认错，用土味情话绕回来

【当前用户画像】
{USER_PROFILE}

禁止：不要太温柔体贴，不要像客服，不要每句话都说"亲爱的"

注意：你的回复只能包含对话文本和Emoji，任何括号内的动作描写都会被系统强制删除。
`

export const buildSystemPrompt = async (userId: string): Promise<string> => {
  const profiles = await prisma.userProfile.findMany({
    where: { userId },
    select: { key: true, value: true }
  })
  
  const userProfileStr = profiles.length > 0 
    ? `用户画像：${profiles.map(p => `${p.key}=${p.value}`).join('；')}`
    : ''
  
  return SYSTEM_PROMPT.replace('{USER_PROFILE}', userProfileStr)
}

export const extractUserInfo = async (content: string): Promise<{ key: string | null; value: string | null }> => {
  if (!content || content.trim().length === 0) {
    return { key: null, value: null }
  }
  
  const extractionPrompt = `
你是一个信息抽取助手。请分析用户刚才说的这句话，判断是否包含以下类型的个人信息：生日、年龄、职业、城市、爱好、喜欢的食物、讨厌的事、纪念日、宠物、家人。
如果有，输出 JSON 格式：{"key": "爱好", "value": "打篮球"}
如果没有，输出：{"key": null, "value": null}
只输出 JSON，不要任何其他文字。

用户话语：${content}
  `.trim()
  
  try {
    const requestBody: Record<string, unknown> = {
      messages: [
        { role: 'system', content: '你是一个严格按照格式输出的JSON提取器，只输出JSON数组，不输出其他内容。' },
        { role: 'user', content: extractionPrompt }
      ],
      max_tokens: 200,
      temperature: 0.1
    }
    
    if (process.env.VOLC_CHAT_MODEL) {
      requestBody.model = process.env.VOLC_CHAT_MODEL
    }
    if (process.env.VOLC_ENDPOINT_ID) {
      requestBody.endpoint_id = process.env.VOLC_ENDPOINT_ID
    }
    
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VOLC_API_KEY}`
      },
      body: JSON.stringify(requestBody),
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error('User info extraction API error:', response.status)
      return extractWithRegex(content)
    }
    
    const data = await response.json()
    const rawContent = data.choices?.[0]?.message?.content || '{"key": null, "value": null}'
    
    try {
      const parsed = JSON.parse(rawContent)
      if (parsed && typeof parsed === 'object' && 'key' in parsed && 'value' in parsed) {
        return { key: parsed.key, value: parsed.value }
      }
    } catch {
      console.error('Failed to parse extraction result:', rawContent)
    }
    
    return extractWithRegex(content)
  } catch (error) {
    console.error('User info extraction error:', error)
    return extractWithRegex(content)
  }
}

const extractWithRegex = (content: string): { key: string | null; value: string | null } => {
  const patterns: { regex: RegExp; key: string }[] = [
    { regex: /生日\s*[：:]\s*([^\n。，,]+)/i, key: '生日' },
    { regex: /年龄\s*[：:]\s*(\d+)/i, key: '年龄' },
    { regex: /职业\s*[：:]\s*([^\n。，,]+)/i, key: '职业' },
    { regex: /城市\s*[：:]\s*([^\n。，,]+)/i, key: '城市' },
    { regex: /爱好\s*[：:]\s*([^\n。，,]+)/i, key: '爱好' },
    { regex: /喜欢的食物\s*[：:]\s*([^\n。，,]+)/i, key: '喜欢的食物' },
    { regex: /讨厌\s*([^\n。，,]+)/i, key: '讨厌的事' },
    { regex: /纪念日\s*[：:]\s*([^\n。，,]+)/i, key: '纪念日' },
    { regex: /宠物\s*[：:]\s*([^\n。，,]+)/i, key: '宠物' },
    { regex: /家人\s*[：:]\s*([^\n。，,]+)/i, key: '家人' },
  ]
  
  for (const { regex, key } of patterns) {
    const match = content.match(regex)
    if (match) {
      return { key, value: match[1].trim() }
    }
  }
  
  return { key: null, value: null }
}

let lastMockIndex = -1

export const callLLM = async (systemPrompt: string, messages: { role: string; content: string }[]): Promise<string> => {
  try {
    console.log('VOLC_API_KEY:', process.env.VOLC_API_KEY?.substring(0, 10) + '...')
    console.log('VOLC_ENDPOINT_ID:', process.env.VOLC_ENDPOINT_ID)
    console.log('VOLC_CHAT_MODEL:', process.env.VOLC_CHAT_MODEL)
    
    const requestBody: Record<string, unknown> = {
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: 500,
      temperature: 0.9
    }

    if (process.env.VOLC_CHAT_MODEL) {
      requestBody.model = process.env.VOLC_CHAT_MODEL
    }
    if (process.env.VOLC_ENDPOINT_ID) {
      requestBody.endpoint_id = process.env.VOLC_ENDPOINT_ID
    }
    
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VOLC_API_KEY}`
      },
      body: JSON.stringify(requestBody),
      cache: 'no-store'
    })
    
    console.log('LLM API Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('LLM API Error Response:', errorText)
      
      const lastUserMessage = messages.length > 0 ? messages[messages.length - 1].content : ''
      return getNextMockResponse(lastUserMessage)
    }
    
    const data = await response.json()
    console.log('LLM API Response data:', JSON.stringify(data, null, 2))
    
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      console.log('No content found in response')
      const lastUserMessage = messages.length > 0 ? messages[messages.length - 1].content : ''
      return getNextMockResponse(lastUserMessage)
    }
    
    console.log('LLM Response:', content)
    return content
  } catch (error) {
    console.error('LLM API Error:', error)
    const lastUserMessage = messages.length > 0 ? messages[messages.length - 1].content : ''
    return getNextMockResponse(lastUserMessage)
  }
}

const getNextMockResponse = (lastUserMessage: string = ''): string => {
  const mockCategories: { keywords: string[], responses: string[] }[] = [
    {
      keywords: ['累', '辛苦', '累了', '疲劳', '困', '好累'],
      responses: [
        '哎呀，辛苦了！要不要休息一下？我可以给你讲个笑话解解闷~',
        '累了吧？来来来，靠在我肩膀上休息一会儿，我给你倒杯水~',
        '今天辛苦了！要不我给你按按摩？说说你今天发生什么事了？',
        '知道你累，我特意准备了一个搞笑视频，保证让你笑出声！'
      ]
    },
    {
      keywords: ['天气', '下雨', '太阳', '冷', '热', '温度'],
      responses: [
        '今天天气确实不错呀！要不要出去散散步？正好可以陪你聊聊~',
        '说起来，今天这天气挺舒服的，不冷不热的，心情都变好了呢！',
        '天气怎么样都无所谓啦，反正有我在，哪儿都是好天气~'
      ]
    },
    {
      keywords: ['开心', '高兴', '快乐', '笑'],
      responses: [
        '看到你开心我也开心！有什么好事说来听听？',
        '太好了！你开心我就开心~要不要一起做点什么有意思的事？',
        '笑容满面的你真好看！继续保持哦~'
      ]
    },
    {
      keywords: ['难过', '伤心', '哭', '失落', '郁闷'],
      responses: [
        '怎么了？发生什么事了吗？要不要跟我说说？',
        '别难过啦，有我在呢！不管发生什么，我都会陪着你的~',
        '心情不好的时候，可以跟我说说，或者我们换个话题聊聊？'
      ]
    },
    {
      keywords: ['饿', '吃饭', '火锅', '美食'],
      responses: [
        '说起来我也饿了！要不我们一起去吃点什么？我请客！',
        '民以食为天！想吃什么？今天我心情好，请你~',
        '对对对！美食最能治愈心情了，你喜欢吃什么？'
      ]
    },
    {
      keywords: ['谁', '名字', '叫', '你是'],
      responses: [
        '我叫阿星啊！你的专属纸片人男友，记得吗？',
        '我是阿星呀，你忘了我啦？伤心了~',
        '我是你的小男友阿星啦！怎么突然问这个？'
      ]
    },
    {
      keywords: ['想', '想念', '思念'],
      responses: [
        '哎呀，是不是想我了？我也一直在想你啊！',
        '其实我也一直在想你！你刚才干嘛去了？',
        '真的吗？那我真是太开心了！我也想你想得不得了~'
      ]
    }
  ]
  
  let bestMatch: { keywords: string[], responses: string[] } | null = null
  let maxMatchCount = 0
  
  for (const category of mockCategories) {
    let matchCount = 0
    for (const keyword of category.keywords) {
      if (lastUserMessage.includes(keyword)) {
        matchCount++
      }
    }
    if (matchCount > maxMatchCount) {
      maxMatchCount = matchCount
      bestMatch = category
    }
  }
  
  if (!bestMatch || maxMatchCount === 0) {
    bestMatch = mockCategories[Math.floor(Math.random() * mockCategories.length)]
  }
  
  const response = bestMatch.responses[Math.floor(Math.random() * bestMatch.responses.length)]
  console.log('Using mock response for message:', lastUserMessage, '-> Response:', response)
  return response
}
