import nodemailer from 'nodemailer';
import { Apiresponse } from '@/types/Apiresponse';
const {google} = require('googleapis');

export const sendmail = async(email : string, username : string, verifyCode : string) : Promise<Apiresponse>=>{
    try {
        const CLIENT_ID=process.env.CLIENT_ID
        const CLIENT_SECRET=process.env.CLIENT_SECRET
        const REDIRECT_URI=process.env.REDIRECT_URI
        const REFRESH_TOKEN=process.env.REFRESH_TOKEN
        const SERVICE= process.env.SERVICE
        const USEROFGMAIL = process.env.USEROFGMAIL;
        const SENDER = process.env.SENDER

        const oAuth2Client=new google.auth.OAuth2(`${CLIENT_ID}`, `${CLIENT_SECRET}`, `${REDIRECT_URI}`);
        oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

        const accessToken=await oAuth2Client.getAccessToken()
        console.log(accessToken);

        const transport = nodemailer.createTransport({
            service:`${SERVICE}`,
            auth:{
                type:'OAuth2',
                user:`${USEROFGMAIL}`,
                clientId: `${CLIENT_ID}`,
                clientSecret: `${CLIENT_SECRET}`,
                refreshToken: `${REFRESH_TOKEN}`,
                accessToken: `${accessToken}`,
            }
        })

        const mailoptions = {
            from : `${SENDER}`,
            to : email,
            subject : 'Verify your email',
            html : `<strong>Hello ${username}.</strong><br/><p>Your verify code is ${verifyCode}</p>`
        }
        const mailresponse = await transport.sendMail(mailoptions);
        if(mailresponse){
            return {success:true, message: 'Mail sent successfully'}
        }
        return {success:false, message: 'Failed to send mail'}
    } catch (error : any) {
        console.log("Error sending verification emails", error);
        return {
            success: false,
            message: "Error sending verification emails"
        }
    }
}

