interface Like {
    user: string; // user ID
    createdAt: string;
}

interface Post {
    _id: string;
    title: string;
    content: string;
    author_id: string; // user ID
    image: string;
    likes: Like[];
    comments: string[]; // comment IDs from profile endpoint
    createdAt: string;
    updatedAt: string;
}

interface UserProfile {
    _id: string;
    username: string;
    email: string;
    avatar: string;
    bio: string;
    posts: Post[];
    followers: string[];
    following: string[];
    createdAt: string;
    updatedAt: string;
}

interface ProfileState {
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;

}

export default ProfileState;
