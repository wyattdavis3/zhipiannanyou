'use client'

import { useState } from 'react'
import type { Message } from '@/types'
import LoadingMessage from './LoadingMessage'

interface ChatMessageProps {
  message: Message
  index?: number
}

export default function ChatMessage({ message, index = 0 }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isLoading = message.content === '...'
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  return (
    <>
      <div 
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-slide-up`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className={`flex items-end gap-3 max-w-[70%] ${isUser ? 'flex-row-reverse' : ''}`}>
          {isUser ? (
            <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center shadow-md bg-gradient-to-br from-pink-400 to-rose-500">
              <span className="text-white font-display text-sm">你</span>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full overflow-hidden shadow-md flex-shrink-0">
              <img 
                src="/axing-base.webp" 
                alt="阿星" 
                className="w-full h-full object-cover object-position-[50%_30%]"
              />
            </div>
          )}
          <div className={`relative ${isUser ? 'items-end' : 'items-start'}`}>
            {isLoading ? (
              <div className="px-4 py-3 bg-gray-50/90 backdrop-blur-sm rounded-2xl rounded-tl-md border border-gray-100 shadow-sm">
                <LoadingMessage type={message.loadingType || 'normal'} />
              </div>
            ) : (
              <>
                {isUser ? (
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-axing rounded-2xl rounded-tr-md opacity-80 blur-sm"></div>
                    <div className="relative px-5 py-3 bg-gradient-axing text-white rounded-2xl rounded-tr-md shadow-md">
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl rounded-tl-md opacity-50 blur-sm"></div>
                    <div className="relative px-5 py-3 bg-white rounded-2xl rounded-tl-md shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-700 leading-relaxed">{message.content}</p>
                      {message.imageUrl && (
                        <div className="mt-3 relative group cursor-pointer">
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-xl opacity-50 blur-sm group-hover:opacity-75 transition-opacity"></div>
                          <img 
                            src={message.imageUrl} 
                            alt="阿星的照片" 
                            className="relative w-full max-w-xs rounded-xl shadow-lg group-hover:scale-[1.02] transition-transform duration-300"
                            onClick={() => setPreviewImage(message.imageUrl)}
                          />
                          <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className={`text-xs mt-1 ${isUser ? 'text-gray-400 text-right' : 'text-gray-400'}`}>
                  {new Date(message.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 图片预览蒙层 */}
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
