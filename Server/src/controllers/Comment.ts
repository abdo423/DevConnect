import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import config from "config";
import {Types} from "mongoose";
import Comment, { validateComment } from "../models/Comment";
import Post from "../models/Post";

// Secret for JWT (should be in .env)
const JWT_SECRET = config.get<string>("jwt.secret");
const expiresIn = config.get<string>("jwt.expiresIn");


// controllers/CommentController.ts
import * as CommentService from "../services/CommentService";

export const createComment = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    try {
        const comment = await CommentService.createComment(
            req.user.id,
            req.body.post,
            req.body.content
        );

        return res.status(201).json({
            message: "Comment created successfully",
            comment,
        });
    } catch (err: any) {
        if (err.type === 'ValidationError') {
            return res.status(400).json({ errors: err.errors });
        }
        console.error("Error creating comment:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const deleteComment = async (req: Request, res: Response) => {
    try {
        await CommentService.deleteComment(req.params.id);
        return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err: any) {
        if (err.type === 'ValidationError') {
            return res.status(400).json({ errors: err.errors });
        }
        if (err.type === 'NotFound') {
            return res.status(404).json({ message: err.message });
        }
        console.error("Error deleting comment:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const updateComment = async (req: Request, res: Response) => {
    try {
        const { content } = req.body;
        const updatedComment = await CommentService.updateComment(req.params.id, { content });
        return res.status(200).json({
            message: "Comment updated successfully",
            comment: updatedComment,
        });
    } catch (err: any) {
        if (err.type === "ValidationError") {
            return res.status(400).json({ errors: err.errors });
        }
        if (err.type === "NotFound") {
            return res.status(404).json({ message: err.message });
        }
        console.error("Error updating comment:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const getCommentsByPost = async (req: Request, res: Response) => {
    const postId = req.params.id;

    try {
        const comments = await CommentService.getCommentsByPost(postId)
        res.status(200).json({ comments });
    } catch (error:any) {
        if (error.type === "ValidationError") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const likeComment = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { alreadyLiked, likes } = await CommentService.likeComment(
            req.params.id,
            userId
        );

        return res.status(200).json({
            message: alreadyLiked ? "Comment unliked" : "Comment liked",
            likes,
        });
    } catch (error: any) {
        if (error.type === "ValidationError") {
            return res.status(400).json({ errors: error.errors });
        }
        if (error.type === "NotFound") {
            return res.status(404).json({ message: error.message });
        }
        console.error("Error liking comment:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};