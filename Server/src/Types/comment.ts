import {Request, Response} from "express";
import Comment from "../models/comment";
import {Types} from "mongoose";
import {likes} from "../models/post";

export interface CommentUpdateInput {
    content: string;
}

export interface CommentData {
    user: Types.ObjectId;
    post: Types.ObjectId;
    content: string;
    likes: likes[];
    createdAt: Date;
}
