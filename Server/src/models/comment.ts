import mongoose, {isValidObjectId, Schema, Types, CallbackError} from 'mongoose';
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
    likes: likes[];
    createdAt: Date;
}

const objectId = z.custom<Types.ObjectId>((val) =>
        isValidObjectId(val),
    {message: 'Invalid ObjectId'}
);

// ✅ FIXED: Updated validation schema to match what service creates
const commentValidation = z.object({
    user: objectId,
    post: objectId,
    content: z.string().min(5, "String must contain at least 5 character(s)").max(500),
    likes: z.array(z.object({
        user: objectId,
        createdAt: z.date()
    })).default([]), // ✅ Added likes validation with default empty array
    createdAt: z.date(),
});

// ✅ ALTERNATIVE: Validation for API input (only what comes from request)
const commentInputValidation = z.object({
    post: objectId.or(z.string().refine(isValidObjectId, "Invalid post ID")),
    content: z.string().min(5, "String must contain at least 5 character(s)").max(500),
}).required();

// ✅ Export both validators
export const validateComment = (comment: Comment) => {
    return commentValidation.safeParse(comment);
}

// ✅ NEW: Validate only the input from API request
export const validateCommentInput = (input: {post: string, content: string}) => {
    return commentInputValidation.safeParse(input);
}

const commentSchema = new Schema<Comment>({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    post: {type: Schema.Types.ObjectId, ref: 'Post', required: true},
    likes: [likesSchema],
    content: {type: String, required: true, minlength: 5, maxlength: 500}, // ✅ Added length validation to Mongoose too
    createdAt: {type: Date, default: Date.now},
});

//middleware
commentSchema.pre('save', async function (next) {
    if (!this.isNew) return next();

    await Post.findByIdAndUpdate(this.post, {
        $push: { comments: this._id }
    });

    next();
});

commentSchema.pre("deleteOne", async function (next) {
    try {
        const filter = this.getFilter();
        const commentToDelete = await mongoose.model('Comment').findOne(filter);
        if (commentToDelete) {
            await Post.findByIdAndUpdate(
                commentToDelete.post,
                {$pull: {comments: commentToDelete._id}}
            );
        }
        next();
    } catch (error: unknown) {
        next(error as CallbackError);
    }
})

const Comment = mongoose.model<Comment>('Comment', commentSchema);
export default Comment;