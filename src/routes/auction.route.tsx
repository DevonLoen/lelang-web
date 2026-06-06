import type { RouteObject } from 'react-router';
import { Navigate } from 'react-router';
import ThrowErrorPage from '../features/error/pages/throw-error-page';
import AuctionsPage from '../features/auction/pages/auctions';
import AuctionDetailPage from '../features/auction/pages/auction-detail';
import ShipmentTrackingPage from '../features/auction/pages/shipment-tracking';

export const auctionRoutes: RouteObject[] = [
  {
    errorElement: <ThrowErrorPage />,
    children: [
      { index: true, element: <AuctionsPage /> },
      { path: '/auctions', element: <Navigate to="/" replace /> },
      { path: '/auctions/:id', element: <AuctionDetailPage /> },
      { path: '/:auctionId/shipments/:shipmentId/tracking', element: <ShipmentTrackingPage /> },
    ],
  },
];
