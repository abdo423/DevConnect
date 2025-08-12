import {Request, Response} from "express";
import Comment from "../models/comment";

export interface CommentUpdateInput {
    content: string;
}

