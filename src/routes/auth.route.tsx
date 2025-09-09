import type { RouteObject } from "react-router";
import LoginPage from "../features/auth/pages/login";

export const authRoutes: RouteObject[] = [
  { path: "/login", element: <LoginPage /> },
];
