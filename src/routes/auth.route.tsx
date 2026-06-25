import type { RouteObject } from "react-router";
import ThrowErrorPage from "../features/error/pages/throw-error-page";
import { lazyPage, withRouteSuspense } from "./lazy-route";

const LoginPage = lazyPage(() => import("../features/auth/pages/login"));
const SignupPage = lazyPage(() => import("../features/auth/pages/signup"));
const VerifyOtpPage = lazyPage(() => import("../features/auth/pages/verify-otp"));
const ForgotPasswordPage = lazyPage(() => import("../features/auth/pages/forgot-password"));
const ResetPasswordPage = lazyPage(() => import("../features/auth/pages/reset-password"));

export const authRoutes: RouteObject[] = [
  {
    errorElement: <ThrowErrorPage />,
    children: [
      { path: "/login", element: withRouteSuspense(<LoginPage />) },
      { path: "/signup", element: withRouteSuspense(<SignupPage />) },
      { path: "/verify-otp", element: withRouteSuspense(<VerifyOtpPage />) },
      { path: "/forgot-password", element: withRouteSuspense(<ForgotPasswordPage />) },
      { path: "/forgot-password/reset-password", element: withRouteSuspense(<ResetPasswordPage />) },
      { path: "/reset-password", element: withRouteSuspense(<ResetPasswordPage />) },
    ],
  },
];
