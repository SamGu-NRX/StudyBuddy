// Actions must be use server
"use server"
import * as z from "zod";
import { LoginSchema } from "@/schema";
import { signIn } from "@/../auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/index";
import AuthError from "next-auth"; 
import { generateVerificationToken } from "@/lib/tokens";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail } from "@/lib/mail";


export const login = async (values: z.infer<typeof LoginSchema>) => {
    // Validate fields
    const validatedFields = LoginSchema.safeParse(values);

    // If fields are not valid
    if(!validatedFields.success) {
        return { error: "Invalid fields"};
    }
    // If fields are valid
    const { email, password } = validatedFields.data;
    const existingUser = await getUserByEmail(email)

    if(!existingUser || !existingUser.email || !existingUser.password) {
        return { error: "Email does not exisit" };
    }

    if(!existingUser.emailVerified) {
        const verificationToken = await generateVerificationToken(existingUser.email);

        await sendVerificationEmail(
            verificationToken.email,
            verificationToken.token,
        );

        return { success: "Confirmation email sent!"}
    }


    try {
        await signIn("credentials", {
            email,
            password,
            redirect: false
        })

        return { success: "Logged in!"}
        
    } catch (error) {
        if(error instanceof AuthError) {
            switch(error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials" };
                default:
                    return { error: "Something went wrong" };
            }
        } 
        throw error;     
    }
};

// export { GET, POST } from "@/../auth"