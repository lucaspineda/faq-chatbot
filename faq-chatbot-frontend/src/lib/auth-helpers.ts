import jwt from 'jsonwebtoken'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { NextRequest } from 'next/server'

interface JWTPayload {
  id: string
  email: string
  name: string
  lastName?: string
  isAnonymous?: boolean
}

export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const session = await getServerSession(authOptions)
  
  if (session?.user?.id) {
    return session.user.id
  }
  
  // If no session, try to get user from Authorization header (anonymous users)
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    
    try {
      const secret = process.env.NEXTAUTH_SECRET
      if (!secret) {
        console.error('NEXTAUTH_SECRET not configured')
        return null
      }
      
      const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] }) as JWTPayload
      return decoded.id
    } catch (error) {
      console.error('Invalid token:', error)
      return null
    }
  }
  
  return null
}
