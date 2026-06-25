import type { RouteObject } from 'react-router';
import { Navigate } from 'react-router';
import ThrowErrorPage from '../features/error/pages/throw-error-page';
import { lazyPage, withRouteSuspense } from './lazy-route';

const AuctionsPage = lazyPage(() => import('../features/auction/pages/auctions'));
const AuctionDetailPage = lazyPage(() => import('../features/auction/pages/auction-detail'));
const AuctionRulesPage = lazyPage(() => import('../features/auction/pages/auction-rules'));
const ShipmentTrackingPage = lazyPage(() => import('../features/auction/pages/shipment-tracking'));

export const auctionRoutes: RouteObject[] = [
  {
    errorElement: <ThrowErrorPage />,
    children: [
      { index: true, element: withRouteSuspense(<AuctionsPage />) },
      { path: '/auctions', element: <Navigate to="/" replace /> },
      { path: '/auction-rules', element: withRouteSuspense(<AuctionRulesPage />) },
      { path: '/auctions/:id', element: withRouteSuspense(<AuctionDetailPage />) },
      { path: '/:auctionId/shipments/:shipmentId/tracking', element: withRouteSuspense(<ShipmentTrackingPage />) },
    ],
  },
];
