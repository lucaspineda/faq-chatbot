import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hash } from 'bcrypt'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, password } = body

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    const passwordHash = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        name: firstName,
        lastName,
        passwordHash,
        isAnonymous: false
      },
      select: {
        id: true,
        email: true,
        name: true,
        lastName: true,
        createdAt: true
      }
    })

    return NextResponse.json(
      {
        message: 'User created successfully',
        user
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Sign up error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
