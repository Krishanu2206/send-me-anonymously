import { getServerSession } from "next-auth";
import {authoptions} from "../../auth/[...nextauth]/options";
import dbconnect from "@/lib/dbconnect";
import Usermodel from "@/model/User";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request : NextRequest, {params}: {params : {messageid : string}}){
    const messageid = params.messageid;
    await dbconnect();

    const session = await getServerSession(authoptions);
    const user : User = session?.user as User;
    if(!session ||!session.user){
        return NextResponse.json({
            success : false,
            message : "Error verifying user"
        }, {status : 200})
    }

    try{
        const updateduser = await Usermodel.updateOne(
            {_id: user._id},
            {$pull : {messages: {_id : messageid}}}
        )
        if(updateduser.modifiedCount === 0){
            return NextResponse.json({
                success : false,
                message : "Failed to delete message"
            }, {status : 200})
        }
        return NextResponse.json({
            success : true,
            message : "Message deleted successfully"
        }, {status : 200})

    } catch (error) {
        console.log("Failed to get messages", error);
        return NextResponse.json({
            success : false,
            message : "Failed to delete messages"
        }, {status : 500})
    }
}