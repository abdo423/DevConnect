import { Comment } from "./comment";

interface Post {
    _id: string;
    title: string;
    content: string;
    author_id: string; // user ID
    image?: string;
    likes?: Array<string | { user: string; createdAt: string }>; // Match global Post likes type
    comments?: Comment[] | string[]; // Can be populated objects or IDs, matches global interface
    createdAt: string;
    updatedAt: string;
    __v?: number;
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
