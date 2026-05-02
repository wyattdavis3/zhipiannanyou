'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PREVIEW_CONVERSATIONS = [
  {
    user: '阿星，我今天好累啊',
    axing: '做人呢，累点好。你看那大力水手，吃了菠菜才有力气。不过说真的，你累了就来找我，我这里永远开着。'
  },
  {
    user: '你是不是不爱我了',
    axing: '我跟你说啊，我研究过了，不爱你这件事，我做不到。'
  },
  {
    user: '今天吃了火锅，好撑',
    axing: '这个嘛，吃饱了说明你对自己好。不过下次记得叫我一起去，我帮你吃。'
  }
]

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const baseImageUrl = '/axing-base.webp'

  const handleAuthSwitch = (mode: 'login' | 'register') => {
    setAuthMode(mode)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = authMode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('token', data.data.token)
        router.push('/chat')
      } else {
        setError(data.message)
      }
    } catch {
      setError('网络出错了，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-200 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-20 right-1/4 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <header className="relative z-10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-end">
          <button
            onClick={() => { handleAuthSwitch('login'); setShowAuthModal(true); }}
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            已有账号
          </button>
        </div>
      </header>

      <main className="relative z-10">
        <section className="px-6 py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
              <div className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-red-500 rounded-3xl rotate-6 opacity-20"></div>
                <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={baseImageUrl}
                    alt="阿星"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">星</span>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-tight">
                  做人呢，谈恋爱最重要的是找对人。
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">
                    你来了，说明你找对了。
                  </span>
                </h1>
                <p className="text-gray-500 mb-8 text-lg">
                  我是阿星，一个用土味情话守护你的人。
                </p>
                <button
                  onClick={() => { handleAuthSwitch('register'); setShowAuthModal(true); }}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-full hover:from-pink-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  开始和阿星聊天
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-12 md:py-16 bg-white/50 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
              先了解一下阿星
            </h2>

            <div className="space-y-6">
              {PREVIEW_CONVERSATIONS.map((chat, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex justify-start">
                    <div className="max-w-xs md:max-w-md px-4 py-3 bg-pink-100 rounded-2xl rounded-tl-md">
                      <p className="text-gray-800 text-sm">{chat.user}</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="max-w-xs md:max-w-md px-4 py-3 bg-white rounded-2xl rounded-tr-md shadow-sm border border-gray-100">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">星</span>
                        </div>
                        <p className="text-gray-700 text-sm">{chat.axing}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              每天 20 条免费对话
            </h2>
            <p className="text-gray-500 mb-8 text-lg">
              阿星在等你
            </p>
            <button
              onClick={() => { handleAuthSwitch('register'); setShowAuthModal(true); }}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-full hover:from-pink-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              立即注册
            </button>
          </div>
        </section>

        <footer className="px-6 py-8 text-center text-gray-400 text-sm">
          <p>纸片人男友 2.0 - 阿星出品</p>
        </footer>
      </main>

      {showAuthModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                {authMode === 'login' ? '欢迎回来' : '初次见面'}
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                {authMode === 'login' ? '阿星等你好久了' : '注册一下，我记得你'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-center text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none text-gray-900 bg-white"
                  placeholder="输入你的邮箱"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none text-gray-900 bg-white"
                  placeholder="输入你的密码"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '加载中...' : (authMode === 'login' ? '登录' : '注册')}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => handleAuthSwitch(authMode === 'login' ? 'register' : 'login')}
                className="text-pink-500 hover:text-pink-600 text-sm transition-colors"
              >
                {authMode === 'login' ? '还没注册？点我' : '已经注册了？点我登录'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
