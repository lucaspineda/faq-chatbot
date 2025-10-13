import { MessageSquareIcon } from "lucide-react"
import { ChatAside } from "@/components/ChatAside"
import { ChatInput } from "@/components/ChatInput"
import { ChatHeader } from "@/components/ChatHeader"

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-50">
      <ChatAside />

      <main className="flex-1 flex flex-col">
        <ChatHeader />
        
        <div className="flex-1 flex items-center justify-center text-gray-500 overflow-y-auto">
          <div className="text-center">
            <MessageSquareIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to AI Chatbot
            </h2>
            <p className="text-sm">
              Start a new conversation or select a chat from the sidebar
            </p>
          </div>
        </div>

        <ChatInput />
      </main>
    </div>
  )
}

