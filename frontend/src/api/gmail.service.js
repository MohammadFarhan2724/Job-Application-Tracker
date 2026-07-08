import axiosInstance from './axios';

export const connectGmail = async () => {
    const response = await axiosInstance.get('/auth/google');
    return response.data.url;
};

export const syncGmailApplications = async () => {
    const response = await axiosInstance.post('/import/gmail');
    return response.data;
};