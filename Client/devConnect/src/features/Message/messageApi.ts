import axios from 'axios';
import Cookies from 'js-cookie'; // to access cookies

const BASE_URL = 'http://localhost:3000/message'; // update with your backend URL


export const createMessage = async (message: { content: string; receiverId: string }) => {
    try {
        const token = Cookies.get("auth-token");
        if (!token) {
            throw new Error("Not authenticated");
        }
        const response = await axios.post(
            `${BASE_URL}/send`,
            message,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                withCredentials: true,
            }
        )
        return response.data;
    }catch (error) {
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
export const getMessagesBetweenUsers = async (id:string) => {
    try {
        const token = Cookies.get("auth-token");
        if (!token) {
            throw new Error("Not authenticated");
        }
        const response = await axios.get(
            `${BASE_URL}/messages/${id}`,

            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                withCredentials: true,
            }
        )
        return response.data;
    }catch (error) {
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