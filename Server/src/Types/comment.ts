import {Request, Response} from "express";
import Comment from "../models/Comment";

export interface CommentUpdateInput {
    content: string;
}

