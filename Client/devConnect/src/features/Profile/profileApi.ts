import axios from "axios";

const BASE_URL = "http://localhost:3000/profile"; // update with your backend URL

// axios instance with cookie support
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // send cookies automatically
});

// Get current user's profile (cookie-based)
export const getProfile = async () => {
    try {
        const response = await api.get("/");
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error details:", {
                status: error.response?.status,
                data: error.response?.data,
            });
            throw error.response?.data || error;
        }
        throw error;
    }
};

// Get profile by ID
export const getProfileById = async (id: string) => {
    try {
        const response = await api.get(`/${id}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error details:", {
                status: error.response?.status,
                data: error.response?.data,
            });
            throw error.response?.data || error;
        }
        throw error;
    }
};

// Follow user
export const followUser = async (id: string) => {
    try {
        const response = await api.post(`/follow/${id}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error details:", {
                status: error.response?.status,
                data: error.response?.data,
            });
            throw error.response?.data || error;
        }
        throw error;
    }
};

// Update profile
export const updateProfile = async (
    id: string,
    profile: { username: string; bio: string; avatar?: string }
) => {
    try {
        const response = await api.patch(`/update/${id}`, profile);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error details:", {
                status: error.response?.status,
                data: error.response?.data,
            });
            throw error.response?.data || error;
        }
        throw error;
    }
};
