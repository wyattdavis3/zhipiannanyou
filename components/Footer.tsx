export default function Footer() {
  return (
    <footer className="relative w-full text-center py-10 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/60 to-transparent" />
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[200px] opacity-20"
          style={{
            background: 'radial-gradient(ellipse, rgba(251, 191, 147, 0.3) 0%, transparent 70%)'
          }}
        />
      </div>

      <div className="relative z-10 space-y-4">
        <div className="space-y-1">
          <p
            className="text-gray-100 font-semibold tracking-wide"
            style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem' }}
          >
            纸片人男友 2.0
          </p>
          <p className="text-gray-500 text-xs">让心动不止于虚拟</p>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm">
          <span className="text-gray-400">支持情感记忆</span>
          <span className="w-1 h-1 rounded-full bg-gray-600" />
          <span className="text-gray-400">每日情话</span>
          <span className="w-1 h-1 rounded-full bg-gray-600" />
          <span className="text-gray-400">照片解锁</span>
        </div>

        <div className="pt-2 space-y-1">
          <p className="text-sm text-gray-400">
            有问题或建议？联系我们：
            <a
              href="mailto:feedback@psychopatrolr.online"
              className="text-pink-400 hover:text-pink-300 hover:underline ml-1 transition-colors duration-200"
            >
              feedback@psychopatrolr.online
            </a>
          </p>
        </div>

        <p className="text-xs text-gray-500 pt-4">
          © 2026 纸片人男友 · Made with{' '}
          <span className="text-red-400">❤️</span> for you
        </p>
      </div>
    </footer>
  )
}
