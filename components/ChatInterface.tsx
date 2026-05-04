'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ChatMessage from './ChatMessage'
import PhotoAlbum from './PhotoAlbum'
import type { Message } from '@/types'

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageCaption, setImageCaption] = useState('')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [showAlbum, setShowAlbum] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const { data: session, status } = useSession()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/')
      return
    }

    fetch('/api/chat')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessages(data.data.messages)
        }
      })
  }, [session, status])

  useEffect(() => {
    const textarea = inputRef.current
    if (!textarea) return

    const adjustHeight = () => {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }

    textarea.addEventListener('input', adjustHeight)
    return () => textarea.removeEventListener('input', adjustHeight)
  }, [])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    if (!session) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      createdAt: new Date()
    }

    const imageKeywords = ['想看你', '来张照片', '发张照片', '照片', '图片', '看看你']
    const needsImage = imageKeywords.some(keyword => input.includes(keyword))

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '...',
      createdAt: new Date(),
      loadingType: needsImage ? 'image' : 'normal'
    }

    setInput('')
    setLoading(true)
    setMessages(prev => [...prev, userMessage, loadingMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input })
      })

      const data = await response.json()

      if (data.success) {
        setMessages(prev => prev.map(msg =>
          msg.id === loadingMessage.id
            ? { ...msg, content: data.data.response, imageUrl: data.data.imageUrl || undefined }
            : msg
        ))
      } else {
        alert(data.message)
        setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id))
      }
    } catch {
      alert('发送失败，请稍后再试')
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleLogout = async () => {
    const { signOut } = await import('next-auth/react')
    await signOut({ callbackUrl: '/' })
  }

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-gradient-axing animate-pulse"></div>
      </div>
    )
  }

  return (
    <>
      <div className="h-screen flex flex-col bg-gradient-warm">
        <div className="glass-effect border-b border-white/30">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden shadow-md border-2 border-white">
                  <img
                    src="/axing-base.webp"
                    alt="阿星"
                    className="w-full h-full object-cover object-position-[50%_30%]"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">阿星</h2>
                <p className="text-xs text-gray-400">在线中</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAlbum(true)}
                className="group p-2.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                title="相册"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="group p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300"
                title="退出登录"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="max-w-2xl mx-auto">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-20">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-axing-blue rounded-2xl flex items-center justify-center shadow-lg animate-float">
                    <span className="text-white font-display text-2xl">星</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-axing rounded-full flex items-center justify-center animate-wave">
                    <span className="text-white text-xs">Hi</span>
                  </div>
                </div>
                <p className="text-gray-500 mb-2 text-center">嗨，我是阿星。今天想聊点什么？</p>
                <p className="text-gray-400 text-sm text-center max-w-xs">
                  我跟你说啊，我研究过了，你是我见过最适合被我喜欢的人
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <ChatMessage key={message.id} message={message} index={index} />
              ))
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="glass-effect border-t border-white/30">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-50 to-blue-50 rounded-2xl opacity-50"></div>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入消息..."
                  className="relative w-full px-4 py-3 pr-12 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none resize-none transition-all text-gray-900 placeholder-gray-400 scrollbar-hide"
                  rows={1}
                />
                <div className="absolute right-3 bottom-3 text-gray-400 text-xs">
                  {input.length > 0 && `${input.length}/500`}
                </div>
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="group relative p-3.5 bg-gradient-axing text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>
        </div>

        {showImageModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowImageModal(false)}>
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-axing-lg animate-scale-in" onClick={e => e.stopPropagation()}>
              <div className="relative">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="阿星的照片"
                    className="w-full h-72 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => {
                      setPreviewImage(imageUrl)
                      setShowImageModal(false)
                    }}
                  />
                ) : (
                  <div className="w-full h-72 bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-400">图片加载失败</p>
                  </div>
                )}
                <button
                  onClick={() => setShowImageModal(false)}
                  className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed">{imageCaption}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <PhotoAlbum isOpen={showAlbum} onClose={() => setShowAlbum(false)} />

      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="预览"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
