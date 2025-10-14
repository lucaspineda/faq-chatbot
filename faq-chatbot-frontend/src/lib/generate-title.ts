export async function generateChatTitle(firstMessage: string, token: string): Promise<string> {
  try {
    const backendUrl = process.env.FASTAPI_INTERNAL_URL || 'http://localhost:8000'
    
    const response = await fetch(`${backendUrl}/api/v1/chat/generate-title`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message: firstMessage })
    })

    if (!response.ok) {
      throw new Error('Failed to generate title')
    }

    const data = await response.json()
    return data.title || 'New Chat'
  } catch (error) {
    console.error('Error generating chat title:', error)
    return 'New Chat'
  }
}
