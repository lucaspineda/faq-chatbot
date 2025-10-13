import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import jwt from "jsonwebtoken"

export async function POST() {
  try {
    const anonymousUser = await prisma.user.create({
      data: {
        email: `anonymous-${Date.now()}-${Math.random().toString(36).substring(7)}@anonymous.local`,
        name: "Anonymous",
        lastName: "User",
        isAnonymous: true,
      }
    })

    // Create a JWT token for the anonymous user
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      return NextResponse.json(
        { error: "NEXTAUTH_SECRET not configured" },
        { status: 500 }
      )
    }

    const token = jwt.sign(
      {
        id: anonymousUser.id,
        email: anonymousUser.email,
        name: anonymousUser.name,
        lastName: anonymousUser.lastName,
        isAnonymous: true,
      },
      secret,
      {
        algorithm: 'HS256',
        expiresIn: '7d' // 7 days
      }
    )

    return NextResponse.json({
      token,
      user: {
        id: anonymousUser.id,
        email: anonymousUser.email,
        name: anonymousUser.name,
        lastName: anonymousUser.lastName,
        isAnonymous: true,
      }
    })
  } catch (error) {
    console.error("Error creating anonymous user:", error)
    return NextResponse.json(
      { error: "Failed to create anonymous user" },
      { status: 500 }
    )
  }
}
