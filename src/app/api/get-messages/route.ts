import { getServerSession } from "next-auth";
import {authoptions} from "../auth/[...nextauth]/options";
import dbconnect from "@/lib/dbconnect";
import Usermodel from "@/model/User";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(){
    await dbconnect();

    const session = await getServerSession(authoptions);
    const user : User = session?.user as User;
    if(!session ||!session.user){
        return NextResponse.json({
            success : false,
            message : "Error verifying user"
        }, {status : 200})
    }

    const userid = new mongoose.Types.ObjectId(user._id);
    try { 
        const user = await Usermodel.aggregate([
            {
                $match : {
                    _id : userid
                }
            },
            {
                $unwind : '$messages'
            },
            {
                $sort : {
                    'messages.createdAt' : -1
                }
            },
            {
                $group : {
                    _id : '$_id', 
                    messages : {
                        $push : '$messages'
                    }
                }
            }
        ])
        if(!user){
            return NextResponse.json({
            success : false,
            message : "User does not exist"
            }, {status : 200})
        }

        if(user.length === 0){
            return NextResponse.json({
            success : false,
            message : "No messages to display!"
            }, {status : 200})
        }

        return NextResponse.json({
            success: true,
            message : "All messages are successfully fetched",
            messages : user[0].messages
        }, {status : 200})
    } catch (error) {
        console.log("Failed to get messages", error);
        return NextResponse.json({
            success : false,
            message : "Failed to get messages"
        }, {status : 500})
    }
}