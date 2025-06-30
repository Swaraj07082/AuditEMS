// next-auth.d.ts
import NextAuth from "next-auth"
import type { JWT } from "next-auth/jwt"
// types/next-auth.d.ts
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string  // Remove the ? to make it required
      name?: string | null
      email?: string | null
      image?: string | null
      accessToken?: string
      error?: string
    }
  }

  interface User {
    id: string  // Remove the ? to make it required
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string  // Remove the ? to make it required
  }
}