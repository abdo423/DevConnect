// controllers/CommentController.ts
import { Request, Response } from 'express';
import * as CommentService from "../services/commentService";

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

    } catch (error: any) {
        console.error("Error creating comment:", error);
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
            ...(error.errors && { errors: error.errors })
        });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        await CommentService.deleteComment(req.params.id);
        return res.status(200).json({ message: "Comment deleted successfully" });

    } catch (error: any) {
        console.error("Error deleting comment:", error);
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
            ...(error.errors && { errors: error.errors })
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

    } catch (error: any) {
        console.error("Error updating comment:", error);
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
            ...(error.errors && { errors: error.errors })
        });
    }
};

export const getCommentsByPost = async (req: Request, res: Response) => {
    try {
        const comments = await CommentService.getCommentsByPost(req.params.id);
        return res.status(200).json({ comments });

    } catch (error: any) {
        console.error("Error getting comments:", error);
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
            ...(error.errors && { errors: error.errors })
        });
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
        console.error("Error liking comment:", error);
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
            ...(error.errors && { errors: error.errors })
        });
    }
};
