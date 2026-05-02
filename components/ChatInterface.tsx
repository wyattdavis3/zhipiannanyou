'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ChatMessage from './ChatMessage'
import type { Message } from '@/types'

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageCaption, setImageCaption] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    fetch('/api/chat', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessages(data.data.messages)
        }
      })
  }, [])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const token = localStorage.getItem('token')
    if (!token) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      createdAt: new Date()
    }
    
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '...',
      createdAt: new Date()
    }

    setInput('')
    setLoading(true)
    setMessages(prev => [...prev, userMessage, loadingMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
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

  const handleGetImage = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: 'young man in casual clothes, warm smile, daily life scene' })
      })

      const data = await response.json()

      if (data.success) {
        setImageUrl(data.data.imageUrl)
        setImageCaption(data.data.caption)
        setShowImageModal(true)
      } else {
        alert(data.message)
      }
    } catch {
      alert('获取图片失败')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
      <div className="bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">星</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">阿星</h2>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGetImage}
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              title="要张照片"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('token')
                router.push('/')
              }}
              className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
              title="退出登录"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">星</span>
              </div>
              <p className="text-gray-500">嗨，我是阿星。今天想聊点什么？</p>
              <p className="text-gray-400 text-sm mt-2">我跟你说啊，我研究过了，你是我见过最适合被我喜欢的人</p>
            </div>
          ) : (
            messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-lg border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入消息..."
                className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none transition-all text-gray-900"
                rows={1}
                style={{ maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full hover:from-pink-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowImageModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            {imageUrl ? (
              <img src={imageUrl} alt="阿星的照片" className="w-full h-64 object-cover" />
            ) : (
              <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400">图片加载失败</p>
              </div>
            )}
            <div className="p-4">
              <p className="text-gray-700">{imageCaption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
