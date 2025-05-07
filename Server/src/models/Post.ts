import mongoose, { Schema, Document, Types, isValidObjectId } from 'mongoose';
import * as z from 'zod';
import User from "./User";

export interface Comment {
    user: Types.ObjectId;
    content: string;
    createdAt: Date;
}

export interface PostDocument extends Document {
    title: string;
    content: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
    author_id: Types.ObjectId;
    likes: number;
    comments: Comment[];
}

const commentSchema = new Schema<Comment>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const postSchema = new Schema<PostDocument>(
    {
        title: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 30,
        },
        content: {
            type: String,
            required: true,
            minlength: 30,
        },
        image: {
            type: String,
        },
        author_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        likes: {
            type: Number,
            default: 0,
        },
        comments: [commentSchema],
    },
    {
        timestamps: true,
    }
);
postSchema.pre('findOneAndDelete', async function (next) {
    const post: any = await this.model.findOne(this.getQuery()); // Get the post document

    if (post) {
        await User.findByIdAndUpdate(post.author_id, {
            $pull: { posts: post.id }
        });
    }

    next();
});

const objectId = z.string().refine((val) => isValidObjectId(val), {
    message: 'Invalid ObjectId',
});

const commentValidation = z.object({
    user: objectId,
    content: z.string().min(1),
    createdAt: z.date(),
});

const PostValidationSchema = z.object({
    title: z.string().min(3).max(30),
    content: z.string().min(30),
    image: z.string().url().optional(),
    author_id: objectId,
    likes: z.number().min(0),
    comments: z.array(commentValidation),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const validatePost = (post: PostDocument) => {
    return PostValidationSchema.safeParse(post);
};

const Post = mongoose.model<PostDocument>('Post', postSchema);
export default Post;
