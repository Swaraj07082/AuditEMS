// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions, type User, type Session } from "next-auth"
import type { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        // Replace this with your real user lookup logic
        if (credentials?.email === "demo@auditmanagement.com" && credentials.password === "demo123") {
          return { id: "1", name: "Demo User", email: "demo@auditmanagement.com" }
        }
        return null
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      // On first sign in, persist user id to token
      if (user?.id) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Make user id available on session.user
      if (session.user && token.id) {
        session.user.id = token.id
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
