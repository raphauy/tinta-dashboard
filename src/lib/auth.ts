import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { getUserByEmail, getUserForAuth } from "@/services/user-service"
import { verifyOtpToken } from "@/services/auth-service"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
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
            console.log("Missing credentials:", { email: !!credentials?.email, otp: !!credentials?.otp })
            return null
          }

          // Find user using service
          const user = await getUserByEmail(credentials.email as string)
          console.log("User found:", !!user)

          if (!user) {
            console.log("User not found for email:", credentials.email)
            return null
          }

          // Verify OTP using service
          const verifiedToken = await verifyOtpToken({
            userId: user.id,
            token: credentials.otp as string
          })
          console.log("Token verified:", !!verifiedToken)

          if (!verifiedToken) {
            console.log("Invalid OTP token")
            return null
          }

          console.log("Authentication successful for user:", user.email)
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
        console.log("SignIn callback triggered for user:", user.email)
        
        // Check if user exists in database using service
        const existingUser = await getUserByEmail(user.email!)
        console.log("Existing user found in signIn callback:", !!existingUser)
        
        if (!existingUser) {
          console.log("SignIn failed: User doesn't exist in database")
          return false // User doesn't exist
        }
        
        console.log("SignIn successful for user:", user.email)
        return true
      } catch (error) {
        console.error("SignIn callback error:", error)
        return false
      }
    },
    async jwt({ token, user, trigger, session }) {
      try {
        if (user) {
          console.log("JWT callback triggered for user:", user.email)
          const dbUser = await getUserForAuth(user.email!)
          console.log("DB user found in JWT callback:", !!dbUser)
          
          if (dbUser) {
            token.role = dbUser.role || "" // Usar cadena vacía para usuarios normales
            token.id = dbUser.id
            token.name = dbUser.name
            token.image = dbUser.image
            console.log("Token updated with user data:", { id: token.id, role: token.role })
          }
        }
        
        // Handle session updates (when user updates profile)
        if (trigger === "update" && session) {
          console.log("JWT token update triggered")
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
        console.log("Session callback triggered for:", session.user?.email)
        if (token) {
          session.user.id = token.id as string
          session.user.role = token.role as string
          session.user.name = token.name as string
          session.user.image = token.image as string | null
          console.log("Session updated with token data:", { id: session.user.id, role: session.user.role })
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