// src/app/providers.tsx
import { SessionProvider } from "next-auth/react"
import { auth } from "@/../auth";

export default async function Providers({ children }: 
    { children: React.ReactNode }) {
    const authSession = await auth();
    return (
        <SessionProvider session={authSession}>
            {children}
        </SessionProvider>
    )
}