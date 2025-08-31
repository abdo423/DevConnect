import User from "../models/user";
import mongoose from "mongoose";
import {z} from "zod";
export const   profileUpdateSchema = z.object({
    bio: z.string().max(500).optional(),
    avatar: z.string().optional(),
    username: z.string().min(3).max(30).optional(), // only include if allowed to update
});

export const getProfile = async (userId: string) => {
    if (!userId) {
        throw {status: 401, message: "Unauthorized"};
    }

    const user = await User.findById(userId)
        .select("-password")
        .populate({
            path: "posts",
            options: {sort: {createdAt: -1}},
            populate: {
                path: "author_id",
                select: "_id email username avatar",
            },
        })
        .exec();

    if (!user) {
        throw {status: 404, message: "User not found"};
    }

    return user;
};

export const getProfileById = async (id: string, requesterId: string) => {
    if (!requesterId) {
        throw {status: 401, message: "Unauthorized: User not authenticated"};
    }

    const user = await User.findById(id)
        .select("-password")
        .populate({
            path: "posts",
            options: {sort: {createdAt: -1}},
            populate: {
                path: "author_id",
                select: "_id email username avatar",
            },
        })
        .exec();

    if (!user) {
        throw {status: 404, message: "User not found"};
    }

    return user;
};

export const followUser = async (targetUserId: string, currentUserId: string) => {
    const user = await User.findById(targetUserId)
        .select("-password")
        .populate({
            path: "posts",
            options: { sort: { createdAt: -1 } },
        })
        .exec();

    if (!user) {
        throw { status: 404, message: "User not found" };
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
        throw { status: 404, message: "Authenticated user not found" };
    }

    const currentUserObjId = new mongoose.Types.ObjectId(currentUserId);
    const targetUserObjId = new mongoose.Types.ObjectId(targetUserId);

    // Ensure arrays exist
    if (!user.followers) user.followers = [];
    if (!currentUser.following) currentUser.following = [];

    const isAlreadyFollowing = user.followers.some(
        (id) => id.toString() === currentUserObjId.toString()
    );

    if (isAlreadyFollowing) {
        // Unfollow
        user.followers = user.followers.filter(
            (id) => id.toString() !== currentUserObjId.toString()
        );
        currentUser.following = currentUser.following.filter(
            (id) => id.toString() !== targetUserObjId.toString()
        );
        await user.save();
        await currentUser.save();
        return { user, alreadyFollowing: true };
    } else {
        // Follow
        user.followers.push(currentUserObjId);
        currentUser.following.push(targetUserObjId);
        await user.save();
        await currentUser.save();
        return { user, alreadyFollowing: false };
    }
};

export const updateProfile = async (id: string, requesterId: string, body: any) => {
    if (!requesterId) {
        throw { status: 401, message: "Unauthorized: User not authenticated" };
    }

    if (requesterId !== id) {
        throw { status: 403, message: "Forbidden: You cannot edit another user's profile" };
    }

    // Validate incoming data
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
        throw { status: 400, message: "Invalid input", errors: parsed.error.errors };
    }

    const updateData = {
        ...parsed.data,
        updatedAt: new Date(),
    };

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
    });

    if (!updatedUser) {
        throw { status: 404, message: "User not found" };
    }

    return updatedUser.populate("posts");
};
