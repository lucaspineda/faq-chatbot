import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { chatId } = await params
    
    const chat = await prisma.chatSession.findFirst({
      where: {
        id: chatId,
        userId: session.user.id
      }
    })
    
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Get pagination params
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const cursor = searchParams.get('cursor')
    
    // Build query with cursor-based pagination
    const messages = await prisma.chatMessage.findMany({
      where: { chatSessionId: chatId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // Get one extra to determine if there are more
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1, // Skip the cursor itself
      }),
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true
      }
    })
    
    const hasMore = messages.length > limit
    const resultMessages = hasMore ? messages.slice(0, limit) : messages
    const nextCursor = hasMore ? resultMessages[resultMessages.length - 1].id : null
    
    return NextResponse.json({
      messages: resultMessages.reverse(),
      pagination: {
        hasMore,
        nextCursor,
        count: resultMessages.length
      }
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { chatId } = await params
    const { role, content } = await req.json()
    
    const chat = await prisma.chatSession.findFirst({
      where: {
        id: chatId,
        userId: session.user.id
      }
    })
    
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }
    
    const message = await prisma.chatMessage.create({
      data: {
        chatSessionId: chatId,
        role,
        content
      }
    })
    
    await prisma.chatSession.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    })
    
    return NextResponse.json(message)
  } catch (error) {
    console.error('Error saving message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
