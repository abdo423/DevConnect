import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import Post, {validatePost} from '../models/Post';
import config from "config";
import User from "../models/User";

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
        likes: 0,
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
        res.status(201).json({message: 'Post created successfully', post: postData});
    } catch (err) {
        res.status(500).json({message: 'Server error', error: err});
    }
}

export const getPosts = async (req: Request, res: Response) => {
    try {
        const posts = await Post.find();
        res.status(200).json({posts});
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
    res.status(200).json({message: 'Post deleted successfully'});
}
export const updatePost = async (req: Request, res: Response) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Create update object with only the necessary fields
        const updateData = {
            ...req.body,  // New data from request
            author_id: post.author_id.toString(),  // Preserve original author
            likes: post.likes,          // Preserve original likes
            comments: post.comments,    // Preserve original comments
            createdAt: post.createdAt,  // Preserve original creation date
            updatedAt: new Date()       // Set new update date
        };

        // Validate the combined data
        const result = validatePost(updateData);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.errors });
        }

        // Update the post
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        res.status(200).json({
            message: 'Post updated successfully',
            post: updatedPost
        });

    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}