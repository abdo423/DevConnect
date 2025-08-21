// controllers/CommentController.ts
import { Request, Response } from 'express';
import * as CommentService from "../services/commentService";
import { AppError } from '../Types/Error';

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

    } catch (error: unknown) {
        const err = error as AppError;
        return res.status(err.status || 500).json({
            message: err.message || "Internal server error",
            ...(err.errors && { errors: err.errors })
        });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        await CommentService.deleteComment(req.params.id);
        return res.status(200).json({ message: "Comment deleted successfully" });

    } catch (error: unknown) {
        const err = error as AppError;
        return res.status(err.status || 500).json({
            message: err.message || "Internal server error",
            ...(err.errors && { errors: err.errors })
        });
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

    } catch (error: unknown) {
        const err = error as AppError;
        return res.status(err.status || 500).json({
            message: err.message || "Internal server error",
            ...(err.errors && { errors: err.errors })
        });
    }
};

export const getCommentsByPost = async (req: Request, res: Response) => {
    try {
        const comments = await CommentService.getCommentsByPost(req.params.id);

        return res.status(200).json({ comments });

    } catch (error: unknown) {
        const err = error as AppError;
        return res.status(err.status || 500).json({
            message: err.message || "Internal server error",
            ...(err.errors && { errors: err.errors })
        });
    }
};

export const likeComment = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!req.user || !userId) {
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

    } catch (error: unknown) {
        const err = error as AppError;
        return res.status(err.status || 500).json({
            message: err.message || "Internal server error",
            ...(err.errors && { errors: err.errors })
        });
    }
};
