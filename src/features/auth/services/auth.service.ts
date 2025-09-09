import axios from "axios";
import Cookies from "js-cookie";
import { Auth } from "../../../enums/auth-token";

const API_URL = import.meta.env.VITE_API_URL;
const AUTH_URL = `${API_URL}/api/v1/auth`;
const AUTH_TOKEN_KEY = Auth.TOKEN_KEY;

interface loginPayload {
  email?: string;
  password?: string;
}

export class AuthService {
  async login(data: loginPayload) {
    try {
      const res = await axios.post(`${AUTH_URL}/login`, data);
      Cookies.set(AUTH_TOKEN_KEY, res.data.token);
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  }

  async logout() {
    try {
      Cookies.remove(AUTH_TOKEN_KEY);
      return;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Logout failed");
    }
  }

  getToken = (): string | undefined => {
    return Cookies.get(AUTH_TOKEN_KEY);
  };
}
