import type { RouteObject } from 'react-router';
import ThrowErrorPage from '../features/error/pages/throw-error-page';
import RoleGate from '../features/own/components/role-gate';
import { lazyPage, withRouteSuspense } from './lazy-route';

const OwnProductsPage = lazyPage(() => import('../features/own/pages/own-products'));
const OwnProductDetailPage = lazyPage(() => import('../features/own/pages/own-product-detail'));
const OwnAuctionsPage = lazyPage(() => import('../features/own/pages/own-auctions'));
const OwnAuctionDetailPage = lazyPage(() => import('../features/own/pages/own-auction-detail'));
const OwnBidsPage = lazyPage(() => import('../features/own/pages/own-bids'));
const OwnBidDetailPage = lazyPage(() => import('../features/own/pages/own-bid-detail'));
const OwnPaymentPage = lazyPage(() => import('../features/own/pages/own-payment'));
const PaymentErrorPage = lazyPage(() => import('../features/own/pages/payment-error'));
const OwnPaymentsPage = lazyPage(() => import('../features/own/pages/own-payments'));
const ProfilePage = lazyPage(() => import('../features/own/pages/profile'));
const OwnWithdrawalPage = lazyPage(() => import('../features/own/pages/own-withdrawal'));
const OwnNotificationsPage = lazyPage(() => import('../features/own/pages/own-notifications'));
const OwnNotificationDetailPage = lazyPage(() => import('../features/own/pages/own-notification-detail'));
const UserAddressesPage = lazyPage(() => import('../features/user-address/pages/user-addresses'));

export const ownRoutes: RouteObject[] = [
  {
    errorElement: <ThrowErrorPage />,
    children: [
      {
        path: '/own/products',
        element: withRouteSuspense(<RoleGate requiredRole="SELLER"><OwnProductsPage /></RoleGate>),
      },
      {
        path: '/own/products/:id',
        element: withRouteSuspense(<RoleGate requiredRole="SELLER"><OwnProductDetailPage /></RoleGate>),
      },
      {
        path: '/own/auctions',
        element: withRouteSuspense(<RoleGate requiredRole="SELLER"><OwnAuctionsPage /></RoleGate>),
      },
      {
        path: '/own/auctions/:id',
        element: withRouteSuspense(<RoleGate requiredRole="SELLER"><OwnAuctionDetailPage /></RoleGate>),
      },
      {
        path: '/own/bids',
        element: withRouteSuspense(<RoleGate requiredRole="BIDDER"><OwnBidsPage /></RoleGate>),
      },
      {
        path: '/own/bids/:id',
        element: withRouteSuspense(<RoleGate requiredRole="BIDDER"><OwnBidDetailPage /></RoleGate>),
      },
      {
        path: '/own/payments',
        element: withRouteSuspense(<RoleGate requiredRole="BIDDER"><OwnPaymentsPage /></RoleGate>),
      },
      { path: '/profile', element: withRouteSuspense(<ProfilePage />) },
      { path: '/own/notifications', element: withRouteSuspense(<OwnNotificationsPage />) },
      { path: '/own/notifications/:id', element: withRouteSuspense(<OwnNotificationDetailPage />) },
      { path: '/own/withdrawal', element: withRouteSuspense(<OwnWithdrawalPage />) },
      { path: '/own/addresses', element: withRouteSuspense(<UserAddressesPage />) },
      { path: '/auctions/:auctionId/payments/:paymentId/pay', element: withRouteSuspense(<OwnPaymentPage />) },
      { path: '/payment/error', element: withRouteSuspense(<PaymentErrorPage />) },
    ],
  },
];
