import type { RouteObject } from "react-router";
import ThrowErrorPage from "../features/error/pages/throw-error-page";
import ProductPage from "../features/product/pages/product";

export const productRoutes: RouteObject[] = [
    {
        errorElement: <ThrowErrorPage />,
        children: [
            {
                path: "/product",
                children: [
                    { index: true, element: <ProductPage /> },
                ],
            },
        ],
    },
];
