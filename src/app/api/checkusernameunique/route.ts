import dbconnect from "@/lib/dbconnect";
import { z } from "zod";
import User from "@/model/User";
import { usernamevalidation } from "@/schemas/signupschema";
import { NextRequest, NextResponse } from "next/server";

const usernamequeryschema = z.object({
    username : usernamevalidation
})

export async function GET(request : NextRequest){
    await dbconnect();
    try {
        const {searchParams} = new URL(request.nextUrl); //URL like this : localhost:3000/checkusernameunique/username=assailant //cannot write searchparams instead of searchParams
        const queryparam = {
            username : searchParams.get("username")
        }

        //validate with ZOD
        const result = usernamequeryschema.safeParse(queryparam);
        console.log(result);  //prints result
        console.log('zod error', result.error?.errors.map(err=> err.message).join(', '), "zod error end")
        if(!result.success){
            const usernameerrors = result.error?.errors.map(err=> err.message).join(', ') ;
            console.log('username errors', usernameerrors); 
            return NextResponse.json({success : false, message: usernameerrors}, {status:200});
        }

        const {username} = result.data;
        const existingverifieduser = await User.findOne({username: username, isverified: true});
        if(existingverifieduser){
            return NextResponse.json({success : false, message: "Username already exists"}, {status:200});
        }else{
            return NextResponse.json({success : true, message: "Username is available"}, {status:200});
        }

    } catch (error : any) {
        console.log('Error in signup user catch part', error);
        return NextResponse.json({success : false, message: "Error checking username", error : error}, {status:500});
    }
}