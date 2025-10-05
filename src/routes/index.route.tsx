import NotFoundPage from "../features/error/pages/404-page";
import ThrowErrorPage from "../features/error/pages/throw-error-page";
import MainLayout from "../layouts/layout";
import { authRoutes } from "./auth.route";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  ...authRoutes,
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ThrowErrorPage />, // Pasang di root
    children: [
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
