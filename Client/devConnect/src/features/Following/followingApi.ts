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
            console.error("Axios error details:", {
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers,
            });
            throw error.response?.data || error;
        }
        console.error("Non-Axios error:", error);
    }
};

// Example: get messages
export const getUserMessages = async () => {
    try {
        const response = await api.get("/sentMessages");
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error details:", {
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers,
            });
            throw error.response?.data || error;
        }
        console.error("Non-Axios error:", error);
    }
};
