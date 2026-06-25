import { Bell, CreditCard, Gavel, Package, ShieldCheck, Truck, Wallet, type LucideIcon } from 'lucide-react';
import type { NotificationResponse } from '../services/own.schema';

interface NotificationMeta {
  label: string;
  description: string;
  actionLabel?: string;
  href?: string;
  icon: LucideIcon;
}

const titleCase = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const getNotificationMeta = (notification: Pick<NotificationResponse, 'type' | 'reference_id'>): NotificationMeta => {
  const type = notification.type.toUpperCase();
  const referenceId = notification.reference_id;

  if (type.includes('AUCTION') || type.includes('OUTBID') || type.includes('BID')) {
    return {
      label: type.includes('OUTBID') ? 'Bid update' : 'Auction update',
      description: type.includes('OUTBID') ? 'A bid changed on an auction you follow.' : 'There is a new auction activity to review.',
      actionLabel: referenceId ? 'View auction' : 'Browse auctions',
      href: referenceId ? `/auctions/${referenceId}` : '/auctions',
      icon: Gavel,
    };
  }

  if (type.includes('PRODUCT')) {
    return {
      label: 'Product review',
      description: 'A product submission or review status changed.',
      actionLabel: referenceId ? 'View product' : 'View products',
      href: referenceId ? `/own/products/${referenceId}` : '/own/products',
      icon: Package,
    };
  }

  if (type.includes('PAYMENT')) {
    return {
      label: 'Payment update',
      description: 'A payment requires attention or has changed status.',
      actionLabel: 'View payments',
      href: '/own/payments',
      icon: CreditCard,
    };
  }

  if (type.includes('SHIPMENT') || type.includes('DELIVERY')) {
    return {
      label: 'Shipment update',
      description: 'Shipment progress changed for an auction.',
      actionLabel: referenceId ? 'View auction' : undefined,
      href: referenceId ? `/auctions/${referenceId}` : undefined,
      icon: Truck,
    };
  }

  if (type.includes('ROLE')) {
    return {
      label: 'Account role update',
      description: 'Your account role request has a new status.',
      actionLabel: 'View profile',
      href: '/profile',
      icon: ShieldCheck,
    };
  }

  if (type.includes('WITHDRAWAL')) {
    return {
      label: 'Withdrawal update',
      description: 'Your withdrawal request has a new status.',
      actionLabel: 'View withdrawal',
      href: '/own/withdrawal',
      icon: Wallet,
    };
  }

  return {
    label: titleCase(notification.type) || 'Notification',
    description: 'A new account notification is available.',
    icon: Bell,
  };
};
