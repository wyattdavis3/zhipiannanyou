import ChatInterface from '@/components/ChatInterface'
import Footer from '@/components/Footer'

export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-warm">
      <ChatInterface />
      <Footer />
    </div>
  )
}
