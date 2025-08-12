// services/commentService.ts
import { Types } from "mongoose";
import Comment, { validateComment } from "../models/comment";
import { CommentUpdateInput } from "../Types/comment";

export const createComment = async (userId: string, postId: string, content: string) => {
    const commentData = {
        user: new Types.ObjectId(userId),
        post: new Types.ObjectId(postId),
        content,
        likes: [],
        createdAt: new Date()
    };

    const result = validateComment(commentData);
    if (!result.success) {
        throw { status: 400, message: "Validation failed", errors: result.error.errors };
    }

    const comment = new Comment(commentData);
    await comment.save();
    await comment.populate('user', 'username avatar');

    return comment;
};

export const deleteComment = async (commentId: string) => {
    if (!Types.ObjectId.isValid(commentId)) {
        throw { status: 400, message: "Invalid comment ID", errors: { id: 'Invalid comment ID' } };
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw { status: 404, message: "Comment not found" };
    }

    await Comment.deleteOne({ _id: commentId });
    return true;
};

export const updateComment = async (commentId: string, body: CommentUpdateInput) => {
    if (!Types.ObjectId.isValid(commentId)) {
        throw { status: 400, message: "Invalid comment ID", errors: { id: 'Invalid comment ID' } };
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw { status: 404, message: "Comment not found" };
    }

    const updateData = {
        ...body,
        user: comment.user,
        post: comment.post,
        createdAt: comment.createdAt,
        likes: comment.likes
    };

    const result = validateComment(updateData);
    if (!result.success) {
        throw { status: 400, message: "Validation failed", errors: result.error.errors };
    }

    await Comment.findByIdAndUpdate(
        commentId,
        { $set: updateData },
        { new: true }
    ).populate("user", "username avatar");

    return updateData;
};

export const getCommentsByPost = async (postId: string) => {
    if (!Types.ObjectId.isValid(postId)) {
        throw { status: 400, message: "Invalid post ID" };
    }

    return await Comment.find({ post: postId })
        .populate("user", "username avatar")
        .sort({ createdAt: -1 });
};

export const likeComment = async (commentId: string, userId: string) => {
    if (!Types.ObjectId.isValid(commentId)) {
        throw { status: 400, message: "Invalid comment ID", errors: { id: "Invalid comment ID" } };
    }

    if (!Types.ObjectId.isValid(userId)) {
        throw { status: 400, message: "Invalid user ID", errors: { id: "Invalid user ID" } };
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw { status: 404, message: "Comment not found" };
    }

    const alreadyLiked = comment.likes.some(
        (like) => like.user.toString() === userId.toString()
    );

    if (alreadyLiked) {
        comment.likes = comment.likes.filter(
            (like) => like.user.toString() !== userId.toString()
        );
    } else {
        comment.likes.push({
            user: new Types.ObjectId(userId),
            createdAt: new Date(),
        });
    }

    await comment.save();

    return { alreadyLiked, likes: comment.likes };
};
