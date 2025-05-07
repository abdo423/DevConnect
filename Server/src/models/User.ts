import mongoose, { Schema, Document,Types } from 'mongoose';
import * as z  from 'zod';
import Post from "./Post";


const userValidationSchema = z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(6).max(20),
    bio: z.string().max(500).optional(),
    avatar: z.string().url().optional(),
});
const loginSchema = z.object({
    email: z.string().min(3).max(30),
    password: z.string().min(6).max(20),

})
export interface UserDocument extends Document {
    username: string;
    email: string;
    password: string;
    bio?: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
    posts?: Types.ObjectId[];


}

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 30,
    },
    email: {
        type: String,
        required: true,
        unique: true,

    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 100,
    },
    avatar: {
        type: String,
        default: './assets/avatar.png',

    },
    bio:{
        type: String,
        default: '',

    },posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post',
    }]

})

userSchema.pre<UserDocument>('deleteOne', async function (next) {
    const user = this;
    await Post.deleteMany({author_id: user._id});
    next();
});

export  const validateUser = (user: UserDocument) => {
    return userValidationSchema.safeParse(user);
};
export const validateLogin = (user: any) => {
    return loginSchema.safeParse(user)
}
const User = mongoose.model<UserDocument>('User', userSchema);
// Exported types for both schemas

export default  User;