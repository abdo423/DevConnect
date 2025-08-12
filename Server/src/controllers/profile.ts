import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import User, {validateUser} from '../models/user';
import mongoose from "mongoose";
import {Types} from "mongoose";
import * as z from 'zod';

const profileUpdateSchema = z.object({
    bio: z.string().max(500).optional(),
    avatar: z.string().optional(),
    username: z.string().min(3).max(30).optional(), // only include if allowed to update
});

export const getProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await User.findById(req.user.id)
            .select('-password') // exclude password
            .populate({
                path: 'posts',
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: 'author_id',
                    select: '_id email username avatar'
                }
            })
            .exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};



export const getProfileById = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
        }

        const user = await User.findById(req.params.id)
            .select('-password')
            .populate({
                path: 'posts',
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: 'author_id',
                    select: '_id email username avatar'
                }
            })
            .exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};


export const FollowUser = async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id)
        .select('-password')
        .populate({
            path: 'posts',
            options: {sort: {createdAt: -1}}
        })
        .exec();

    if (!user) {
        return res.status(404).json({message: 'User not found'});
    }

    if (!req.user) {
        return res.status(401).json({message: 'Unauthorized: User not authenticated'});
    }

    const CurrentUser = await User.findById(req.user.id);
    if (!CurrentUser) {
        return res.status(404).json({message: 'Authenticated user not found'});
    }

    const currentUserId = new mongoose.Types.ObjectId(req.user.id);
    const targetUserId = new mongoose.Types.ObjectId(req.params.id);

    // Ensure arrays are initialized
    if (!user.followers) user.followers = [];
    if (!CurrentUser.following) CurrentUser.following = [];

    const isAlreadyFollowing = user.followers.some((id: Types.ObjectId) =>
        id.toString() === currentUserId.toString()
    );

    if (isAlreadyFollowing) {
        // Unfollow
        user.followers = user.followers.filter(
            id => id.toString() !== currentUserId.toString()
        );
        CurrentUser.following = CurrentUser.following.filter(
            (id: Types.ObjectId) => id.toString() !== targetUserId.toString()
        );
        await user.save();
        await CurrentUser.save();
        return res.status(200).json({user, message: 'User unfollowed successfully'});
    } else {
        // Follow
        user.followers.push(currentUserId);
        CurrentUser.following.push(targetUserId);
        await user.save();
        await CurrentUser.save();
        return res.status(200).json({user, message: 'User followed successfully'});
    }
};
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
        }

        // Optional: ensure the authenticated user is editing their own profile
        if (req.user.id !== id) {
            return res.status(403).json({ message: 'Forbidden: You cannot edit another user\'s profile' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate incoming data
        const parsed = profileUpdateSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: 'Invalid input', errors: parsed.error.errors });
        }

        const updateData = {
            ...parsed.data,
            updatedAt: new Date(),
        };

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).populate('posts');
        return res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser,
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
