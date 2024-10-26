import { getServerSession } from "next-auth";
import {authoptions} from "../auth/[...nextauth]/options";
import dbconnect from "@/lib/dbconnect";
import Usermodel from "@/model/User";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request : NextRequest) {
    await dbconnect();

    const session = await getServerSession(authoptions);
    const user : User = session?.user as User;
    
    if(!session || !session.user){
        return NextResponse.json({
            success : false,
            message : "Error verifying user"
        }, {status : 200})
    }

    const userid = user._id;
    const {acceptmessages} = await request.json();

    try {
        const updateduser = await Usermodel.findByIdAndUpdate(userid, {isacceptingmessages: acceptmessages}, {new:true});
        if(!updateduser){
            return NextResponse.json({
                success : false,
                message : "Failed to update user status"
            }, {status : 200})
        }
        return NextResponse.json({
            success : true,
            message : "User status updated successfully",
            isacceptingmessages : updateduser.isacceptingmessages,
            updateduser
        })
    } catch (error : any) {
        console.log("Failed to update user status", error);
        return NextResponse.json({
            success : false,
            message : "Failed to update user status"
        }, {status : 500})
    }
}

export async function GET(){
    await dbconnect();

    const session = await getServerSession(authoptions);
    const user : User = session?.user as User;
    
    if(!session || !session.user){
        return NextResponse.json({
            success : false,
            message : "Error verifying user"
        }, {status : 200})
    }

    const userid = user._id;
    try {
        const founduser = await Usermodel.findById(userid);
        if(!founduser){
            return NextResponse.json({
                success : false,
                message : "User not found"
            }, {status : 200})
        }

        return NextResponse.json({success : true, message:"User found!", isacceptingmessages : founduser.isacceptingmessages}, {status : 200});

    } catch (error) {
        console.log("Failed to get user status", error);
        return NextResponse.json({
            success : false,
            message : "Failed to get user status"
        }, {status : 500})
    }
}