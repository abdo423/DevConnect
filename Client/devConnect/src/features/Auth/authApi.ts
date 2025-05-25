import axios from 'axios';

const BASE_URL = 'http://localhost:3000/auth'; // change this to your backend URL

export const loginUser = async (credentials: { email: string; password: string }) => {
    try {
        const response = await axios.post(`${BASE_URL}/login`, credentials, {withCredentials: true});

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
};

export const registerUser = async (credentials: { email: string; password: string ,username:string}) => {
    try {
        const response = await axios.post(`${BASE_URL}/register`, credentials, {withCredentials: true});

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
};
export const checkLogin = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/check`, {
            withCredentials: true, // very important to send cookie
        });
        return response.data.user;
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
        throw error;
    }
};

export const logoutUser = async () => {
  try {
      const response = await axios.post("http://localhost:3000/auth/logout", {}, {
          withCredentials: true
      });
      return response;
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

