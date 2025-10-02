import axios from "axios";
import Cookies from "js-cookie";
import { Auth } from "../../../enums/auth-token";

const API_URL = import.meta.env.VITE_API_URL;
const AUTH_URL = `${API_URL}/v1/auth`;
const USER_URL = `${API_URL}/v1/users`;

const AUTH_TOKEN_KEY = Auth.TOKEN_KEY;

interface LoginPayload {
  phone?: string;
  password?: string;
}

export interface SignupPayload {
  fullname: string;
  phone: string;
  nik: string;
  birth: string;
  gender: string;
  bankAccountNumber: string;
  password: string;
  otp: string;
}

interface VerifyOtpPayload {
  otp?: string;
}

interface SendOtpPayload {
  phone?: string;
}

interface ForgotPasswordPayload {
  phone?: string;
}
interface ResetPasswordPayload {
  // phone?: string;
  token: string;
  password?: string;
}

export class AuthService {
  async login(data: LoginPayload) {
    try {
      const res = await axios.post(`${USER_URL}/login`, data);
      Cookies.set(AUTH_TOKEN_KEY, res.data.token);
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || "Login failed");
    }
  }

  async signup(data: SignupPayload) {
    try {
      const res = await axios.post(`${USER_URL}/`, data);
      Cookies.set(AUTH_TOKEN_KEY, res.data.token);
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || "Sign Up failed");
    }
  }

  async sendOtp(data: SendOtpPayload) {
    try {
      const res = await axios.post(`${AUTH_URL}/request-otp`, data);
      Cookies.set(AUTH_TOKEN_KEY, res.data.token);
      return res.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error?.message || "Send Otp failed"
      );
    }
  }

  async forgotPassword(data: ForgotPasswordPayload) {
    try {
      const res = await axios.post(`${AUTH_URL}/forgot-password`, data);
      Cookies.set(AUTH_TOKEN_KEY, res.data.token);
      return res.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error?.message || "Forgot Password failed"
      );
    }
  }

  async resetPassword(data: ResetPasswordPayload) {
    try {
      const res = await axios.post(`${AUTH_URL}/reset-password`, data);
      Cookies.set(AUTH_TOKEN_KEY, res.data.token);
      return res.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error?.message || "Reset Password failed"
      );
    }
  }

  async logout() {
    try {
      Cookies.remove(AUTH_TOKEN_KEY);
      return;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || "Logout failed");
    }
  }

  getToken = (): string | undefined => {
    return Cookies.get(AUTH_TOKEN_KEY);
  };
}
