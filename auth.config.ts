import bcrypt from "bcryptjs"
import type { NextAuthConfig } from "next-auth"

import Credentials from "next-auth/providers/credentials"

import Github from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Discord from "next-auth/providers/discord"
import Resend from "next-auth/providers/resend"

import { LoginSchema } from "@/schema"
import { getUserByEmail } from "@/data/user"

// import { FirestoreAdapter } from "@auth/firebase-adapter"
// import firebase from "firebase/compat/app";
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import "firebase/compat/firestore";
// import firebaseConfig from "./firebaseConfig"
// import { EmailAuthProvider } from "firebase/auth"


// // TODO: install fireadmin-sdk and use new authjs: https://authjs.dev/getting-started/adapters/firebase
// const firestore = (
//   firebase.apps[0] ?? firebase.initializeApp(firebaseConfig)
// ).firestore()

export default {
  // Google & Github providers
  providers: [
    Github({
      clientId: process.env.AUTH_GITHUB_CLIENT_ID ?? 'default',
      clientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET ?? 'default',
      profile(profile) {
        return {
          ...profile,
          id: String(profile.id),
          image: profile.avatar_url, // GitHub profile image
        };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID ?? 'default',
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET ?? 'default',
      profile(profile) {
        return {
          ...profile,
          id: profile.sub,
          image: profile.picture, // Google profile image
        };
      },
    }),
    Discord({
      clientId: process.env.AUTH_DISCORD_CLIENT_ID ?? 'default',
      clientSecret: process.env.AUTH_DISCORD_CLIENT_SECRET ?? 'default',
      profile(profile) {
        return {
          ...profile,
          id: profile.id,
          image: profile.image_url, // Discord profile image
        };
      },
    }),
    Resend({
      apiKey: process.env.AUTH_RESEND_API_KEY ?? 'default',
      from: process.env.AUTH_RESEND_FROM ?? 'default',
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        // Validate the credentials given by the user
        const validatedFields = await LoginSchema.safeParse(credentials)

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await getUserByEmail(email);
        
          if(!user || !user.password) return null;

          // check if passwords match
          const passwordsMatch = await bcrypt.compare(
            password, 
            user.password
          );
          // if the passwords match, return the user
          if(passwordsMatch) return user;
        }
        return null;
      }
    })
  ],
  secret: process.env.AUTH_SECRET,
  // adapter: FirestoreAdapter(firestore),
} satisfies NextAuthConfig