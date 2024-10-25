import dbconnect from "@/lib/dbconnect";
import User from "@/model/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
    await dbconnect();
    try {
        const {username, code} = await request.json();

        const decodedusername = decodeURIComponent(username); //so that the spaces are also properly considered
        const user = await User.findOne({username : decodedusername});
        if(!user){
            return NextResponse.json({success : false, message: "User not found"}, {status:200});
        }

        const iscodeverified = user.verifycode === code;
        const iscodenotexpired = new Date(user.verifycodeexpiry) > new Date(Date.now());

        if(iscodeverified && iscodenotexpired){
            user.isverified = true;
            await user.save();
            return NextResponse.json({success : true, message: "User verified successfully", user : user}, {status : 200});
        }else if(!iscodenotexpired){
            return NextResponse.json({success : false, message: "Code has expired"}, {status:200});
        }else{
            return NextResponse.json({success : false, message: "Invalid code"}, {status:200});
        }

    } catch (error) {
        console.log(error);
        return NextResponse.json({success : false, message: "Error verifying user", error : error}, {status:500});
    }
}