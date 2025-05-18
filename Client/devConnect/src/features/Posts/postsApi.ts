import axios from 'axios';
import Cookies from 'js-cookie'; // to access cookies

const BASE_URL = 'http://localhost:3000/post'; // update with your backend URL

export const createPost = async (post: { title: string; content: string; image?: string }) => {
    try {
        const token = Cookies.get("auth-token");
        if (!token) {
            throw new Error("Not authenticated");
        }
        const response = await axios.post(
            `${BASE_URL}/create`,

            post,
            {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data'

                },
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

export const getPosts = async () => {
    try {

        const response = await axios.get(
            `${BASE_URL}/all`, {
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
        throw error;
    }
}

export const deletePost = async (id: string) => {
    try {
        const token = Cookies.get("auth-token");
        if (!token) {
            throw new Error("Not authenticated");
        }
        const response = await axios.delete(
            `${BASE_URL}/delete/${id}`, {withCredentials: true, headers: {Authorization: `Bearer ${token}`}}
        )
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
export const likePost = async (id: string) => {
    try {
        const token = Cookies.get("auth-token");
        if (!token) {
            throw new Error("Not authenticated");
        }
        const response = await axios.post(
            `${BASE_URL}/like/${id}`, {}, {withCredentials: true, headers: {Authorization: `Bearer ${token}`}}
        )
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

export const updatePost = async (id: string, post: { title: string; content: string; image?: string }) => {
    try {
        const token = Cookies.get("auth-token");
        if (!token) {
            throw new Error("Not authenticated");
        }
        const response = await axios.patch(
            `${BASE_URL}/update/${id}`,
            post,
            {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json '
                }
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
};