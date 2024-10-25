import { Message } from "@/model/User";

export interface Apiresponse{
    success : boolean;
    message : string;
    isacceptingmessages? : boolean;
    messages? : Array<Message>;
}