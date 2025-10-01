import axios from 'axios';

// Axios instance for auth
const authApi = axios.create({
  baseURL: 'http://localhost:3000/auth',
  withCredentials: true, // always send cookies
});

export const loginUser = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const response = await authApi.post('/login', credentials);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error;
    }
    throw error;
  }
};

export const registerUser = async (credentials: {
  email: string;
  password: string;
  username: string;
}) => {
  try {
    const response = await authApi.post('/register', credentials);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error;
    }
    throw error;
  }
};

export const checkLogin = async () => {
  try {
    const response = await authApi.get('/check');
    return response.data.user;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error;
    }
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await authApi.post('/logout', {});
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error;
    }
    throw error;
  }
};
