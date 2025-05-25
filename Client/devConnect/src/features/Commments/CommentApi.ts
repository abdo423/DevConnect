import axios from 'axios';
import Cookies from "js-cookie";

const BASE_URL = 'http://localhost:3000/comment';


export const getComments = async (id: string) => {
    try {
        const token = Cookies.get("auth-token");
        if (!token) {
            throw new Error("Not authenticated");
        }
        const response = await axios.get(`${BASE_URL}/post/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error details:', {
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers
            });
            throw error.response?.data || error;
        }
        console.error('Non-Axios error:', error);

    }
}


export const createComment = async (commentData: { post: string; content: string }) => {
    try {
        const token = Cookies.get("auth-token");
        if (!token) {
            throw new Error("Not authenticated");
        }

        const response = await axios.post(
            `${BASE_URL}/create`,
            {
                content: commentData.content,
                post: commentData.post,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                withCredentials: true
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error details:', {
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers
            });
            throw error.response?.data || error;
        }
        console.error('Non-Axios error:', error);
        throw error;
    }
}