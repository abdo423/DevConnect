import axios from 'axios';

const BASE_URL = 'http://localhost:3000/auth/login'; // change this to your backend URL

export const loginUser = async (credentials: { email: string; password: string }) => {
    try {
        const response = await axios.post(`${BASE_URL}`, credentials);
        if (response.status === 200) {
            window.location.href = "/";
        }
        return response.data;
    }  catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error logging in:', error.response?.data);
            throw error;
        } else {
            console.error('Unexpected error logging in:', error);
            throw error;
        }
    }
};

