import User, {validateLogin, validateUser} from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "config";
import mongoose from "mongoose";
import Message from "../models/message";
const JWT_SECRET = config.get<string>("jwt.secret");
import {PopulatedSender} from "../Types/user";
export const loginUser = async (reqBody: any) => {
    const result = validateLogin(reqBody);

    if (!result.success) {
        throw {
            status: 400,
            errors: result.error.errors
        };
    }

    const {email, password} = result.data;
    const user = await User.findOne({email});

    if (!user) {
        throw {
            status: 404,
            message: "Account doesn't exist"
        };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw {
            status: 401,
            message: "Invalid credentials"
        };
    }

    const token = jwt.sign(
        {
            id: user._id,
            username: user.username,
            email: user.email,
            bio: user.bio
        },
        JWT_SECRET,
        {expiresIn: "3h"}
    );

    return {token, user};
};

export const registerUser = async (reqBody: any) => {
    const result = validateUser(reqBody);

    if (!result.success) {
        throw {status: 400, errors: result.error.errors};
    }

    const {username, email, password, bio, avatar} = result.data;

    // Check email duplication
    const existingUser = await User.findOne({email});
    if (existingUser) {
        throw {status: 409, message: "Email already in use"};
    }

    // Check username duplication
    const existingUsername = await User.findOne({username});
    if (existingUsername) {
        throw {status: 409, message: "Username already taken"};
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        username,
        email,
        password: hashedPassword,
        bio,
        avatar,
    });

    await user.save();

    return {username, email};
};

export const logoutUser = async (tokenExists: boolean) => {
    if (!tokenExists) {
        return {alreadyLoggedOut: true};
    }

    // No real backend token invalidation unless using DB/Redis blacklist
    return {alreadyLoggedOut: false};
};


export const loginUserCheck = async (userId?: string) => {
    if (!userId) {
        throw {status: 401, loggedIn: false};
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
        throw {status: 401, loggedIn: false};
    }

    return {loggedIn: true, user};
};


export const getUser = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw {status: 404, message: "User not found"};
    }
    return user;
};

export const deleteUser = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw {status: 404, message: "User not found"};
    }
    await User.deleteOne({_id: userId});
    return {message: "User deleted successfully"};
};


export const getAllFollowings = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw { status: 404, message: "User not found" };
    }

    const following = await User.find({ _id: { $in: user.following } })
        .select("-password");

    return {
        message: "Following users fetched successfully",
        following,
    };
};

export const getSendersForCurrentUser = async (currentUserId: string) => {
    const currentUser = await User.findById(currentUserId).select("following");
    if (!currentUser) {
        throw { status: 404, message: "User not found" };
    }

    const followingIds = currentUser.following?.map(id => id.toString()) || [];

    const messages = await Message.find({ receiverId: currentUserId })
        .populate<{ senderId: PopulatedSender }>("senderId", "username avatar")
        .select("senderId");


    const uniqueSendersMap = new Map();

    for (const msg of messages) {
        const sender = msg.senderId ; // populated user
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

    return {
        senders: unfollowedSenders,
        count: unfollowedSenders.length,
    };
};
