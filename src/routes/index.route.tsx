import NotFoundPage from "../features/error/pages/404-page";
import ThrowErrorPage from "../features/error/pages/throw-error-page";
import MainLayout from "../layouts/layout";
import { authRoutes } from "./auth.route";
import { createBrowserRouter } from "react-router";
import { productRoutes } from "./product-route";
import { auctionRoutes } from "./auction.route";
import { ownRoutes } from "./own.route";

export const router = createBrowserRouter([
  ...authRoutes,
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ThrowErrorPage />,
    children: [
      ...productRoutes,
      ...auctionRoutes,
      ...ownRoutes,
      {
        path: "*",
        element: <NotFoundPage />,
      }
    ],
  },
]);
