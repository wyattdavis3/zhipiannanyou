import { useState, useEffect } from 'react'

interface LoadingMessageProps {
  type: 'normal' | 'image'
}

export default function LoadingMessage({ type }: LoadingMessageProps) {
  const [phase, setPhase] = useState(0)
  
  useEffect(() => {
    if (type !== 'image') return
    
    const timers = [
      setTimeout(() => setPhase(1), 3000),
    ]
    
    return () => timers.forEach(t => clearTimeout(t))
  }, [type])
  
  const messages = [
    '找个好角度……',
    '调整一下表情……'
  ]
  
  const text = type === 'normal' ? '对方正在输入' : messages[phase]
  
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-gray-500">{text}</span>
      <span className="flex gap-0.5">
        <span className="dot"></span>
        <span className="dot dot-2"></span>
        <span className="dot dot-3"></span>
      </span>
    </div>
  )
}