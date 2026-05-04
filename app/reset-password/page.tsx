'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('无效的重置链接')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      setError('无效的重置链接')
      return
    }

    if (!password || !confirmPassword) {
      setError('请输入密码')
      return
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (password.length < 6) {
      setError('密码至少需要6位')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message)
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } else {
        setError(data.message)
      }
    } catch {
      setError('重置密码失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
            设置新密码
          </h2>
          <p className="text-gray-500 mt-2">
            别担心，我帮你搞定 😎
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-center text-sm">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-50 border border-green-100 text-green-600 px-4 py-8 rounded-xl mb-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-medium">{success}</p>
            <p className="text-sm text-green-500 mt-2">正在跳转到登录页面...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-100 to-orange-100 rounded-xl opacity-50"></div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="relative w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                placeholder="新密码"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl opacity-50"></div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="relative w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                placeholder="确认密码"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full py-3.5 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    确定重置
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-pink-500 hover:text-pink-600 text-sm font-medium transition-colors"
          >
            想起密码了？返回登录
          </button>
        </div>
      </div>
    </div>
  )
}
