import axios from "axios";

// Axios instance for comment-related requests
const commentApi = axios.create({
    baseURL: "http://localhost:3000/comment",
    withCredentials: true, // always include cookies
});

// Get all comments for a post
export const getComments = async (postId: string) => {
    try {
        const response = await commentApi.get(`/post/${postId}`);
        return response.data;
    } catch (error) {
        console.error("❌ getComments failed"); // fail
        handleAxiosError(error);
    }
};

// Create a comment
export const createComment = async (commentData: { post: string; content: string }) => {

    try {
        const response = await commentApi.post("/create", commentData);
        return response.data;
    } catch (error) {
        handleAxiosError(error);
    }
};

// Like a comment
export const likeComment = async (id: string) => {
    try {
        const response = await commentApi.post(`/like/${id}`);
        return response.data;
    } catch (error) {
        console.error("❌ likeComment failed");
        handleAxiosError(error);
    }
};

// Shared error handler
const handleAxiosError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        console.error("❌ Axios error details:", {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
        });
        throw error.response?.data || error;
    }
    console.error("❌ Non-Axios error:", error);
    throw error;
};

