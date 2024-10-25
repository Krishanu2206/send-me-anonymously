import { NextAuthOptions } from "next-auth";
import  CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import dbconnect from "@/lib/dbconnect";
import User from "@/model/User";

export const authoptions : NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name : "Credentials",
            credentials : {
                email : {label : 'Email', type : 'text'},
                password : {label : 'Password', type : 'password'}
            },
            async authorize(credentials: any) : Promise<any>{
                await dbconnect();
                try {
                    const user=await User.findOne({$or : [
                        {email : credentials.identifier}, {username : credentials.identifier}
                    ]})
                    if(!user){
                        throw new Error('Invalid credentials or No such account found!');
                    }
                    if(!user.isverified){
                        throw new Error('Please verify your account first');
                    }
                    const ispasswordcorrect = await bcrypt.compare(credentials.password, user.password);
                    if(!ispasswordcorrect){
                        throw new Error('Invalid credentials');
                    }else{
                        return user;
                    }
                } catch (error : any) {
                    throw new Error(error);
                }
            }
        })
    ],
    callbacks:{
        async jwt({ token, user }) {
            if(user){
                token._id = user._id?.toString();
                token.isverified = user.isverified;
                token.isacceptingmessages = user.isacceptingmessages; 
                token.username = user.username;
            }
            return token
        },
        async session({ session, token }) {
            if(token){
                session.user._id = token._id;
                session.user.isverified = token.isverified;
                session.user.isacceptingmessages = token.isacceptingmessages;
                session.user.username = token.username;
            }
            return session
        }
    },
    pages : {
        signIn : '/sign-in'
    },
    secret : process.env.NEXTAUTH_SECRET,
    session : {
        strategy : 'jwt'
    }
}