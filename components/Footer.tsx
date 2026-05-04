export default function Footer() {
  return (
    <footer className="w-full text-center py-8 px-4 space-y-2 text-xs text-gray-400 border-t border-gray-100/50">
      <p className="text-sm text-gray-500 font-medium">纸片人男友 2.0 · 让心动不止于虚拟</p>
      <p>支持情感记忆 · 每日情话 · 照片生成</p>
      <p>
        有问题或建议？联系我们：{' '}
        <a
          href="mailto:feedback@psychopatrolr.online"
          className="text-pink-400 hover:underline"
        >
          feedback@psychopatrolr.online
        </a>
      </p>
      <p className="pt-1">© 2026 纸片人男友 · Made with ❤️ for you</p>
    </footer>
  )
}
