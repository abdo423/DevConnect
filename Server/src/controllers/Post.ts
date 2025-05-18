import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import Post, {validatePost, validateUpdatePost} from '../models/Post';
import config from "config";
import User from "../models/User";
import Comment from "../models/Comment";
import {Types} from "mongoose";
// Secret for JWT (should be in .env)
const JWT_SECRET = config.get<string>("jwt.secret");
const expiresIn = config.get<string>("jwt.expiresIn");

export const createPost = async (req: Request, res: Response) => {

    if (!req.user) {
        return res.status(401).json({message: 'Unauthorized: User not authenticated'});
    }
    console.log(req.user.id);
    const postData = {
        ...req.body,
        author_id: req.user.id,
        likes: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const result = validatePost(postData);
    if (!result.success) {
        return res.status(400).json({errors: result.error.errors});


    }
    try {


        const post = new Post(postData);
        await post.save();
        const populatedPost = await Post.findById(post._id).populate('author_id', 'name email avatar').populate('comments', 'content createdAt ');
        const user = await User.findById(req.user.id);
        console.log(user);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'account  doesn\'t exsist',
            });
        }
        await User.findByIdAndUpdate(
            req.user.id,
            {$push: {posts: post.id}}, // Add post id to the posts array
            {new: true} // Return the updated document (optional)
        );
        res.status(201).json({message: 'Post created successfully', post: populatedPost});
    } catch (err) {
        res.status(500).json({message: 'Server error', error: err});
    }
}

export const getPosts = async (req: Request, res: Response) => {
    try {
        const posts = await Post.find().populate('author_id', 'name email avatar username').populate('comments', 'content createdAt  ');
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({message: 'Server error', error: err});
    }
};

export const deletePost = async (req: Request, res: Response) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).json({message: 'Post not found'});
    }
    await Post.deleteOne({_id: req.params.id});
    res.status(200).json({message: 'Post deleted successfully',post: post});
}
export const updatePost = async (req: Request, res: Response) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Extract only the fields we want to allow updating


        const updateData = {
            title: req.body.title ?? post.title,
            content: req.body.content ?? post.content,
            image: req.body.image ?? post.image,
            author_id: post.author_id.toString(),
            likes: post.likes,
            comments: post.comments,
            createdAt: post.createdAt,
            updatedAt: new Date()
        };

        // Validate the combined data
        const result = validateUpdatePost(updateData);
        if (!result.success) {
            console.error('Validation failed:', result.error.errors);
            return res.status(400).json({
                message: 'Validation failed',
                errors: result.error.errors,
                receivedData: req.body // Include received data for debugging
            });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            {
                new: true,
                populate: {
                    path: 'author_id',
                    select: 'name email avatar ' // Include any fields you need
                }
            }
        );

        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found after update' });
        }

        res.status(200).json({
            message: 'Post updated successfully',
            post: updatedPost
        });

    } catch (error: any) {
        console.error('Error updating post:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

export const likePost = async (req:Request, res: Response) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }
    const userId = new Types.ObjectId(req.user?.id);
     console.log(req.user);
    // Check if the user already liked the post
    const alreadyLiked = post.likes.some((like) => like.user.toString() === userId.toString());

    if (alreadyLiked) {
        // Unlike: remove the user's like
        post.likes = post.likes.filter((like) => like.user.toString() !== userId.toString());
    } else {
        // Like: add the like with current timestamp
        post.likes.push({
            user: userId,
            createdAt: new Date(),
        });
    }

    await post.save();

    return res.status(200).json({ message: alreadyLiked ? 'Post unliked' : 'Post liked', likes: post.likes });
};

export const getCommentsByPostIdArray = async (req: Request, res: Response) => {
    const postId = req.params.id;

    try {
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comments = await Comment.find({ _id: { $in: post.comments } })
            .populate('user', 'name email') // optional: populate user
            .sort({ createdAt: -1 });

        res.status(200).json({ comments });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};