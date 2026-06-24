import type { RouteObject } from 'react-router';
import ThrowErrorPage from '../features/error/pages/throw-error-page';
import OwnProductsPage from '../features/own/pages/own-products';
import OwnProductDetailPage from '../features/own/pages/own-product-detail';
import OwnAuctionsPage from '../features/own/pages/own-auctions';
import OwnAuctionDetailPage from '../features/own/pages/own-auction-detail';
import OwnBidsPage from '../features/own/pages/own-bids';
import OwnBidDetailPage from '../features/own/pages/own-bid-detail';
import OwnPaymentPage from '../features/own/pages/own-payment';
import OwnPaymentsPage from '../features/own/pages/own-payments';
import ProfilePage from '../features/own/pages/profile';
import OwnWithdrawalPage from '../features/own/pages/own-withdrawal';
import OwnNotificationsPage from '../features/own/pages/own-notifications';
import RoleGate from '../features/own/components/role-gate';
import UserAddressesPage from '../features/user-address/pages/user-addresses';

export const ownRoutes: RouteObject[] = [
  {
    errorElement: <ThrowErrorPage />,
    children: [
      {
        path: '/own/products',
        element: <RoleGate requiredRole="SELLER"><OwnProductsPage /></RoleGate>,
      },
      {
        path: '/own/products/:id',
        element: <RoleGate requiredRole="SELLER"><OwnProductDetailPage /></RoleGate>,
      },
      {
        path: '/own/auctions',
        element: <RoleGate requiredRole="SELLER"><OwnAuctionsPage /></RoleGate>,
      },
      {
        path: '/own/auctions/:id',
        element: <RoleGate requiredRole="SELLER"><OwnAuctionDetailPage /></RoleGate>,
      },
      {
        path: '/own/bids',
        element: <RoleGate requiredRole="BIDDER"><OwnBidsPage /></RoleGate>,
      },
      {
        path: '/own/bids/:id',
        element: <RoleGate requiredRole="BIDDER"><OwnBidDetailPage /></RoleGate>,
      },
      {
        path: '/own/payments',
        element: <RoleGate requiredRole="BIDDER"><OwnPaymentsPage /></RoleGate>,
      },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/own/notifications', element: <OwnNotificationsPage /> },
      { path: '/own/withdrawal', element: <OwnWithdrawalPage /> },
      { path: '/own/addresses', element: <UserAddressesPage /> },
      { path: '/auctions/:auctionId/payments/:paymentId/pay', element: <OwnPaymentPage /> },
    ],
  },
];
