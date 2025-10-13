import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("next-auth.session-token")?.value ||
                        request.cookies.get("__Secure-next-auth.session-token")?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Session token not found" },
        { status: 401 }
      )
    }

    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      return NextResponse.json(
        { error: "NEXTAUTH_SECRET not configured" },
        { status: 500 }
      )
    }

    try {
      const decoded = jwt.verify(sessionToken, secret, { algorithms: ['HS256'] }) as any

      return NextResponse.json({
        token: sessionToken,
        user: {
          id: decoded.id || decoded.sub,
          email: decoded.email,
          name: decoded.name,
          lastName: decoded.lastName,
        }
      })
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get token" },
      { status: 500 }
    )
  }
}
