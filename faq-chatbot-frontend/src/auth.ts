import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/db"
import { compare } from "bcrypt"
import jwt from "jsonwebtoken"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isValidPassword = await compare(
          credentials.password,
          user.passwordHash
        )

        if (!isValidPassword) {
          return null
        }

        return {
          id: user.id,
          email: user.email!,
          name: user.name,
          lastName: user.lastName,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/sign-in",
  },
  jwt: {
    encode: async ({ token, secret, maxAge }) => {
      if (!token) {
        throw new Error('No token to encode')
      }
      
      const { exp, iat, ...cleanToken } = token as any
      
      return jwt.sign(
        cleanToken, 
        secret as string, 
        { 
          algorithm: 'HS256',
          expiresIn: maxAge
        }
      )
    },
    decode: async ({ token, secret }) => {
      if (!token) {
        return null
      }
      try {
        return jwt.verify(token, secret as string, { algorithms: ['HS256'] }) as any
      } catch (error) {
        return null
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.lastName = (user as any).lastName
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).lastName = token.lastName
      }
      return session
    }
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
