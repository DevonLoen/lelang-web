import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { Auth } from '../enums/auth-token';
import Cookies from 'js-cookie';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

export const publicApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

const unwrap = (response: AxiosResponse) => response.data;

const attachToken = (config: InternalAxiosRequestConfig) => {
  const token = Cookies.get(Auth.TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

const rejectError = (error: unknown) => Promise.reject(error);

const handleError = (error: unknown) => {
  if (error instanceof AxiosError && error.response) {
    const data = error.response.data as { message?: string; error?: string };
    const message = data?.message || data?.error || error.message;
    return Promise.reject(new Error(message));
  }
  if (error instanceof AxiosError && error.request) {
    return Promise.reject(new Error('Network error. Please check your connection.'));
  }
  return Promise.reject(error);
};

apiClient.interceptors.request.use(attachToken, rejectError);
apiClient.interceptors.response.use(unwrap, handleError);
publicApiClient.interceptors.response.use(unwrap, handleError);
