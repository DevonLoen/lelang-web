import { useParams, useNavigate, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ownService } from '../services/own.service';
import { auctionService } from '../../auction/services/auction.service';
import { useToast } from '../../../contexts/toast-context';
import { ToastType } from '../../../enums/toast-type';
import {
  ChevronLeft, Trophy, Tag, Clock, Package, ImageOff, CreditCard,
  Banknote, CalendarDays, AlertCircle, ExternalLink, Gavel,
} from 'lucide-react';

const formatIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatDate = (s: string) =>
  new Date(s).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const paymentStatusConfig: Record<string, { label: string; bg: string; text: string }> = {
  WAITING_FOR_PAYMENT: { label: 'Awaiting Payment', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  PAID: { label: 'Paid', bg: 'bg-green-100', text: 'text-green-800' },
  EXPIRED: { label: 'Expired', bg: 'bg-red-100', text: 'text-red-800' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-slate-100', text: 'text-slate-600' },
};

export default function OwnBidDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const qc = useQueryClient();

  const { data: bid, isLoading } = useQuery({
    queryKey: ['own-bid', id],
    queryFn: () => ownService.getBid(id!),
    enabled: !!id,
  });

  const auction = bid?.auction;
  const product = auction?.product;
  const payment = bid?.payment;
  const isWinner = bid?.is_winner === true;
  const paymentPending = isWinner && payment?.status === 'WAITING_FOR_PAYMENT';

  if (isLoading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-slate-100 rounded w-1/3" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (!bid) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Bid not found</h2>
          <p className="text-slate-500 mt-2">The bid you're looking for doesn't exist.</p>
          <Link to="/own/bids">
            <button className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors">
              Back to My Bids
            </button>
          </Link>
        </div>
      </main>
    );
  }

  const paymentCfg = payment ? paymentStatusConfig[payment.status] : null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/own/bids')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> My Bids
        </button>
      </div>

      {/* Winner badge */}
      {isWinner && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 px-5 py-4 flex items-center gap-4 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Trophy className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-amber-900 text-lg leading-tight">Congratulations, you won!</p>
            <p className="text-amber-700 text-sm mt-0.5">
              You placed the winning bid for this auction
            </p>
          </div>
        </div>
      )}

      {/* Bid Details Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-4">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Gavel className="h-5 w-5" /> Bid Details
          </h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Product info */}
          <div className="flex gap-4">
            <div className="h-24 w-24 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
              {product?.cover_image_link ? (
                <img src={product.cover_image_link} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff className="h-8 w-8 text-slate-300" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-slate-900 text-lg">{product?.name ?? 'Product'}</h2>
              <p className="text-sm text-slate-500 mt-1">{product?.description}</p>
              <Link
                to={`/auctions/${auction?.id}`}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-2"
              >
                View Auction Details <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Bid info */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <Tag className="h-4 w-4 text-indigo-400" /> Your Bid Amount
              </span>
              <strong className="text-slate-900 text-lg">{formatIDR(bid.amount)}</strong>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" /> Bid Placed At
              </span>
              <strong className="text-slate-900 text-sm">{formatDate(bid.created_at)}</strong>
            </div>
            {isWinner && (
              <div className="flex items-center justify-between px-4 py-3 bg-amber-50">
                <span className="text-sm text-amber-700 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-600" /> Status
                </span>
                <strong className="text-amber-900 text-sm font-bold">Winning Bid</strong>
              </div>
            )}
          </div>

          {/* Auction status */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <Package className="h-4 w-4 text-indigo-400" /> Auction Status
              </span>
              <span className="text-sm font-semibold text-slate-900 capitalize">
                {auction?.status?.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-indigo-400" /> Auction End
              </span>
              <strong className="text-slate-900 text-sm">{auction?.end_time ? formatDate(auction.end_time) : '—'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      {isWinner && payment && (
        <div className={`rounded-2xl border shadow-sm overflow-hidden ${paymentPending ? 'border-yellow-200 bg-yellow-50' : 'border-slate-200 bg-white'}`}>
          <div className={`px-6 py-4 ${paymentPending ? 'bg-gradient-to-r from-yellow-500 to-amber-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> Payment Information
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <Banknote className="h-4 w-4 text-green-500" /> Total Amount
              </span>
              <span className="font-bold text-slate-900 text-xl">{formatIDR(payment.amount)}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-sm text-slate-500">Payment Status</span>
              {paymentCfg && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${paymentCfg.bg} ${paymentCfg.text}`}>
                  {paymentCfg.label}
                </span>
              )}
            </div>

            {payment.expired_at && paymentPending && (
              <div className="flex items-center gap-2 text-sm bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                <Clock className="h-4 w-4 text-red-400 flex-shrink-0" />
                <span className="text-red-700">Pay before: <strong>{formatDate(payment.expired_at)}</strong></span>
              </div>
            )}

            {paymentPending && payment.snap_token && (
              <button
                onClick={() => navigate(`/auctions/${auction?.id}/payments/${payment.id}/pay`)}
                className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100"
              >
                <CreditCard className="h-5 w-5" /> Pay Now
              </button>
            )}

            {payment.status === 'PAID' && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                <Trophy className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Payment completed successfully!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Not winner message */}
      {!isWinner && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
          <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">This bid was not the winning bid</p>
          <p className="text-sm text-slate-500 mt-1">The auction has ended or another bidder placed a higher bid.</p>
        </div>
      )}
    </main>
  );
}
