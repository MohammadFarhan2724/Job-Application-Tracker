import axiosInstance from './axios';

export const connectGmail = async () => {
    const response = await axiosInstance.get('/api/auth/google');
    return response.data.url;
};