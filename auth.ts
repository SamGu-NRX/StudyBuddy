import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { UserRole } from "@prisma/client"
import { getUserById } from "@/data/user"
import { db } from "@/lib/db"
import authConfig from "@/../auth.config"

// auth
// Configuration object
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',

  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
    }
  },
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      // if (account?.provider !== "credentials") return true;
      // console.log(user + "signed in successfully");

      // const existingUser = await getUserById(user.id ?? '');
      // if (!existingUser?.emailVerified) return false;
      // return true;

      const dbUser = await db.user.findUnique({
        where: { email: user.email },
      });

      if (dbUser) {
        if (!dbUser.emailVerified) {
          // If email is not confirmed, prevent sign-in
          return `/confirm-email`;
        }
        if (dbUser.firstTime) {
          await db.user.update({
            where: { email: user.email },
            data: { firstTime: false },
          });
          return `/onboarding`;
        }
        return `/dashboard-force`;
      } else {
        // Handle the case where the user is not found
        // Create a new user if necessary
        await db.user.create({
          data: {
            email: user.email,
            name: user.name,
            image: user.image,
            emailVerified: user.emailVerified,
            firstTime: true,
            role: "STUDENT",
          },
        });
        return `/onboarding`;
      }
    },

    session: async ({ session, token }: { session: any; token: any }) => {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }  
      return session;
    },
    jwt: async ({ token }) => {
      if (!token.sub) return token;
      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;
      token.role = existingUser.role;
      return token;
    },
  },
  session: { strategy: "jwt" },
  ...authConfig,
});

// // Log the return value of NextAuth to ensure it is as expected
// const authInstance = NextAuth(authOptions);
// console.log(authInstance);

// export const {
//   handlers,
//   auth,
//   signIn,
//   signOut,
// } = authInstance;