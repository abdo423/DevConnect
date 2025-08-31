import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/auth",
    withCredentials: true, // always send cookies
});

// Example: get followings
export const getFollowings = async (id: string) => {
    try {
        const response = await api.get(`/following/${id}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error;
        }
    }
};

// Example: get messages
export const getUserMessages = async () => {
    try {
        const response = await api.get("/sentMessages");
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error;
        }
    }
};
