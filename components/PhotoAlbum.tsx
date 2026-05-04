'use client'
import { useState, useEffect } from 'react'

interface PhotoAlbumProps {
  isOpen: boolean
  onClose: () => void
}

export default function PhotoAlbum({ isOpen, onClose }: PhotoAlbumProps) {
  const [photos, setPhotos] = useState<string[]>([])
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setLoaded(false)

    fetch('/api/chat')
      .then(res => res.json())
      .then(data => {
        const imageUrls = (data.data?.messages || [])
          .filter((msg: any) => msg.imageUrl)
          .map((msg: any) => msg.imageUrl)
        setPhotos(imageUrls)
        setTimeout(() => setLoaded(true), 50)
      })
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-hidden rounded-3xl shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, #fefefe 0%, #f8f5f2 100%)',
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 30% 20%, rgba(251, 191, 147, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(147, 181, 251, 0.4) 0%, transparent 50%)'
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>我们的相册</h2>
                <p className="text-xs text-gray-400">{photos.length} 张照片</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto max-h-[60vh] px-6 py-5">
            {photos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                  <svg className="w-12 h-12 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-center mb-1" style={{ fontFamily: 'Georgia, serif' }}>还没有照片</p>
                <p className="text-gray-400 text-sm">让阿星发张照片吧</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {photos.map((url, i) => (
                  <div
                    key={i}
                    className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                    style={{
                      animation: loaded ? `fadeSlideIn 0.4s ease-out ${i * 80}ms both` : 'none',
                      animationFillMode: 'both'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                    <img
                      src={url}
                      alt={`照片 ${i + 1}`}
                      className="w-full h-44 object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-xs font-medium">照片 {i + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes fadeSlideIn {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>

      {previewPhoto && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-8"
          style={{
            background: 'rgba(0, 0, 0, 0.92)',
            animation: 'fadeIn 0.25s ease-out'
          }}
          onClick={() => setPreviewPhoto(null)}
        >
          <button
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all duration-200"
            onClick={() => setPreviewPhoto(null)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={previewPhoto}
            alt="预览"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            style={{
              animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
