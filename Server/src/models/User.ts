import mongoose, { Schema, Document, Types, Query } from 'mongoose';
import * as z from 'zod';
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
});

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
    bio: {
        type: String,
        default: '',
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post',
    }]
}, {
    timestamps: true,
});

// Primary middleware for handling findOneAndDelete operations
// This covers findByIdAndDelete() as well
userSchema.pre('findOneAndDelete', async function(next) {
    try {
        const filter = this.getFilter();
        const userToDelete = await mongoose.model('User').findOne(filter);

        if (userToDelete) {
            console.log('User deletion middleware triggered for user:', userToDelete._id);
            // Delete all posts associated with this user
            await Post.deleteMany({ author_id: userToDelete._id });
        }
        next();
    } catch (error: any) {
        console.error('Error in user deletion middleware:', error);
        next(error);
    }
});

// Add this only if you use User.deleteOne() or userDoc.deleteOne() in your code
userSchema.pre<Query<any, UserDocument>>('deleteOne', async function(next) {
    try {
        const filter = this.getFilter();
        const userToDelete = await mongoose.model('User').findOne(filter);

        if (userToDelete) {
            console.log('User deleteOne middleware triggered for user:', userToDelete._id);
            await Post.deleteMany({ author_id: userToDelete._id });
        }
        next();
    } catch (error: any) {
        console.error('Error in deleteOne middleware:', error);
        next(error);
    }
});

export const validateUser = (user: UserDocument) => {
    return userValidationSchema.safeParse(user);
};

export const validateLogin = (user: any) => {
    return loginSchema.safeParse(user);
};

const User = mongoose.model<UserDocument>('User', userSchema);

export default User;