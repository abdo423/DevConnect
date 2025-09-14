export interface User {
    _id: string;
    username: string;
    avatar: string;
}

export interface Comment {
    _id: string;
    user: User;
    post: string;        // post ID
    content: string;
    createdAt: string;
    likes: string[];     // user IDs who liked
}
