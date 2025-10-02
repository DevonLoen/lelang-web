import type { RouteObject } from "react-router";
import LoginPage from "../features/auth/pages/login";
import SignupPage from "../features/auth/pages/signup";
import VerifyOtpPage from "../features/auth/pages/verify-otp";
import ForgotPasswordPage from "../features/auth/pages/forgot-password";
import ResetPasswordPage from "../features/auth/pages/reset-password";

export const authRoutes: RouteObject[] = [
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/verify-otp", element: <VerifyOtpPage /> },
  {
    path: "/forgot-password",
    children: [
      { index: true, element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
    ],
  },
];
