import {Request, Response, NextFunction} from 'express';
import {Types} from "mongoose";
import Message, { validateMessageInput} from "../models/Message"
import User from "../models/User";
type UserType = {
    _id: string;
    username: string;
    avatar: string;
};


export const createMessage = async (req: Request, res: Response) => {
    try {
        // Check if sender exists and is authenticated
        if (!req.user?.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get receiverId from request body (not params)
        const receiverId = req.body.receiverId;
        if (!receiverId) {
            return res.status(400).json({ message: 'Receiver ID is required' });
        }

        // Check if user is following the receiver
        const isFollowingUser = user.following?.some((id: Types.ObjectId) =>
            id.toString() === receiverId
        );

        if (!isFollowingUser) {
            return res.status(403).json({ message: 'Cannot send message to user you are not following' });
        }

        // Prepare message data for validation
        const messageInputData = {
            senderId: req.user.id,
            receiverId: receiverId,
            content: req.body.content,
            createdAt: new Date()
        };

        // Validate input data
        const result = validateMessageInput(messageInputData);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.errors });
        }

        // Create message with ObjectId conversion
        const messageData = {
            senderId: new Types.ObjectId(req.user.id), // Convert to ObjectId
            receiverId: new Types.ObjectId(receiverId), // Convert to ObjectId
            content: req.body.content,
            createdAt: new Date()
        };

        const message = new Message(messageData);
        await message.save();
        const messageReturn = {
            _id: message._id,
            text: message.content,
            createdAt: message.createdAt,
            senderId: message.senderId.toString(),
            receiverId: message.receiverId.toString()
        }
        return res.status(201).json({
            message: 'Message sent successfully',
            data: messageReturn
        });

    } catch (error) {
        console.error('Error creating message:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMessagesbetweenUsers = async (req: Request, res: Response) => {
    const { id } = req.params; // other user ID

    if (!req.user?.id) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const currentUserId = req.user.id;
    const otherUserId = id;

    try {
        // Get messages without user population
        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: currentUserId }
            ]
        }).sort({ createdAt: 1 });

        const plainMessages = messages.map(msg => ({
            _id: msg._id,
            text: msg.content,
            createdAt: msg.createdAt,
            senderId: msg.senderId.toString(),
            receiverId: msg.receiverId.toString()
        }));

        return res.status(200).json({
            messages: plainMessages,
            count: plainMessages.length
        });

    } catch (error: any) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({
            message: 'Error fetching messages',
            error: error.message
        });
    }
};

export const getSendersForCurrentUser = async (req: Request, res: Response) => {
    if (!req.user?.id) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const currentUserId = req.user.id;

    try {
        // Get all messages where current user is the receiver
        const messages = await Message.find({ receiverId: currentUserId })
            .populate('senderId', 'username avatar') // Populate only username and avatar
            .select('senderId');

        // Use a Map to collect unique senders by ID
        const uniqueSendersMap = new Map();

        for (const msg of messages) {
            const sender = msg.senderId as any; // Populated user document
            if (!uniqueSendersMap.has(sender._id.toString())) {
                uniqueSendersMap.set(sender._id.toString(), {
                    _id: sender._id,
                    username: sender.username,
                    avatar: sender.avatar
                });
            }
        }

        const uniqueSenders = Array.from(uniqueSendersMap.values());

        return res.status(200).json({
            senders: uniqueSenders,
            count: uniqueSenders.length
        });

    } catch (error: any) {
        console.error('Error fetching senders:', error);
        return res.status(500).json({
            message: 'Error fetching senders',
            error: error.message
        });
    }
};
