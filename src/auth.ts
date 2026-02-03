import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Use the Prisma Adapter to save users/accounts to Neon automatically
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      // CRITICAL: We request 'repo' scope to read private repositories later.
      // 'read:user' and 'user:email' are standard for profile info.
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    // This callback is triggered whenever a session is checked.
    // We want to make sure the User ID is available in the frontend.
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  // Use JWT for sessions if you want speed, 
  // but PrismaAdapter defaults to database sessions (more secure for B2B).
  session: {
    strategy: "database",
  },
})