import axios from 'axios';

const BASE_URL = 'https://dummyjson.com/auth/login'; // change this to your backend URL

export const loginUser = async (credentials: { username: string; password: string }) => {
    try {
        const response = await axios.post(`${BASE_URL}`, credentials);
        return response.data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error; // Rethrow the error for further handling
    };
};

