import axios from 'axios';
import { Auth } from '../enums/auth-token';
import Cookies from 'js-cookie';

export const auctionClient = axios.create({
  baseURL: import.meta.env.VITE_AUCTIONSERVICE_URL,
  timeout: 3000,
});

export const authClient = axios.create({
  baseURL: import.meta.env.VITE_AUTHSERVICE_URL,
  timeout: 3000,
});

const unwrap = (response: any) => response.data;

auctionClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get(Auth.TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

authClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get(Auth.TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

auctionClient.interceptors.response.use(unwrap);
authClient.interceptors.response.use(unwrap);
