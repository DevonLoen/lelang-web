import type { RouteObject } from "react-router";
import LoginPage from "../features/auth/pages/login";
import SignupPage from "../features/auth/pages/signup";
import VerifyOtpPage from "../features/auth/pages/verify-otp";

export const authRoutes: RouteObject[] = [
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/verify-otp", element: <VerifyOtpPage /> },
];
