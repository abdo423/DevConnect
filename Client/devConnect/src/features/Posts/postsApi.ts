import axios from 'axios';

const BASE_URL = 'http://localhost:3000/post'; // update with your backend URL

// axios instance with cookie support
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Create Post
export const createPost = async (post: {
  title: string;
  content: string;
  image?: string;
}) => {
  try {
    const response = await api.post('/create', post);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error;
    }
    throw error;
  }
};

// Get All Posts
export const getPosts = async () => {
  try {
    const response = await api.get('/all');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error;
    }
    throw error;
  }
};

// Delete Post
export const deletePost = async (id: string) => {
  try {
    const response = await api.delete(`/delete/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error;
    }
    throw error;
  }
};

// Like Post
export const likePost = async (id: string) => {
  try {
    const response = await api.post(`/like/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error;
    }
    throw error;
  }
};

// Update Post
export const updatePost = async (
  id: string,
  post: { title: string; content: string; image?: string }
) => {
  try {
    const response = await api.patch(`/update/${id}`, post, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error;
    }
    throw error;
  }
};
