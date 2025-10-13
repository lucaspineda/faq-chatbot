import { NextRequest } from 'next/server'
import { createUIMessageStream, createUIMessageStreamResponse, UIMessage } from 'ai'

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    // Get token from Authorization header (sent from client)
    // For both authenticated and anonymous users
    let token: string | null = null
    
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }

    if (!token) {
      return new Response('Unauthorized', { status: 401 })
    }

    const lastMessage = messages[messages.length - 1]
    const userText = lastMessage.parts
      .filter(part => part.type === 'text')
      .map(part => part.type === 'text' ? part.text : '')
      .join('')

    const stream = createUIMessageStream({
      async execute({ writer }) {
        const backendUrl = process.env.FASTAPI_INTERNAL_URL || 'http://localhost:8000'
        
        const response = await fetch(`${backendUrl}/api/v1/chat/message`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userText }),
        })

        if (!response.ok) {
          throw new Error('Failed to get response from backend')
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        
        if (!reader) {
          throw new Error('No response body')
        }
        
        const textId = 'response-text'
        
        writer.write({
          type: 'text-start',
          id: textId,
        })
        
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') break
                if (data && !data.startsWith('Error')) {
                  writer.write({
                    type: 'text-delta',
                    id: textId,
                    delta: data,
                  })
                }
              }
            }
          }
        } finally {
          writer.write({
            type: 'text-end',
            id: textId,
          })
          reader.releaseLock()
        }
      },
    })

    return createUIMessageStreamResponse({ stream })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Error processing chat', { status: 500 })
  }
}


