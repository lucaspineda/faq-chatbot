import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    lastName?: string | null
  }
  
  interface Session {
    user: {
      id: string
      lastName?: string | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    lastName?: string | null
  }
}
