import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import config from "config";
import {Types} from "mongoose";
import Comment, { validateComment } from "../models/Comment";

// Secret for JWT (should be in .env)
const JWT_SECRET = config.get<string>("jwt.secret");
const expiresIn = config.get<string>("jwt.expiresIn");


export const createComment = async (req: Request, res: Response) => {
    if(!req.user) return res.status(401).json({message: 'Unauthorized: User not authenticated'});
    console.log(
        req.user.id
    )
    const commentData = {
        user: new Types.ObjectId(req.user.id),
        post: req.body.post,
        content: req.body.content,
        createdAt: new Date()
    }
    const result = validateComment(commentData);
    if(!result.success) return res.status(400).json({errors: result.error.errors});
    const comment = new Comment(commentData);
    await comment.save();
    res.status(201).json({message: 'Comment created successfully'});
}

export const deleteComment = async (req: Request, res: Response) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    await Comment.deleteOne({_id: req.params.id});
    return res.status(200).json({ message: 'Comment deleted successfully' });
}

export const updateComment = async (req: Request, res: Response) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    const updateData = {
        ...req.body,
        user: comment.user.toString(),
        post: comment.post.toString(),
        createdAt: comment.createdAt
    }
    const result = validateComment(updateData);
    if (!result.success) return res.status(400).json({ errors: result.error.errors });
    await Comment.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
    );


    return res.status(200).json({ message: 'Comment updated successfully' });
}

export const getCommentsByPost = async (req: Request, res: Response) => {
    const postId = req.params.postId;

    try {
        const comments = await Comment.find({ post: postId })
            .populate('user', 'name email') // Populate user fields (optional)
            .sort({ createdAt: -1 }); // Optional: sort by newest first

        res.status(200).json({ comments });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
