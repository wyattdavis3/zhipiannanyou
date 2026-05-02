import type { Message } from '@/types'

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isLoading = message.content === '...'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end gap-2 max-w-[70%] ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className={`w-8 h-8 rounded-full flex-shrink-0 ${isUser ? 'bg-gradient-to-br from-pink-400 to-pink-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'} flex items-center justify-center`}>
          <span className="text-white text-xs font-bold">
            {isUser ? '你' : '星'}
          </span>
        </div>
        <div className={`px-4 py-3 rounded-2xl ${isUser ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-tr-md' : 'bg-white/80 backdrop-blur text-gray-800 rounded-tl-md'}`}>
          {isLoading ? (
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.imageUrl && (
                <img 
                  src={message.imageUrl} 
                  alt="阿星的照片" 
                  className="w-full max-w-xs rounded-lg mt-2"
                />
              )}
            </div>
          )}
          <div className={`text-xs mt-1 ${isUser ? 'text-white/70' : 'text-gray-400'}`}>
            {new Date(message.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  )
}
