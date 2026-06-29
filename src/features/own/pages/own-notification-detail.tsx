import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowRight, Bell, ChevronLeft, Loader2 } from 'lucide-react';
import { ownService } from '../services/own.service';
import { Button } from '@/components/ui/button';
import { getNotificationMeta } from '../utils/notification-display';

const formatDate = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function OwnNotificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: notification, isLoading, isError, error } = useQuery({
    queryKey: ['own-notification', id],
    queryFn: () => ownService.getNotification(id!),
    enabled: !!id,
  });

  const markRead = useMutation({
    mutationFn: (notificationId: number) => ownService.markNotificationRead(notificationId),
    onSuccess: (updatedNotification) => {
      qc.setQueryData(['own-notification', id], updatedNotification);
      qc.invalidateQueries({ queryKey: ['own-notifications'] });
    },
  });

  useEffect(() => {
    if (!notification || notification.is_read || markRead.isPending) return;
    markRead.mutate(notification.id);
  }, [markRead, notification]);

  if (isLoading) {
    return (
      <main className="bidify-page-narrow">
        <div className="flex min-h-64 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-slate-500" />
        </div>
      </main>
    );
  }

  if (isError || !notification) {
    return (
      <main className="bidify-page-narrow">
        <button onClick={() => navigate('/own/notifications')} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" /> Notifications
        </button>
        <div className="bidify-card py-20 text-center text-slate-500">
          <Bell className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="font-semibold">Notification not found</p>
          <p className="mt-1 text-sm">{error instanceof Error ? error.message : 'This notification is no longer available.'}</p>
        </div>
      </main>
    );
  }

  const meta = getNotificationMeta(notification);
  const Icon = meta.icon;

  return (
    <main className="bidify-page-narrow">
      <button onClick={() => navigate('/own/notifications')} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ChevronLeft className="h-4 w-4" /> Notifications
      </button>

      <article className="bidify-panel overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded bg-slate-900 text-white">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{meta.label}</p>
              <h1 className="mt-1 break-words text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">{notification.title}</h1>
              <p className="mt-1 text-sm text-slate-500">{formatDate(notification.created_at)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <p className="whitespace-pre-line break-words text-base leading-7 text-slate-700">{notification.body}</p>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{meta.label}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{meta.description}</p>
          </div>

          {meta.href && meta.actionLabel && (
            <Button asChild className="w-full sm:w-auto">
              <Link to={meta.href}>
                {meta.actionLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </article>
    </main>
  );
}
