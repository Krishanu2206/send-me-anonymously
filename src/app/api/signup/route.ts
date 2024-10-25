import dbconnect from "@/lib/dbconnect";
import User from "@/model/User";
import bcrypt from 'bcryptjs';
import { sendVerificationemail } from "@/helpers/sendverificationemail";
import {NextRequest, NextResponse } from "next/server";
import { sendmail } from "@/helpers/sendmail";

export async function POST(request : NextRequest){
    await dbconnect();
    try {
        const reqbody = await request.json();
        const { username, email, password } = reqbody;
        const existinguserverifiedbyusername = await User.findOne({username : username, isverified : true});
        if(existinguserverifiedbyusername){
            return NextResponse.json({
                success: false,
                message: "Username already exists and is verified. Please use a different username."
            }, {status : 200});
        }
        const existinguserbyemail = await User.findOne({email : email});
        const verifycode = Math.floor(100000 + Math.random() * 900000).toString();
        if(existinguserbyemail){
            if(existinguserbyemail.isverified){
                return NextResponse.json({
                success: false,
                message: "User already exists with this email. Please use a different email."
            }, {status : 200});
            }else{
                const hashedpassword = await bcrypt.hash(password, 10);
                existinguserbyemail.password = hashedpassword;
                existinguserbyemail.verifycode = verifycode;
                existinguserbyemail.verifycodeexpiry = new Date(Date.now() + 3600000);
                await existinguserbyemail.save();
            }
        }else{
            const hashedpassword = await bcrypt.hash(password, 10);
            const expirydate = new Date();
            expirydate.setHours(expirydate.getHours() + 24);

            const newUser = new User({
                username,
                email,
                password: hashedpassword,
                verifycode,
                verifycodeexpiry: new Date(Date.now() + 3600000), //or expirydate(as already declared previously)
                isverified: false,
                isacceptingmessages: true,
                messages: []
            });
            await newUser.save();
        }

        //send verification email
        // const emailresponsebyresend = await sendVerificationemail(email, username, verifycode);
        const emailresponse = await sendmail(email, username, verifycode);

        if(!emailresponse.success){
            return NextResponse.json({
                success: false,
                message: emailresponse.message
            }, {status : 200});
        }
        return NextResponse.json({
            success: true,
            message: "User registered successfully! Please verify your email!"
        }, {status : 200});

    } catch (error : any) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Internal error occurred"
        }, {status : 500});
    }
}