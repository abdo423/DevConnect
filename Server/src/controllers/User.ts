import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, {validateUser, validateLogin} from '../models/User';
import config from "config";
import mongoose from "mongoose";
import Message from "../models/Message";

// Secret for JWT (should be in .env)
const JWT_SECRET = config.get<string>("jwt.secret");
const expiresIn = config.get<string>("jwt.expiresIn");

// Auth/login
export const loginUser = async (req: Request, res: Response) => {
    const result = validateLogin(req.body);

    if (!result.success) {
        return res.status(400).json({errors: result.error.errors});
    }
    const {email, password} = result.data;
    try {
        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'account  doesn\'t exsist',
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({errors: result.error, message: 'Invalid credentials'});


        const token = jwt.sign(
            {id: user._id, username: user.username, email: user.email, bio: user.bio},
            JWT_SECRET,
            {expiresIn: "3h"}
        );

        res.status(200).cookie("auth-token", token, {
            httpOnly: false,
            secure: false,
            sameSite: "strict",
            maxAge: 3 * 60 * 60 * 1000,
        }).json({
            success: true,
            message: 'Successfully logged in',
            user: {
                _id: user._id,
                username: user.username,
                email,
                avatar: user.avatar,
                bio: user.bio,
            },
        });

    } catch (err) {
        res.status(500).json({message: 'Server error', error: err});
    }

}

// Auth/register

export const registerUser = async (req: Request, res: Response) => {
    try {
        const result = validateUser(req.body);
        if (!result.success) {
            return res.status(400).json({errors: result.error.errors});
        }

        const {username, email, password, bio, avatar} = result.data;
        console.log('Validated user data:', result.data);

        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(409).json({message: 'Email already in use'});
        }
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(409).json({ message: 'Username already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword);

        const user = new User({
            _id: new mongoose.Types.ObjectId(),
            username,
            email,
            password: hashedPassword,
            bio,
            avatar,
        });

        await user.save();

        res.status(201).json({message: 'User created successfully', user: {username, email}});
    } catch (err) {
        console.error('Error registering user:', err); // <-- Important
        res.status(500).json({message: 'Server error', error: err});
    }
};



//Auth/logout
export const logoutUser = async (req: Request, res: Response) => {
    try {
        // 1. Verify cookie exists before clearing
        if (req.cookies["auth-token"]) {
            console.log('Found auth-token cookie, attempting to clear...');

            // 2. Add explicit cookie clearing options (must match original cookie settings)
            res.clearCookie('auth-token', {
                httpOnly: false,
                secure: false,
                sameSite: 'strict',
            });

            console.log('Clear cookie response headers:', res.getHeaders()['set-cookie']);
        } else {
            console.warn('No auth-token cookie found in request');
        }

        // 3. Client-side token cleanup suggestion (via response)
        const response = {
            status: 'success',
            message: 'Logged out successfully',
            clientSideCleanup: true // Flag for frontend to also clear token
        };

        return res.status(200).json(response);

    } catch (error: any) {
        console.error('Logout error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to logout',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const loginUserCheck = async (req: Request, res: Response) => {
    const token = req.cookies["auth-token"];
    if (!token) return res.status(401).json({loggedIn: false});

    try {
        if(!req.user){
            return res.status(401).json({loggedIn: false});
        }
        const user = await User.findById(req.user.id).select('-password');

        return res.status(200).json({loggedIn: true, user: user});
    } catch (err) {
        return res.status(401).json({loggedIn: false});
    }
}

export const getUser = async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({message: 'User not found'});
    return res.status(200).json({user});
}

export const deleteUser = async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({message: 'User not found'});
    await User.deleteOne({_id: req.params.id});
    return res.status(200).json({message: 'User deleted successfully'});
}

export const getAllFollowings = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    const following = await User.find({ _id: { $in: user.following } }).select('-password');
    return res.status(200).json({
        message: 'Following users fetched successfully',
        following,
    })
}


export const getSendersForCurrentUser = async (req: Request, res: Response) => {
    if (!req.user?.id) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const currentUserId = req.user.id;

    try {
        // 1. Fetch the current user to get their following list
        const currentUser = await User.findById(currentUserId).select('following');
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const followingIds = currentUser.following?.map(id => id.toString()) || [];

        // 2. Get all messages where current user is the receiver
        const messages = await Message.find({ receiverId: currentUserId })
            .populate('senderId', 'username avatar')
            .select('senderId');

        // 3. Use a Map to collect unique unfollowed senders
        const uniqueSendersMap = new Map();

        for (const msg of messages) {
            const sender = msg.senderId as any; // populated user
            const senderId = sender?._id?.toString();

            if (
                sender &&
                !followingIds.includes(senderId) &&
                !uniqueSendersMap.has(senderId)
            ) {
                uniqueSendersMap.set(senderId, {
                    _id: sender._id,
                    username: sender.username,
                    avatar: sender.avatar,
                });
            }
        }

        const unfollowedSenders = Array.from(uniqueSendersMap.values());

        return res.status(200).json({
            senders: unfollowedSenders,
            count: unfollowedSenders.length,
        });

    } catch (error: any) {
        console.error('Error fetching unfollowed senders:', error);
        return res.status(500).json({
            message: 'Error fetching senders',
            error: error.message,
        });
    }
};