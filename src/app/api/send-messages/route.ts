import User from "@/model/User";
import dbconnect from "@/lib/dbconnect";
import { Message } from "@/model/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request : NextRequest){
    await dbconnect();
    const {username, content} = await request.json();
    try {
        const user = await User.findOne({username : username});
        if(!user){
            return NextResponse.json({
                success : false,
                message : "User not found"
            }, {status : 200})
        }

        if(!user.isacceptingmessages){
            return NextResponse.json({
                success : false,
                message : "User not accepting messages"
            }, {status : 200})
        }

        const newmessage = {content: content, createdAt : new Date(Date.now())}
        user.messages.push(newmessage as Message);
        await user.save();

        return NextResponse.json({
            success : true,
            message : "Message sent successfully"
        }, {status : 200})

    } catch (error) {
        console.log("Failed to send messages", error);
        return NextResponse.json({
            success : false,
            message : "Failed to send messages"
        }, {status : 500})
    }
}