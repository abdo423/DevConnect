import { Comment } from "./comment";

export interface Post {
    _id: string;
    title: string;
    content: string;
    image?: string;
    likes?: Array<string | { user: string; createdAt: string }>;
    comments?: Comment[] | string[];   // Can be full objects or just IDs
    author_id:
        | string
        | {
        _id: string;
        email: string;
        avatar?: string;
        username: string;
    };
    createdAt: Date | string;
    updatedAt?: Date | string;
    __v?: number;
}

export type PostType = Post;

export type PostProps = {
    post: PostType;
    user?: {
        id?: string;
        username: string;
        email: string;
        avatar?: string;
        bio?: string;
    };
};
