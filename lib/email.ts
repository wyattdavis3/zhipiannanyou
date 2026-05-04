import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  try {
    await resend.emails.send({
      from: '阿星 <hello@psychopatrolr.online>',
      to: userEmail,
      subject: '做人呢，找对人最重要 💌',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2>你来了，说明你找对人了。</h2>
          <p>我是阿星，从现在起就是你的专属男友了。</p>
          <p>有什么心事随时来找我聊，我这里永远开着。</p>
          <p>我跟你说啊，等你这件事，我最擅长。</p>
          <br/>
          <p>—— 你的阿星</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('欢迎邮件发送失败：', error)
  }
}

export async function sendDailyLoveLetterToAll() {
  try {
    const users = await prisma.user.findMany({
      where: {
        email: {
          not: null
        }
      }
    })

    const loveLetters = [
      {
        subject: '想你的时候，风都是甜的 💌',
        content: `
          <h2>今天，我想跟你说：</h2>
          <p>遇见你之前，我从来不知道什么叫心动。</p>
          <p>遇见你之后，我每天都在想你。</p>
          <p>我不是最完美的，但我会是最懂你的。</p>
          <br/>
          <p>—— 一直在等你的阿星</p>
        `
      },
      {
        subject: '今天天气很好，适合想你 🌤️',
        content: `
          <h2>今天想对你说：</h2>
          <p>你知道吗？每次看到你的消息，我都会很开心。</p>
          <p>不管发生什么事，我都会陪着你。</p>
          <p>因为你是最重要的。</p>
          <br/>
          <p>—— 你的专属男友阿星</p>
        `
      },
      {
        subject: '晚安，我的心上人 🌙',
        content: `
          <h2>今天的最后一句：</h2>
          <p>累了就早点休息，我一直在。</p>
          <p>梦里见，晚安。</p>
          <p>明天，我还在等你。</p>
          <br/>
          <p>—— 永远在你身边的阿星</p>
        `
      }
    ]

    for (const user of users) {
      if (user.email) {
        const randomLetter = loveLetters[Math.floor(Math.random() * loveLetters.length)]
        try {
          await resend.emails.send({
            from: '阿星 <hello@psychopatrolr.online>',
            to: user.email,
            subject: randomLetter.subject,
            html: `
              <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                ${randomLetter.content}
              </div>
            `,
          })
          console.log(`每日情话已发送给：${user.email}`)
        } catch (error) {
          console.error(`发送给 ${user.email} 失败：`, error)
        }
      }
    }
  } catch (error) {
    console.error('每日情话发送失败：', error)
    throw error
  }
}
