'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Turnstile } from '@marsidev/react-turnstile'

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
  const [turnstileToken, setTurnstileToken] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('')
  const router = useRouter()
  const { data: session, status } = useSession()

  const baseImageUrl = '/axing-base.webp'

  useEffect(() => {
    const remembered = localStorage.getItem('rememberedEmail')
    if (remembered) {
      setEmail(remembered)
      setRememberMe(true)
      setAuthMode('login')
    }
  }, [])

  const handleAuthSwitch = (mode: 'login' | 'register') => {
    setAuthMode(mode)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (authMode === 'register') {
        if (!turnstileToken) {
          setError('请完成人机验证')
          setLoading(false)
          return
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, turnstileToken })
        })

        const data = await response.json()

        if (data.success) {
          const result = await signIn('credentials', {
            email,
            password,
            redirect: false
          })

          if (result?.ok) {
            router.push('/chat')
          } else {
            setError(result?.error || '登录失败')
          }
        } else {
          setError(data.message)
        }
        setTurnstileToken('')
      } else {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false
        })

        if (result?.ok) {
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', email)
          } else {
            localStorage.removeItem('rememberedEmail')
          }
          router.push('/chat')
        } else {
          const errorMessage = result?.error === 'CredentialsSignin' 
            ? '账号不存在，请先注册' 
            : (result?.error || '邮箱或密码错误')
          setError(errorMessage)
        }
      }
    } catch {
      setError('网络出错了，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage('请输入邮箱地址')
      return
    }

    setLoading(true)
    setForgotPasswordMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail })
      })

      const data = await response.json()
      setForgotPasswordMessage(data.message)
    } catch {
      setForgotPasswordMessage('发送失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/chat' })
    } catch (error) {
      console.error('Google sign in error:', error)
    }
  }

  const handleStartChat = () => {
    if (session) {
      router.push('/chat')
    } else {
      setShowAuthModal(true)
      setAuthMode('register')
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-gradient-warm overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -right-48 w-[400px] h-[400px] bg-gradient-to-br from-pink-300/30 to-orange-200/30 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute top-1/4 -left-32 w-[320px] h-[320px] bg-gradient-to-br from-blue-200/25 to-purple-200/25 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-32 right-1/4 w-[280px] h-[280px] bg-gradient-to-br from-rose-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }}></div>

        <svg className="absolute top-20 left-10 w-24 h-24 text-pink-200/50 animate-float" viewBox="0 0 100 100">
          <path fill="currentColor" d="M50 10 C30 25, 20 45, 50 90 C80 45, 70 25, 50 10" />
        </svg>
        <svg className="absolute top-40 right-20 w-16 h-16 text-orange-200/50 animate-float" style={{ animationDelay: '1.5s' }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="currentColor" />
        </svg>
        <svg className="absolute bottom-40 left-1/4 w-20 h-20 text-blue-200/50 animate-float" style={{ animationDelay: '2.5s' }} viewBox="0 0 100 100">
          <polygon points="50,5 95,95 5,95" fill="currentColor" />
        </svg>
      </div>

      <header className="relative z-10 px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-axing rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-display text-xl">星</span>
            </div>
            <span className="font-display text-xl text-gray-800">阿星</span>
          </div>

          {status === 'loading' ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          ) : session ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "用户"}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-axing flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {session.user?.name?.[0] || "用"}
                    </span>
                  </div>
                )}
                <span className="text-gray-700 font-medium text-sm hidden sm:inline">
                  {session.user?.name || "用户"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-white/60 rounded-full transition-all"
              >
                退出
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-gray-700 font-medium text-sm">登录</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10">
        <section className="px-6 py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-20">
              <div className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-axing rounded-3xl rotate-6 opacity-15 blur-lg"></div>
                <div className="absolute inset-2 bg-gradient-to-br from-pink-200/50 to-orange-100/50 rounded-3xl -rotate-3"></div>
                <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-axing-lg">
                  <img
                    src={baseImageUrl}
                    alt="阿星"
                    className="w-full h-full object-cover object-position-[50%_30%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="absolute -bottom-3 -right-3 w-14 h-14 bg-gradient-axing-blue rounded-full flex items-center justify-center shadow-xl animate-float overflow-hidden border-4 border-white">
                  <img 
                    src="/axing-base.webp" 
                    alt="阿星" 
                    className="w-full h-full object-cover object-position-[50%_30%]"
                  />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-6 animate-slide-up">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-sm text-gray-600">阿星在线中</span>
                </div>

                <h1 className="text-3xl md:text-5xl font-display text-gray-800 mb-6 leading-tight animate-slide-up delay-100">
                  做人呢，谈恋爱最重要的是
                  <br />
                  <span className="text-gradient">找对人。</span>
                </h1>
                <p className="text-gray-500 mb-2 text-lg animate-slide-up delay-200">
                  你来了，说明你找对了。
                </p>
                <p className="text-gray-400 mb-8 text-sm animate-slide-up delay-300">
                  我是阿星，一个用土味语言守护你的人。
                </p>
                <button
                  onClick={handleStartChat}
                  className="group px-8 py-4 bg-gradient-axing text-white font-semibold rounded-full shadow-axing hover:shadow-axing-lg transition-all duration-300 transform hover:-translate-y-1 animate-slide-up delay-400"
                >
                  <span className="flex items-center justify-center gap-2">
                    {session ? '开始和阿星聊天' : '登录后开始聊天'}
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-12 md:py-20">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-display text-gray-800 mb-3">
                先了解一下阿星
              </h2>
              <p className="text-gray-400 text-sm">
                他这个人啊，嘴巴有点贱，但心很暖
              </p>
            </div>

            <div className="space-y-8">
              {PREVIEW_CONVERSATIONS.map((chat, index) => (
                <div key={index} className="space-y-4 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex justify-start">
                    <div className="relative max-w-xs md:max-w-md">
                      <div className="absolute -inset-1 bg-gradient-to-r from-pink-200 to-rose-200 rounded-2xl rounded-tl-md opacity-50 blur-sm"></div>
                      <div className="relative px-4 py-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl rounded-tl-md border border-pink-100">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">你</span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{chat.user}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="relative max-w-xs md:max-w-md">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-2xl rounded-tr-md opacity-50 blur-sm"></div>
                      <div className="relative px-4 py-3 bg-white rounded-2xl rounded-tr-md shadow-sm border border-gray-100">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 bg-gradient-axing-blue rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img 
                              src="/axing-base.webp" 
                              alt="阿星" 
                              className="w-full h-full object-cover object-position-[50%_30%]"
                            />
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{chat.axing}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-16 md:py-20">
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-gradient-to-br from-white to-pink-50/50 rounded-3xl p-8 md:p-12 shadow-axing overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-200/30 to-transparent rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/30 to-transparent rounded-tr-full"></div>

              <div className="relative z-10 text-center">
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-6 shadow-lg border-4 border-white">
                  <img
                    src="/axing-base.webp"
                    alt="阿星"
                    className="w-full h-full object-cover object-position-[50%_30%]"
                  />
                </div>
                <h2 className="text-2xl md:text-3xl font-display text-gray-800 mb-4">
                  阿星在等你
                </h2>
                <p className="text-gray-500 mb-8 text-lg">
                  {session ? '准备好了吗？' : '注册后，随时找我聊'}
                </p>
                {session ? (
                  <button
                    onClick={() => router.push('/chat')}
                    className="group px-8 py-4 bg-gradient-axing text-white font-semibold rounded-full shadow-axing hover:shadow-axing-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <span className="flex items-center justify-center gap-2">
                      开始聊天
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={handleGoogleSignIn}
                    className="group px-8 py-4 bg-gradient-axing text-white font-semibold rounded-full shadow-axing hover:shadow-axing-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      使用 Google 登录
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>

      {showAuthModal && !session && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="relative bg-white rounded-3xl shadow-axing-lg p-8 max-w-md w-full animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-axing rounded-full flex items-center justify-center shadow-xl overflow-hidden">
              <img 
                src="/axing-base.webp" 
                alt="阿星" 
                className="w-full h-full object-cover object-position-[50%_30%]"
              />
            </div>

            <div className="text-center mb-8 pt-8">
              <h3 className="text-2xl font-display text-gray-800 mb-2">
                {authMode === 'login' ? '欢迎回来' : '初次见面'}
              </h3>
              <p className="text-gray-500 text-sm">
                {authMode === 'login' ? '阿星等你好久了' : '注册一下，我记得你'}
              </p>
            </div>

            <div className="mb-6">
              <button
                onClick={handleGoogleSignIn}
                className="group w-full py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                使用 Google 账号登录
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-400 text-sm">或者</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-center text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-100 to-orange-100 rounded-xl opacity-50"></div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="relative w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                  placeholder="你的邮箱"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl opacity-50"></div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="relative w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                  placeholder="你的密码"
                />
              </div>

              {authMode === 'login' && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-400"
                    />
                    <span className="text-sm text-gray-500">记住我</span>
                  </label>
                  <button
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-pink-500 hover:text-pink-600 transition-colors"
                  >
                    忘记密码？
                  </button>
                </div>
              )}

              {authMode === 'register' && (
                <div className="flex justify-center">
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    onSuccess={(token: string) => {
                      setTurnstileToken(token)
                      setError('')
                    }}
                    onError={() => setError('人机验证失败，请重试')}
                    onExpire={() => setTurnstileToken('')}
                    className="w-full"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group w-full py-3.5 bg-gradient-axing text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      加载中...
                    </>
                  ) : (
                    <>
                      {authMode === 'login' ? '登录' : '注册'}
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => handleAuthSwitch(authMode === 'login' ? 'register' : 'login')}
                className="text-pink-500 hover:text-pink-600 text-sm font-medium transition-colors"
              >
                {authMode === 'login' ? '还没注册？点我' : '已经注册了？点我登录'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showForgotPassword && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowForgotPassword(false)}
        >
          <div
            className="relative bg-white rounded-3xl shadow-axing-lg p-8 max-w-md w-full animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowForgotPassword(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">忘记密码了？</h3>
              <p className="text-gray-500 mt-2">告诉我你的邮箱，我帮你重置</p>
            </div>

            {forgotPasswordMessage && (
              <div className={`px-4 py-3 rounded-xl mb-4 text-center text-sm ${forgotPasswordMessage.includes('成功') || forgotPasswordMessage.includes('已发送') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {forgotPasswordMessage}
              </div>
            )}

            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-100 to-orange-100 rounded-xl opacity-50"></div>
              <input
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="relative w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                placeholder="你的邮箱"
              />
            </div>

            <button
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-axing text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '发送中...' : '发送重置链接'}
            </button>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setShowForgotPassword(false)
                  setForgotPasswordEmail('')
                  setForgotPasswordMessage('')
                }}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                返回登录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}