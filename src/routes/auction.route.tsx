import type { RouteObject } from 'react-router';
import { Navigate } from 'react-router';
import ThrowErrorPage from '../features/error/pages/throw-error-page';
import AuctionsPage from '../features/auction/pages/auctions';
import AuctionDetailPage from '../features/auction/pages/auction-detail';

export const auctionRoutes: RouteObject[] = [
  {
    errorElement: <ThrowErrorPage />,
    children: [
      { index: true, element: <AuctionsPage /> },
      { path: '/auctions', element: <Navigate to="/" replace /> },
      { path: '/auctions/:id', element: <AuctionDetailPage /> },
    ],
  },
];
