// Post.ts

import mongoose, {Schema, Document, Types, isValidObjectId, Query} from 'mongoose';
import * as z from 'zod';
import User from "./User";
import Comment from "./Comment";

export interface likes {

    user: Types.ObjectId;
    createdAt: Date;
}

export interface PostDocument extends Document {
    title: string;
    content: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
    author_id: Types.ObjectId;
    likes: likes[];
    comments: Comment[];
}


const likesSchema = new Schema<likes>({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    createdAt: {type: Date, default: Date.now},
}, {_id: false});
const postSchema = new Schema<PostDocument>(
    {
        title: {
            type: String,
            required: true,
            minlength: 10,
            maxlength: 50,
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
            type: [likesSchema],
        },
        comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
    },
    {
        timestamps: true,
    }
);

// Fix: Use only the supported findOneAndDelete hook
postSchema.pre('findOneAndDelete', async function (next) {
    try {
        const filter = this.getFilter();
        const postToDelete = await mongoose.model('Post').findOne(filter);

        if (postToDelete) {
            console.log('Pre findOneAndDelete middleware triggered for post:', postToDelete._id);
            // Update the User document to remove the post reference
            await User.findByIdAndUpdate(
                postToDelete.author_id,
                {$pull: {posts: postToDelete._id}}
            );
        }
        next();
    } catch (error: any) {
        console.error('Error in findOneAndDelete middleware:', error);
        next(error);
    }
});

// Add a pre-deleteOne hook for direct document deletions
// TypeScript-compliant hook
postSchema.pre<Query<any, PostDocument>>('deleteOne', async function (next) {
    try {
        // For query middleware, 'this' refers to the query
        const filter = this.getFilter();
        const postToDelete = await mongoose.model('Post').findOne(filter);

        if (postToDelete) {
            console.log('Pre deleteOne middleware triggered for post:', postToDelete._id);
            // Update the User document to remove the post reference
            await User.findByIdAndUpdate(
                postToDelete.author_id,
                {$pull: {posts: postToDelete._id}}
            );
        }
        next();
    } catch (error: any) {
        console.error('Error in deleteOne middleware:', error);
        next(error);
    }
});

const objectId = z.string().refine((val) => isValidObjectId(val), {
    message: 'Invalid ObjectId',
});

const commentValidation = z.object({
    user: objectId,
    content: z.string().min(1),
    createdAt: z.date(),
});

const likesValidation = z.object({
    user: objectId,
    createdAt: z.date(),

})

const PostValidationSchema = z.object({
    title: z.string().min(10).max(50),
    content: z.string().min(30),
    image: z.string().url().optional(),
    author_id: objectId,
    likes: z.array(likesValidation).optional(),
    comments: z.array(commentValidation),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const validatePost = (post: PostDocument) => {
    return PostValidationSchema.safeParse(post);
};

const Post = mongoose.model<PostDocument>('Post', postSchema);
export default Post;

