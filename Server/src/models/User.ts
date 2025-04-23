import mongoose, { Schema, Document } from 'mongoose';
import * as z  from 'zod';


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

    }
})

export  const validateUser = (user: UserDocument) => {
    return userValidationSchema.safeParse(user);
};
export const validateLogin = (user: any) => {
    return loginSchema.safeParse(user)
}
const User = mongoose.model<UserDocument>('User', userSchema);
// Exported types for both schemas

export default  User;