import type { RouteObject } from 'react-router';
import ThrowErrorPage from '../features/error/pages/throw-error-page';
import ProductPage from '../features/product/pages/product';
import ProductDetail from '../features/product/pages/product-detail';

export const productRoutes: RouteObject[] = [
  {
    errorElement: <ThrowErrorPage />,
    children: [
      {
        path: '/my-product',
        children: [
          { index: true, element: <ProductPage /> },
          { path: ':id', element: <ProductDetail /> },
        ],
      },
    ],
  },
];
