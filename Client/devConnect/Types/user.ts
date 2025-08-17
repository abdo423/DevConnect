interface Like {
    user: string; // user ID
    createdAt: string;
}

interface Comment {
    user: string; // user ID
    post: string; // post ID
    content: string;
    likes: Like[];
    createdAt: string;
}


interface User {
    user: {
        _id: string;
        username: string;
        email: string;
        avatar: string;
        bio: string;
        posts: Array<{
            _id: string;
            title: string;
            content: string;
            author_id: string;
            image: string;
            likes: Like[];
            comments: Comment[];
            createdAt: string;
            updatedAt: string;
        }>;
        followers: string[];
        following: string[];
        createdAt: string;
        updatedAt: string;
    } | null;
    loading: boolean;
    error: string | null;
    isLoggedIn: boolean;
}

export default User;