// Post interface
export interface Post {
    _id: string;
    title: string;
    content: string;
    image: string;
    likes?: Array<
        string | { user: string; createdAt: string; _id: string }
    >;
    comments: string[];
    author_id: string | {
        _id: string;
        email: string;
        avatar?: string;
        username: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

// Slice state interface
export interface PostsState {
    posts: Post[];
    loading: boolean;
    error: string | null;
    postCreated: boolean;
    postDeleted: boolean;
    postUpdated: boolean;
    currentPost: Post | null;
}


export type PostType = {
    _id: string;
    title: string;
    content: string;
    image?: string;
    author_id: string | {
        _id: string;
        email: string;
        avatar?: string;
        username: string;
    };
    likes?: Array<
        string | { user: string; createdAt: string; _id: string }
    >;
    comments?: string[];
    createdAt:  Date;
    updatedAt?: Date;
    __v?: number;
};
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
