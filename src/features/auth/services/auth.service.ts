import Cookies from "js-cookie";
import { Auth } from "../../../enums/auth-token";
import { apiClient } from "../../../lib/axios";

const AUTH_TOKEN_KEY = Auth.TOKEN_KEY;

interface LoginPayload {
  phone?: string;
  password?: string;
}

export interface SignupPayload {
  fullname: string;
  phone: string;
  birth: string;
  gender?: string;
  password: string;
  otp: string;
}

interface SendOtpPayload {
  phone?: string;
}

export class AuthService {
  private formatPhone(phone: string): string {
    if (phone.startsWith('+62')) return phone;
    return `+62${phone}`;
  }

  async login(data: LoginPayload) {
    try {
      const payload = { ...data, ...(data.phone && { phone: this.formatPhone(data.phone) }) };
      const res = await apiClient.post('/auth/login', payload);
      Cookies.set(AUTH_TOKEN_KEY, res.data.token);
      return res;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  }

  async signup(data: SignupPayload) {
    try {
      const payload = { ...data, phone: this.formatPhone(data.phone) };
      const res = await apiClient.post('/auth/register', payload);
      return res;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Sign Up failed");
    }
  }

  async sendOtp(data: SendOtpPayload) {
    try {
      const payload = { ...data, ...(data.phone && { phone: this.formatPhone(data.phone) }) };
      const res = await apiClient.post('/auth/request-otp', payload);
      return res;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Send OTP failed");
    }
  }

  async logout() {
    Cookies.remove(AUTH_TOKEN_KEY);
  }

  getToken = (): string | undefined => {
    return Cookies.get(AUTH_TOKEN_KEY);
  };
}
