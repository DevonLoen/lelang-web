import axios from 'axios';
import { Auth } from '../enums/auth-token';
import Cookies from 'js-cookie';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

const unwrap = (response: any): any => response.data;

const attachToken = (config: any) => {
  const token = Cookies.get(Auth.TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

const rejectError = (error: any) => Promise.reject(error);

const handleError = (error: any) => {
  if (error.response) {
    const message = error.response.data?.message || error.response.data?.error || error.message;
    return Promise.reject(new Error(message));
  }
  if (error.request) {
    return Promise.reject(new Error('Network error. Please check your connection.'));
  }
  return Promise.reject(error);
};

apiClient.interceptors.request.use(attachToken, rejectError);
apiClient.interceptors.response.use(unwrap, handleError);
