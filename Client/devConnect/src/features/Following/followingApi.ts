import Cookies from "js-cookie";
import axios from "axios";

const BASE_URL =  'http://localhost:3000/auth';
export const getFollowings = async (id:string) => {
    try {
        const token = Cookies.get("auth-token");
        if (!token) {
            throw new Error("Not authenticated");
        }
        const response = await axios.get(
            `${BASE_URL}/following/${id}`,
            {
                headers:{
                    Authorization: `Bearer ${token}`
                },
                withCredentials: true
            }
        );
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
    }

}
export  const getUserMessages = async () => {
    try {
        const token = Cookies.get("auth-token");
        if (!token) {
            throw new Error("Not authenticated");
        }
        const response = await axios.get(
            `${BASE_URL}/sentMessages`,
            {
                headers:{
                    Authorization: `Bearer ${token}`
                },
                withCredentials: true
            }
        );
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
    }
}