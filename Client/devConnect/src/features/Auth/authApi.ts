import axios from 'axios';

const BASE_URL = 'http://localhost:3000/auth'; // change this to your backend URL

export const loginUser = async (credentials: { email: string; password: string }) => {
    try {
        const response = await axios.post(`${BASE_URL}/login`, credentials, {withCredentials: true});

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        } else {
            console.error('Unexpected error logging in:', error);
            throw error;
        }
    }
};

export const registerUser = async (credentials: { email: string; password: string }) => {
    try {
        const response = await axios.post(`${BASE_URL}/register`, credentials, {withCredentials: true});

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        } else {
            console.error('Unexpected error logging in:', error);
            throw error;
        }
    }
};
export const checkLogin = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/check`, {
            withCredentials: true, // very important to send cookie
        });
        return response.data.user;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error.response?.data?.message || 'Not authenticated';
        }
        throw error;
    }
};

export const logoutUser = async () => {
    const response = await axios.post(`${BASE_URL}/logout`, {withCredentials: true});
    return response.data;
}