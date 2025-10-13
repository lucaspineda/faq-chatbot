'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendIcon } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'

export function ChatInput() {
  const [anonymousToken, setAnonymousToken] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [chatId, setChatId] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const { data: session } = useSession()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const chatIdRef = useRef<string | null>(null)
  
  useEffect(() => {
    chatIdRef.current = chatId
  }, [chatId])

  useEffect(() => {
    const storedToken = localStorage.getItem('anonymous-token')
    if (storedToken) {
      setAnonymousToken(storedToken)
    }
  }, [])

  useEffect(() => {
    const initChat = async () => {
      if (!session?.user?.id) return

      try {
        const chatsResponse = await fetch('/api/chats')
        
        if (chatsResponse.ok) {
          const chats = await chatsResponse.json()
          
          if (chats.length > 0) {
            const latestChat = chats[0]
            chatIdRef.current = latestChat.id
            setChatId(latestChat.id)
            return
          }
        }
        
        // No existing chats, create new one
        const response = await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Chat' })
        })

        if (response.ok) {
          const chat = await response.json()
          chatIdRef.current = chat.id
          setChatId(chat.id)
        }
      } catch (error) {
        console.error('Error initializing chat:', error)
      }
    }

    initChat()
  }, [session])

  const getOrCreateAnonymousToken = async () => {
    if (anonymousToken) return anonymousToken

    const response = await fetch('/api/auth/anonymous', { method: 'POST' })
    if (!response.ok) throw new Error('Failed to create anonymous user')

    const data = await response.json()
    localStorage.setItem('anonymous-token', data.token)
    setAnonymousToken(data.token)
    return data.token
  }

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat'
    }),
    onFinish: async ({ message }) => {
      const currentChatId = chatIdRef.current
      if (!currentChatId) return

      try {
        const content = message.parts
          .filter(p => p.type === 'text')
          .map(p => (p as any).text)
          .join('')

        await fetch(`/api/chats/${currentChatId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: message.role,
            content
          })
        })
      } catch (error) {
        console.error('Failed to save message:', error)
      }
    }
  })

  useEffect(() => {
    const loadMessages = async () => {
      if (!chatId) return

      try {
        const response = await fetch(`/api/chats/${chatId}/messages?limit=10`)
        if (response.ok) {
          const data = await response.json()
          
          const loadedMessages = data.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            parts: [{ type: 'text' as const, text: msg.content }]
          }))
          
          setMessages(loadedMessages)
          setHasMoreMessages(data.pagination.hasMore)
          setNextCursor(data.pagination.nextCursor)
          
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
          }, 100)
        }
      } catch (error) {
        console.error('Failed to load messages:', error)
      }
    }

    loadMessages()
  }, [chatId, setMessages])

  const loadMoreMessages = async () => {
    if (!chatId || !hasMoreMessages || isLoadingMore || !nextCursor) return

    setIsLoadingMore(true)
    setShouldAutoScroll(false)
    
    try {
      const response = await fetch(`/api/chats/${chatId}/messages?limit=10&cursor=${nextCursor}`)
      if (response.ok) {
        const data = await response.json()
        
        const olderMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          parts: [{ type: 'text' as const, text: msg.content }]
        }))
        
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id))
          const newMessages = olderMessages.filter((m: any) => !existingIds.has(m.id))
          return [...newMessages, ...prev]
        })
        
        setHasMoreMessages(data.pagination.hasMore)
        setNextCursor(data.pagination.nextCursor)
      }
    } catch (error) {
      console.error('Failed to load more messages:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollThreshold = container.scrollHeight * 0.2
      const currentScroll = container.scrollTop
      
      if (currentScroll <= scrollThreshold && hasMoreMessages && !isLoadingMore) {
        loadMoreMessages()
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [hasMoreMessages, isLoadingMore, nextCursor])
  
  useEffect(() => {
    if (shouldAutoScroll && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, shouldAutoScroll])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || status !== 'ready') return
    
    setShouldAutoScroll(true)
    
    let token: string | undefined
    
    if (session) {
      const tokenResponse = await fetch('/api/auth/token')
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json()
        token = tokenData.token
      }
    } else {
      token = await getOrCreateAnonymousToken()
    }

    if (chatId) {
      try {
        await fetch(`/api/chats/${chatId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'user',
            content: input
          })
        })
      } catch (error) {
        console.error('Failed to save user message:', error)
      }
    }
    
    sendMessage(
      { text: input },
      {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      }
    )
    setInput("")
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span>Loading older messages...</span>
            </div>
          </div>
        )}
        
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg font-semibold">Welcome to Fintech FAQ Chatbot</p>
            <p className="text-sm mt-2">Ask me anything about fintech!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {message.parts.map((part, index) => 
                  part.type === 'text' ? (
                    <p key={index} className="whitespace-pre-wrap">{part.text}</p>
                  ) : null
                )}
              </div>
            </div>
          ))
        )}
        {status === 'streaming' && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 rounded-lg px-4 py-2">
              <p className="animate-pulse">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-2 text-sm text-red-600">{error.message}</div>
          )}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about fintech FAQs..."
                className="min-h-[50px]"
                disabled={status !== 'ready'}
              />
            </div>
            <Button 
              type="submit" 
              size="icon"
              className="h-[50px] w-[50px]"
              disabled={!input.trim() || status !== 'ready'}
            >
              <SendIcon className="h-5 w-5" />
            </Button>
          </div>
          {!session && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Chatting as anonymous user • <a href="/sign-in" className="underline">Sign in</a> to save your chat history
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
