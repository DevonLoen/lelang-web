import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, ChevronLeft, ChevronRight, Loader2, MailOpen } from 'lucide-react';
import { ownService } from '../services/own.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ToastType } from '../../../enums/toast-type';
import { useToast } from '../../../contexts/toast-context';

const formatDate = (value: string) =>
  new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const getErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

export default function OwnNotificationsPage() {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { showToast } = useToast();
  const qc = useQueryClient();
  const limit = 20;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['own-notifications', 'unread', page],
    queryFn: () =>
      ownService.listNotifications({
        page,
        limit,
        is_read: false,
        sorts: [{ field: 'created_at', direction: 'desc' }],
      }),
  });

  const { data: selectedNotification, isLoading: isDetailLoading } = useQuery({
    queryKey: ['own-notification', selectedId],
    queryFn: () => ownService.getNotification(selectedId!),
    enabled: !!selectedId,
  });

  const markRead = useMutation({
    mutationFn: (notificationId: string) => ownService.markNotificationRead(notificationId),
    onSuccess: () => {
      showToast('Notification marked as read', ToastType.SUCCESS);
      qc.invalidateQueries({ queryKey: ['own-notifications'] });
      setSelectedId(null);
    },
    onError: (e: unknown) => showToast(getErrorMessage(e, 'Failed to update notification'), ToastType.ERROR),
  });

  const notifications = data?.nodes ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">Unread updates from auctions, payments, and account activity.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Unread</p>
          <p className="text-xl font-bold text-slate-900">{total}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-amber-500" />
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
            <p className="font-semibold">No unread notifications</p>
            <p className="mt-1 text-sm">You are all caught up.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => setSelectedId(notification.id)}
                className={`block w-full border-b border-slate-100 px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-amber-50/50 ${
                  selectedId === notification.id ? 'bg-amber-50' : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
                    <Bell className="h-4 w-4 text-amber-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{notification.title}</p>
                      {!notification.is_read && <span className="h-2 w-2 rounded-full bg-amber-500" />}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{notification.body}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                      <span>{notification.type}</span>
                      {notification.reference_id && <span>Ref: {notification.reference_id}</span>}
                      <span>{formatDate(notification.created_at)}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {!selectedId ? (
              <div className="flex min-h-52 flex-col items-center justify-center text-center text-slate-400">
                <Bell className="mb-3 h-9 w-9 opacity-30" />
                <p className="text-sm">Select a notification to view details.</p>
              </div>
            ) : isDetailLoading ? (
              <div className="flex min-h-52 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            ) : selectedNotification ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{selectedNotification.type}</p>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">{selectedNotification.title}</h2>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(selectedNotification.created_at)}</p>
                </div>
                <p className="whitespace-pre-line text-sm leading-6 text-slate-600">{selectedNotification.body}</p>
                {selectedNotification.reference_id && (
                  <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">Reference: {selectedNotification.reference_id}</p>
                )}
                <Button
                  type="button"
                  disabled={markRead.isPending}
                  onClick={() => markRead.mutate(selectedNotification.id)}
                  className="w-full gap-2"
                >
                  {markRead.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Mark as read
                </Button>
              </div>
            ) : null}
          </aside>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-9 w-9 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-3 text-sm font-medium text-slate-600">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="h-9 w-9 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </main>
  );
}
