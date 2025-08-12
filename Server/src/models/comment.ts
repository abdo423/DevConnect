import mongoose, {isValidObjectId, Schema, Types} from 'mongoose';
import * as z from 'zod';
import Post from "./post";

export interface likes {

    user: Types.ObjectId;
    createdAt: Date;
}
const likesSchema = new Schema<likes>({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    createdAt: {type: Date, default: Date.now},
}, {_id: false});

export interface Comment {
    user: Types.ObjectId;
    post: Types.ObjectId;
    content: string;
    likes:likes[] ;
    createdAt: Date;
}

const objectId = z.custom<Types.ObjectId>((val) =>
        isValidObjectId(val),
    {message: 'Invalid ObjectId'}
);

const commentValidation = z.object({
    user: objectId,
    post: objectId,
    content: z.string().min(5).max(500),
    createdAt: z.date(),
});

export const validateComment = (comment: Comment) => {
    return commentValidation.safeParse(comment);
}
const commentSchema = new Schema<Comment>({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    post: {type: Schema.Types.ObjectId, ref: 'Post', required: true},
    likes: [likesSchema],
    content: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
});

//middleware
commentSchema.post('save', async function (doc, next) {
    try {
        const postId = (doc as any)._doc.post; // adjust if `post` is passed in the comment
        if (!postId) return next();

        await Post.findByIdAndUpdate(postId, {
            $push: {comments: doc._id}
        });

        next();
    } catch (error) {
        next(error as Error);
    }
});
commentSchema.pre("deleteOne", async function (next) {
    try {
        const filter = this.getFilter();
        const commentToDelete = await mongoose.model('Comment').findOne(filter);
        if (commentToDelete) {
            console.log('Pre deleteOne middleware triggered for comment:', commentToDelete._id);
            // Update the Post document to remove the comment reference
            await Post.findByIdAndUpdate(
                commentToDelete.post,
                {$pull: {comments: commentToDelete._id}}
            );
        }
        next();
    } catch (error: any) {
        next(error);

    }
})
const Comment = mongoose.model<Comment>('Comment', commentSchema);
export default Comment

