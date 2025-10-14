import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/auth-helpers'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(req)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { chatId } = await params
    const { title } = await req.json()
    
    const chat = await prisma.chatSession.findFirst({
      where: {
        id: chatId,
        userId: userId
      }
    })
    
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }
    
    const updatedChat = await prisma.chatSession.update({
      where: { id: chatId },
      data: { 
        title,
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json(updatedChat)
  } catch (error) {
    console.error('Error updating chat title:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
