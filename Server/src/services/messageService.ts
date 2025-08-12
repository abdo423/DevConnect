// services/messageService.ts
import User, {UserDocument} from "../models/user";
import mongoose, { Types } from "mongoose";
import { validateMessageInput } from "../models/message";
import Message from "../models/message";
export const createMessageService = async (
    senderId: string,
    receiverId: string,
    content: string
) => {
    if (!senderId) {
        throw { status: 401, message: "User not authenticated" };
    }

    const user = await User.findById(senderId);
    if (!user) {
        throw { status: 404, message: "User not found" };
    }

    if (!receiverId) {
        throw { status: 400, message: "Receiver ID is required" };
    }

    // Check if user follows the receiver
    const isFollowingUser = user.following?.some((id: Types.ObjectId) =>
        id.toString() === receiverId
    );
    if (!isFollowingUser) {
        throw { status: 403, message: "Cannot send message to user you are not following" };
    }

    // Validate message input
    const messageInputData = {
        senderId,
        receiverId,
        content,
        createdAt: new Date()
    };

    const result = validateMessageInput(messageInputData);
    if (!result.success) {
        throw { status: 400, message: "Validation failed", errors: result.error.errors };
    }

    // Create and save message
    const messageData = {
        senderId: new Types.ObjectId(senderId),
        receiverId: new Types.ObjectId(receiverId),
        content,
        createdAt: new Date()
    };

    const message = new Message(messageData);
    await message.save();

    return {
        _id: message._id,
        text: message.content,
        createdAt: message.createdAt,
        senderId: message.senderId.toString(),
        receiverId: message.receiverId.toString()
    };
};

export const getMessagesBetweenUsersService = async (senderId: string, receiverId: string) => {
    if (!senderId) {
        throw { status: 401, message: "User not authenticated" };
    }

    if (!receiverId) {
        throw { status: 400, message: "Receiver ID is required" };
    }

    const messages = await Message.find({
        $or: [
            { senderId: new Types.ObjectId(senderId), receiverId: new Types.ObjectId(receiverId) },
            { senderId: new Types.ObjectId(receiverId), receiverId: new Types.ObjectId(senderId) }
        ]
    }).sort({ createdAt: 1 });

    return messages.map(msg => ({
        _id: msg._id,
        text: msg.content,
        createdAt: msg.createdAt,
        senderId: msg.senderId.toString(),
        receiverId: msg.receiverId.toString()
    }));
};

export const getSendersForCurrentUserService = async (currentId: string) => {
    if (!currentId) {
        throw { status: 401, message: "User not authenticated" };
    }

    const uniqueSenders = await Message.aggregate<UserDocument>([
        { $match: { receiverId: new mongoose.Types.ObjectId(currentId) } },
        { $group: { _id: "$senderId" } },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "sender"
            }
        },
        { $unwind: "$sender" },
        {
            $project: {
                _id: "$sender._id",
                username: "$sender.username",
                avatar: "$sender.avatar"
            }
        }
    ]);

    return uniqueSenders;


};