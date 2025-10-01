import axios from 'axios';

// Axios instance for comment-related requests
const commentApi = axios.create({
  baseURL: 'http://localhost:3000/comment',
  withCredentials: true, // always include cookies
});

// Get all comments for a post
export const getComments = async (postId: string) => {
  try {
    const response = await commentApi.get(`/post/${postId}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Create a comment
export const createComment = async (commentData: {
  post: string;
  content: string;
}) => {
  try {
    const response = await commentApi.post('/create', commentData);
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
    handleAxiosError(error);
  }
};

// Shared error handler
const handleAxiosError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    throw error.response?.data || error;
  }
  throw error;
};
