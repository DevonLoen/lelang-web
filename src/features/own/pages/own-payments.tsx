import { type ReactNode, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ownService } from '../services/own.service';
import { Link, useNavigate } from 'react-router';
import {
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Clock,
  Banknote,
  ImageOff,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const formatIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatDate = (s: string) =>
  new Date(s).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const PAYMENT_STATUS: Record<string, { label: string; bg: string; text: string; icon: ReactNode }> = {
  WAITING_FOR_PAYMENT: {
    label: 'Awaiting Payment',
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  PAID: {
    label: 'Paid',
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  EXPIRED: {
    label: 'Expired',
    bg: 'bg-red-100',
    text: 'text-red-700',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

export default function OwnPaymentsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['own-payments', page],
    queryFn: () =>
      ownService.listPayments({
        page,
        limit,
        sorts: [{ field: 'created_at', direction: 'desc' }],
      }),
  });

  const payments = data?.nodes ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <main className="bidify-page-narrow">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-slate-700" />
          </div>
          <div>
            <h1 className="bidify-title">My Payments</h1>
            <p className="bidify-subtitle">Review payment status and complete pending checkout.</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      {!isLoading && payments.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              label: 'Total',
              value: total,
              bg: 'bg-slate-50',
              text: 'text-slate-800',
            },
            {
              label: 'Awaiting',
              value: payments.filter((p) => p.status === 'WAITING_FOR_PAYMENT').length,
              bg: 'bg-amber-50',
              text: 'text-amber-800',
            },
            {
              label: 'Paid',
              value: payments.filter((p) => p.status === 'PAID').length,
              bg: 'bg-slate-50',
              text: 'text-slate-700',
            },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-lg border border-transparent px-4 py-3 text-center`}>
              <p className={`text-xl font-bold ${s.text}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bidify-card p-4 flex gap-4 animate-pulse">
              <div className="h-16 w-16 rounded-xl bg-slate-100 flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/4" />
              </div>
              <div className="h-6 w-24 bg-slate-100 rounded-full self-start mt-1" />
            </div>
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="bidify-card py-24 text-center text-slate-400 border-dashed">
          <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-base font-medium">No payments yet</p>
          <p className="text-sm mt-1">Win an auction to get started.</p>
          <Link to="/auctions">
            <button className="bidify-primary mt-4">
              Browse Auctions
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => {
            const product = payment.auction?.product;
            const cfg = PAYMENT_STATUS[payment.status] ?? {
              label: payment.status,
              bg: 'bg-slate-100',
              text: 'text-slate-600',
              icon: <AlertCircle className="h-3.5 w-3.5" />,
            };
            const isActionable = payment.status === 'WAITING_FOR_PAYMENT' && payment.snap_token;
            const isExpiringSoon = payment.expired_at
              ? new Date(payment.expired_at).getTime() - Date.now() < 3 * 60 * 60 * 1000
              : false;

            return (
              <div
                key={payment.id}
                className={`rounded-lg border bg-white transition-all ${
                  isActionable
                    ? 'border-amber-300 shadow-sm shadow-amber-100'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="p-4 flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                    {product?.cover_image_link ? (
                      <img src={product.cover_image_link} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="h-6 w-6 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate text-sm">
                      {product?.name ?? `Auction #${String(payment.auction_id).slice(0, 8)}`}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Banknote className="h-3.5 w-3.5 text-slate-400" />
                        <strong className="text-slate-800">{formatIDR(payment.amount)}</strong>
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3.5 w-3.5" /> {formatDate(payment.created_at)}
                      </span>
                    </div>
                    {payment.expired_at && payment.status === 'WAITING_FOR_PAYMENT' && (
                      <p
                        className={`text-xs mt-1 flex items-center gap-1 ${isExpiringSoon ? 'text-red-600 font-semibold' : 'text-slate-400'}`}
                      >
                        <Clock className="h-3 w-3" />
                        Pay before {formatDate(payment.expired_at)}
                        {isExpiringSoon && '  expiring soon!'}
                      </p>
                    )}
                  </div>

                  {/* Status + action */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}
                    >
                      {cfg.icon} {cfg.label}
                    </span>
                    {isActionable && (
                      <button
                        onClick={() => navigate(`/auctions/${payment.auction_id}/payments/${payment.id}/pay`)}
                        className="text-xs font-semibold px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded transition-colors flex items-center gap-1"
                      >
                        <CreditCard className="h-3.5 w-3.5" /> Pay Now
                      </button>
                    )}
                    {payment.status === 'PAID' && payment.auction_id && (
                      <Link
                        to={`/auctions/${payment.auction_id}`}
                        className="text-xs text-slate-700 hover:underline font-medium"
                      >
                        View Auction
                      </Link>
                    )}
                  </div>
                </div>

                {/* Loading indicator */}
                {payment.status === 'WAITING_FOR_PAYMENT' && !payment.snap_token && (
                  <div className="px-4 pb-3 pt-0">
                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Preparing payment link...
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="h-9 w-9 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4));
            const p = start + i;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                  p === page ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            );
          })}
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="h-9 w-9 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </main>
  );
}
