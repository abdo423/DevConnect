import mongoose, {Document, Query, Schema, Types,CallbackError} from 'mongoose';
import * as z from 'zod';
import Post from "./post";

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
    _id: Types.ObjectId;
    username: string;
    email: string;
    password: string;
    bio?: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
    posts?: Types.ObjectId[];
    followers?: Types.ObjectId[];
    following?: Types.ObjectId[];
}

const userSchema = new Schema({
    _id: Schema.Types.ObjectId,
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
    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: [],
        required: true,
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: [],
        required: true,
    }],
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post',
    }]
},  {
    timestamps: true,
});

// Primary middleware for handling findOneAndDelete operations
// This covers findByIdAndDelete() as well
userSchema.pre('findOneAndDelete', async function(next) {
    try {
        const filter = this.getFilter();
        const userToDelete = await mongoose.model('User').findOne(filter);

        if (userToDelete) {
            // Delete all posts associated with this user
            await Post.deleteMany({ author_id: userToDelete._id });
        }
        next();
    } catch (error: unknown) {
        next( error as CallbackError);
    }
});

// Add this only if you use User.deleteOne() or userDoc.deleteOne() in your code
userSchema.pre<Query<unknown, UserDocument>>('deleteOne', async function(next) {
    try {
        const filter = this.getFilter();
        const userToDelete = await mongoose.model('User').findOne(filter);

        if (userToDelete) {
            await Post.deleteMany({ author_id: userToDelete._id });
        }
        next();
    } catch (error: unknown) {
        next(error as CallbackError)
    }
});

export const validateUser = (user: UserDocument) => {
    return userValidationSchema.safeParse(user);
};

export const validateLogin = (user: unknown) => {
    return loginSchema.safeParse(user);
};

const User = mongoose.model<UserDocument>('User', userSchema);

export default User;