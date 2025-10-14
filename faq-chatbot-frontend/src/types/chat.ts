export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt?: string
}

export interface ChatMessagesResponse {
  messages: ChatMessage[]
  pagination: {
    hasMore: boolean
    nextCursor: string | null
  }
}

export interface UIMessagePart {
  type: 'text'
  text: string
}

export interface JWTPayload {
  id?: string
  sub?: string
  email?: string
  name?: string
  lastName?: string | null
  exp?: number
  iat?: number
  [key: string]: unknown
}

export interface UserWithLastName {
  id: string
  email: string
  name?: string | null
  lastName?: string | null
}
