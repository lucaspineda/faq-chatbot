'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface ChatContextType {
  activeChatId: string | null
  setActiveChatId: (id: string | null) => void
  refreshChats: boolean
  triggerRefreshChats: () => void
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [refreshChats, setRefreshChats] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const triggerRefreshChats = useCallback(() => {
    setRefreshChats(prev => !prev)
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev)
  }, [])

  return (
    <ChatContext.Provider value={{
      activeChatId,
      setActiveChatId,
      refreshChats,
      triggerRefreshChats,
      isSidebarOpen,
      setIsSidebarOpen,
      toggleSidebar
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}
