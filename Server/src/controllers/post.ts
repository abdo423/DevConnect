import {Request, Response} from 'express';
import * as postService from "../services/postService";
import {CreatePostDTO} from "../Types/post";
import {AppError} from "../Types/Error";


export const createPost = async (
    req: Request<{}, {}, CreatePostDTO>,
    res: Response
) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({message: "User not authenticated"});
    }

    try {
        const populatedPost = await postService.createPost(userId, req.body);
        res.status(201).json({message: 'Post created successfully', post: populatedPost});
    } catch (err: unknown) {
        const error = err as AppError;
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
            ...(error.errors && {errors: error.errors}) // Include validation errors if present
        });
    }
};



export const getPosts = async (req: Request, res: Response) => {
    try {
        const posts = await postService.getAllPosts();
        res.status(200).json(posts);
    } catch (err: unknown) {
        const error = err as AppError;
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
            ...(error.errors && {errors: error.errors})
        });
    }
};


export const deletePost = async (req: Request, res: Response) => {
    const postId = req.params.id;
    try {
        const post = await postService.deletePost(postId);
        res.status(200).json({message: "Post deleted successfully", post});
    } catch (err: unknown) {
        const error = err as AppError;
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
            ...(error.errors && {errors: error.errors})
        });
    }
};


export const updatePost = async (req: Request, res: Response) => {
    try {
        const updatedPost = await postService.updatePost(req.params.id, req.body);

        res.status(200).json({
            message: "Post updated successfully",
            post: updatedPost,
        });
    } catch (err: unknown) {
        const error = err as AppError;
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
            ...(error.errors && {errors: error.errors}),
        });
    }
};


export const likePost = async (req: Request, res: Response) => {
    const postId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({message: "User not authenticated"});
    }

    try {
        const {alreadyLiked, likes} = await postService.likePost(postId, userId);

        return res.status(200).json({
            message: alreadyLiked ? "Post unliked" : "Post liked",
            likes,
        });
    }  catch (err: unknown) {
        const error = err as AppError;
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
            ...(error.errors && {errors: error.errors}),
        });
    }
};

export const getCommentsByPostIdArray = async (req: Request, res: Response) => {
    const postId = req.params.id;

    try {
        const comments = await postService.getCommentsByPostId(postId);
        res.status(200).json({ comments });
    }catch (err: unknown) {
        const error = err as AppError;
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
            ...(error.errors && {errors: error.errors}),
        });
    }
};



