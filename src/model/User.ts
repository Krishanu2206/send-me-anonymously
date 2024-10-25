import mongoose, {Schema, Document} from 'mongoose';


export interface Message extends Document{
    content : string;
    createdAt : Date;
}

const messageschema : Schema<Message> = new Schema({
    content : {
        type : String,
        required : [true, 'Enter a valid content']
    },
    createdAt : {
        type : Date,
        required : true,
        default : Date.now
    }
})

export interface User extends Document{
    username : string;
    email : string;
    password : string;
    verifycode : string;
    verifycodeexpiry : Date;
    isverified : boolean;
    isacceptingmessages : boolean;
    messages : Message[]
}

const userSchema : Schema<User> = new Schema({
    username : {
        type : String,
        required : [true, "Please enter your username"],
        trim : true
    },
    email : {
        type : String,
        required : [true, "Please enter your email"],
        unique : true,
        match : [/.+\@.+\..+/, 'Please enter a valid email address']
    },
    password : {
        type : String,
        required : [true, "Please enter your password"]
    },
    verifycode : {
        type : String,
        required : [true, "Verify code is required"]
    },
    verifycodeexpiry : {
        type : Date,
        required : [true, 'Verify code must have an expiration date']
    },
    isverified : {
        type : Boolean,
        default : false
    },
    isacceptingmessages : {
        type : Boolean,
        default : true
    },
    messages : [messageschema]
})

const User = (mongoose.models.User) as mongoose.Model<User> || mongoose.model<User>('User', userSchema);
export default User;