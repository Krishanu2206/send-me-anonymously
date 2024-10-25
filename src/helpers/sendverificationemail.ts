import {resend} from '../lib/resend';
import { Apiresponse } from '@/types/Apiresponse';
import VerificationEmail from '../../emails/Verificationemail';

export async function sendVerificationemail(
    email : string, username : string, verifyCode : string
) : Promise<Apiresponse> {
    try {
        await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: `${email}`,
        subject: 'Verification code',
        react: VerificationEmail({username : username, otp : verifyCode})
        });
        return {success: true, message: 'Verification email sent successfully'};
    } catch (error : any) {
        console.log("Error sending verification emails", error.message);
        return {
            success: false,
            message: "Error sending verification emails"
        }
    }
}