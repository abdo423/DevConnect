import axios from 'axios';
import Cookies from 'js-cookie'; // to access cookies

const BASE_URL = 'http://localhost:3000/profile'; // update with your backend URL

export const getProfile = async () => {
    try {
        const token = Cookies.get("auth-token");
        if (!token) {
            throw new Error("Not authenticated");
        }
        const response = await axios.get(
            BASE_URL,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                withCredentials: true,
            },
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

export const getProfileById = async (id: string) => {
    try {
        const token = Cookies.get("auth-token");
        if (!token) {
            throw new Error("Not authenticated");
        }
        const response = await axios.get(
            `${BASE_URL}/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                withCredentials: true,
            }
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