import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Bell, Loader2, MailOpen } from 'lucide-react';
import { ownService } from '../services/own.service';
import { Card, CardContent } from '@/components/ui/card';
import { getNotificationMeta } from '../utils/notification-display';
import { AppPagination } from '@/components/pagination';

const formatDate = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function OwnNotificationsPage() {
  const [page, setPage] = useState(1);
  const limit = 6;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['own-notifications', 'history', page],
    queryFn: () =>
      ownService.listNotifications({
        page,
        limit,
        sorts: [{ field: 'created_at', direction: 'desc' }],
      }),
  });

  const { data: unreadData } = useQuery({
    queryKey: ['own-notifications', 'unread-count'],
    queryFn: () =>
      ownService.listNotifications({
        page: 1,
        limit: 1,
        is_read: false,
        sorts: [{ field: 'created_at', direction: 'desc' }],
      }),
  });

  const notifications = data?.nodes ?? [];
  const total = data?.total ?? 0;
  const unreadTotal = unreadData?.total ?? notifications.filter((notification) => !notification.is_read).length;

  return (
    <main className="bidify-page-narrow">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="bidify-title">Notifications</h1>
          <p className="bidify-subtitle">Review account activity, auction movement, and payment updates.</p>
        </div>
        <div className="bidify-card grid w-full grid-cols-2 divide-x divide-slate-100 overflow-hidden text-center sm:w-auto sm:text-right">
          <div className="px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Unread</p>
            <p className="text-xl font-bold text-slate-900">{unreadTotal}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
            <p className="text-xl font-bold text-slate-900">{total}</p>
          </div>
        </div>
      </div>
      <AppPagination page={page} total={total} limit={limit} onPageChange={setPage} className="mb-4 mt-0" />

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-slate-500" />
        </div>
      ) : isError ? (
        <Card className="border-red-100 py-20">
          <CardContent className="text-center text-red-500">
            <Bell className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p className="font-semibold">Failed to load notifications</p>
            <p className="mt-1 text-sm">{error instanceof Error ? error.message : 'Please try again later'}</p>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="border-dashed py-20">
          <CardContent className="text-center text-slate-500">
            <MailOpen className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p className="font-semibold">No notifications yet</p>
            <p className="mt-1 text-sm">Your notification history will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bidify-panel overflow-hidden">
          {notifications.map((notification) => {
            const meta = getNotificationMeta(notification);
            const Icon = meta.icon;

            return (
              <Link
                key={notification.id}
                to={`/own/notifications/${notification.id}`}
                className={`block border-b border-slate-100 px-3 py-4 transition-colors last:border-b-0 hover:bg-slate-50 sm:px-5 ${
                  notification.is_read ? 'bg-white' : 'bg-slate-50/70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded ${notification.is_read ? 'bg-slate-100 text-slate-500' : 'bg-slate-900 text-white'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start gap-2">
                      <p className="min-w-0 break-words font-semibold text-slate-900">{notification.title}</p>
                      {!notification.is_read && <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white">New</span>}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{notification.body}</p>
                    <div className="mt-2 flex flex-col gap-0.5 text-xs text-slate-400 sm:flex-row sm:flex-wrap sm:gap-2">
                      <span>{meta.label}</span>
                      <span>{formatDate(notification.created_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
