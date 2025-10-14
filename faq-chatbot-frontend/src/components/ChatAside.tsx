"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlusIcon, LogOutIcon, SettingsIcon, MessageSquareIcon, XIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { useChatContext } from "@/contexts/ChatContext"
import { cn } from "@/lib/utils"

interface ChatSession {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  _count?: {
    messages: number
  }
}

export function ChatAside() {
  const { data: session } = useSession()
  const { activeChatId, setActiveChatId, refreshChats, triggerRefreshChats, isSidebarOpen, setIsSidebarOpen } = useChatContext()
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  
  if (!session?.user) {
    return null
  }
  
  const user = session.user

  useEffect(() => {
    const fetchChats = async () => {
      if (!session?.user?.id) return

      try {
        const response = await fetch('/api/chats')
        if (response.ok) {
          const chats = await response.json()
          setChatSessions(chats)
        }
      } catch (error) {
        console.error('Error fetching chats:', error)
      }
    }

    fetchChats()
  }, [session?.user?.id, refreshChats])

  const handleNewChat = async () => {
    if (!session?.user?.id || isCreatingChat) return

    setIsCreatingChat(true)
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' })
      })

      if (response.ok) {
        const newChat = await response.json()
        setActiveChatId(newChat.id)
        triggerRefreshChats()
      }
    } catch (error) {
      console.error('Error creating chat:', error)
    } finally {
      setIsCreatingChat(false)
    }
  }

  const handleChatClick = (chatId: string) => {
    setActiveChatId(chatId)
    // Close sidebar on mobile when a chat is selected
    setIsSidebarOpen(false)
  }

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName || !lastName) {
      return session?.user?.email?.[0]?.toUpperCase() || "U"
    }
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/sign-in" })
  }

  return (
    <>
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50",
        "w-64 border-r bg-white flex flex-col",
        "transform transition-transform duration-300 ease-in-out lg:transform-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="lg:hidden flex justify-end p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(false)}
            className="h-8 w-8 p-0"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-3">
          <Button 
            className="w-full justify-start gap-2" 
            variant="outline"
            onClick={handleNewChat}
            disabled={isCreatingChat}
          >
            <PlusIcon className="h-4 w-4" />
            {isCreatingChat ? 'Creating...' : 'New Chat'}
          </Button>
        </div>

        <Separator />

        <ScrollArea className="flex-1">
          <div className="space-y-1 py-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
              Recent Chats
            </h3>
            {chatSessions.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-gray-500">
                <MessageSquareIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No chats yet</p>
                <p className="text-xs mt-1">Start a new conversation</p>
              </div>
            ) : (
              chatSessions.map((chatSession) => (
                <div
                  key={chatSession.id}
                  className={cn(
                    "px-3 py-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-md mx-2",
                    activeChatId === chatSession.id && "bg-blue-50 hover:bg-blue-100"
                  )}
                  onClick={() => handleChatClick(chatSession.id)}
                >
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {chatSession.title}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-auto py-2 px-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                    {getInitials(user.name, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left flex-1 min-w-0">
                  <span className="text-sm font-medium truncate w-full">
                    {user.name} {user.lastName}
                  </span>
                  <span className="text-xs text-gray-500 truncate w-full">
                    {user.email}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" side="top">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  )
}
