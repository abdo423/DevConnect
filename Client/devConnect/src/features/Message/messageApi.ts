import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/message", // backend URL
    withCredentials: true, // send cookies with every request
});

// ✅ Send message
export const createMessage = async (message: { content: string; receiverId: string }) => {
    try {
        const response = await api.post("/send", message);
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
        throw error;
    }
};

// ✅ Get messages between users
export const getMessagesBetweenUsers = async (id: string) => {
    try {
        const response = await api.get(`/messages/${id}`);
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
        throw error;
    }
};
