import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            userID: string
            name: string
            email: string
            role?: string 
            active: boolean

        }
    }
    interface User {
        userID: string
        name: string
        email: string
        role: string | undefined
        active: boolean
    }
} 

declare module "next-auth/jwt" {
    interface JWT {
        userID: string
        role: string | undefined
        active: boolean
    }   
}