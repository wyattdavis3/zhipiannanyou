'use client'

export default function Footer() {
  return (
    <footer className="py-6 px-4 bg-gray-900/50 border-t border-white/10">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-sm text-gray-400">
          有问题或建议？联系我们：
          <a
            href="mailto:feedback@psychopatrolr.online"
            className="underline hover:text-gray-200 ml-1 transition-colors duration-200"
          >
            feedback@psychopatrolr.online
          </a>
        </p>
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            onClick={() => {
              // Crisp 在线聊天按钮
              if (window.Crisp) {
                window.Crisp.chat.open()
              }
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            在线客服
          </button>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          © 2024 纸片人男友 - 陪伴是最长情的告白
        </p>
      </div>
    </footer>
  )
}
