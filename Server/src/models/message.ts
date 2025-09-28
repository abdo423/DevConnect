import mongoose, {Schema, Types, isValidObjectId} from 'mongoose';
import * as z from 'zod';

export interface Message {
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    content: string;
    createdAt: Date;
}

// Validation schema for input data (strings that will be converted to ObjectIds)
const messageValidation = z.object({
    senderId: z.string().refine((val) => isValidObjectId(val), {
        message: 'Invalid sender ObjectId',
    }),
    receiverId: z.string().refine((val) => isValidObjectId(val), {
        message: 'Invalid receiver ObjectId',
    }),
    content: z.string().min(1, 'Content is required').max(1000),
    createdAt: z.date().optional()
});

const MessageSchema = new Schema<Message>({
    senderId: {type: Schema.Types.ObjectId, ref: 'User', required: true}, // Fixed typo
    receiverId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    content: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
});

MessageSchema.index({ senderId: 1 });
MessageSchema.index({ receiverId: 1 });

// Validate input data (before converting to ObjectIds)
export const validateMessageInput = (data: {
    senderId: string;
    receiverId: string;
    content: string;
    createdAt?: Date;
}) => {
    return messageValidation.safeParse(data);
};

const MessageModel = mongoose.model<Message>('Message', MessageSchema);
export default MessageModel;