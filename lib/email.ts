import { Resend } from 'resend'

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
