import type { RouteObject } from 'react-router';
import ThrowErrorPage from '../features/error/pages/throw-error-page';
import { lazyPage, withRouteSuspense } from './lazy-route';

const ProductPage = lazyPage(() => import('../features/product/pages/product'));
const ProductDetail = lazyPage(() => import('../features/product/pages/product-detail'));

export const productRoutes: RouteObject[] = [
  {
    errorElement: <ThrowErrorPage />,
    children: [
      {
        path: '/my-product',
        children: [
          { index: true, element: withRouteSuspense(<ProductPage />) },
          { path: ':id', element: withRouteSuspense(<ProductDetail />) },
        ],
      },
    ],
  },
];
