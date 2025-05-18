import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import User, {validateUser} from '../models/User';
import config from "config";

export const getProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({message: 'Unauthorized'});

        const user = await User.findById(req.user.id)
            .select('-password') // exclude the password field
            .populate({
                path: 'posts',
                options: {sort: {createdAt: -1}}
            })
            .exec();

        if (!user) return res.status(404).json({message: 'User not found'});

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({message: 'Server error', error});
    }
};


export const getProfileById = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({message: 'Unauthorized: User not authenticated'});
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate({
                path: 'posts',
                options: {sort: {createdAt: -1}} // Optional sorting
            })
            .exec(); // Important to call exec() when using query builders

        if (!user) return res.status(404).json({message: 'User not found'});
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({message: 'Server error', error});
    }

}