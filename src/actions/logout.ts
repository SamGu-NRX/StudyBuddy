"use server"

import { signOut } from "@/../auth";

export const logout = async (): Promise<void> => {
    await signOut()
}