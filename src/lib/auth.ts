import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { getUserByEmail, getUserForAuth } from "@/services/user-service"
import { verifyOtpToken } from "@/services/auth-service"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.otp) {
            return null
          }

          // Find user using service
          const user = await getUserByEmail(credentials.email as string)

          if (!user) {
            return null
          }

          // Verify OTP using service
          const verifiedToken = await verifyOtpToken({
            userId: user.id,
            token: credentials.otp as string
          })

          if (!verifiedToken) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role || "" // Usar cadena vacía para usuarios normales
          }
        } catch (error) {
          console.error("NextAuth authorize error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        // Check if user exists in database using service
        const existingUser = await getUserByEmail(user.email!)
        
        if (!existingUser) {
          return false // User doesn't exist
        }
        
        return true
      } catch (error) {
        console.error("SignIn callback error:", error)
        return false
      }
    },
    async jwt({ token, user, trigger, session }) {
      try {
        if (user) {
          const dbUser = await getUserForAuth(user.email!)
          
          if (dbUser) {
            token.role = dbUser.role || "" // Usar cadena vacía para usuarios normales
            token.id = dbUser.id
            token.name = dbUser.name
            token.image = dbUser.image
          }
        }
        
        // Handle session updates (when user updates profile)
        if (trigger === "update" && session) {
          // Update token with new session data
          if (session.name !== undefined) {
            token.name = session.name
          }
          if (session.image !== undefined) {
            token.image = session.image
          }
        }
        
        return token
      } catch (error) {
        console.error("JWT callback error:", error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (token) {
          session.user.id = token.id as string
          session.user.role = token.role as string
          session.user.name = token.name as string
          session.user.image = token.image as string | null
        }
        
        return session
      } catch (error) {
        console.error("Session callback error:", error)
        return session
      }
    }
  },
  pages: {
    signIn: '/login',
    verifyRequest: '/login?message=check-email'
  }
})