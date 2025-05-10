import mongoose, {Schema, Document, Types, isValidObjectId, Query} from 'mongoose';
import * as z from 'zod';

export interface Comment {
    user: Types.ObjectId;
    content: string;
    createdAt: Date;
}


const commentSchema = new Schema<Comment>({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    content: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
});

const Comment = mongoose.model<Comment>('Comment', commentSchema);
export default Comment;


