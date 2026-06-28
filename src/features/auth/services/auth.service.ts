import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Auth } from "../../../enums/auth-token";
import { apiClient } from "../../../lib/axios";

const AUTH_TOKEN_KEY = Auth.TOKEN_KEY;

interface LoginPayload {
  email?: string;
  password?: string;
}

export interface SignupPayload {
  fullname: string;
  email: string;
  birth: string;
  gender?: string;
  password: string;
  otp: string;
}

interface SendOtpPayload {
  email?: string;
}

interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  password: string;
}

interface SaveFcmTokenPayload {
  fcm_token: string;
}

interface ApiResult<T = unknown> {
  data: T;
  message?: string;
}

interface AuthTokenPayload {
  exp: number;
}

const getErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

export class AuthService {
  async login(data: LoginPayload): Promise<ApiResult<{ token: string }>> {
    try {
      const res = await apiClient.post('/auth/login', data) as ApiResult<{ token: string }>;
      const token = res.data.token;
      const { exp } = jwtDecode<AuthTokenPayload>(token.replace(/^Bearer\s+/i, ''));

      Cookies.set(AUTH_TOKEN_KEY, token, {
        expires: new Date(exp * 1000),
        sameSite: 'lax',
        secure: import.meta.env.PROD,
      });
      return res;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "Login failed"));
    }
  }

  async signup(data: SignupPayload): Promise<ApiResult> {
    try {
      const res = await apiClient.post('/auth/register', data) as ApiResult;
      return res;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "Sign Up failed"));
    }
  }

  async sendOtp(data: SendOtpPayload): Promise<ApiResult> {
    try {
      const res = await apiClient.post('/auth/request-otp', data) as ApiResult;
      return res;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "Send OTP failed"));
    }
  }

  async forgotPassword(data: ForgotPasswordPayload): Promise<ApiResult> {
    try {
      const res = await apiClient.post('/auth/forgot-password', data) as ApiResult;
      return res;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "Forgot password failed"));
    }
  }

  async resetPassword(data: ResetPasswordPayload): Promise<ApiResult> {
    try {
      const res = await apiClient.post('/auth/reset-password', data) as ApiResult;
      return res;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "Reset password failed"));
    }
  }

  async saveFcmToken(data: SaveFcmTokenPayload): Promise<ApiResult> {
    try {
      const res = await apiClient.post('/auth/save-fcm-token', data) as ApiResult;
      return res;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "Save FCM Token failed"));
    }
  }

  async logout() {
    Cookies.remove(AUTH_TOKEN_KEY);
  }

  getToken = (): string | undefined => {
    return Cookies.get(AUTH_TOKEN_KEY);
  };
}
