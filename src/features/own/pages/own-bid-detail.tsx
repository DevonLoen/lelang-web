import { useParams, useNavigate, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ownService } from '../services/own.service';
import { auctionService } from '../../auction/services/auction.service';
import {
  ChevronLeft, Trophy, Tag, Clock, Package, ImageOff, CreditCard,
  Banknote, CalendarDays, AlertCircle, ExternalLink, Gavel,
} from 'lucide-react';

const formatIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatDate = (s: string) =>
  new Date(s).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const paymentStatusConfig: Record<string, { label: string; bg: string; text: string }> = {
  WAITING_FOR_PAYMENT: { label: 'Awaiting Payment', bg: 'bg-amber-50 border border-amber-200', text: 'text-amber-800' },
  PAID: { label: 'Paid', bg: 'bg-slate-50 border border-slate-200', text: 'text-slate-800' },
  EXPIRED: { label: 'Expired', bg: 'bg-red-50 border border-red-200', text: 'text-red-800' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-slate-100', text: 'text-slate-600' },
};

export default function OwnBidDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: bid, isLoading } = useQuery({
    queryKey: ['own-bid', id],
    queryFn: () => ownService.getBid(id!),
    enabled: !!id,
  });

  const { data: publicAuction, isLoading: isLoadingAuction } = useQuery({
    queryKey: ['auction', bid?.auction_id ? String(bid.auction_id) : ''],
    queryFn: () => auctionService.getAuction(bid!.auction_id),
    enabled: !!bid?.auction_id,
  });

  const auction = publicAuction ?? bid?.auction;
  const product = auction?.product;
  const payment = bid?.payment;
  const isWinner = bid?.is_winner === true || (!!bid && auction?.winner?.auction_bid_id === bid.id);
  const paymentPending = isWinner && payment?.status === 'WAITING_FOR_PAYMENT';

  if (isLoading || isLoadingAuction) {
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
            <button className="mt-4 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors">
              Back to My Bids
            </button>
          </Link>
        </div>
      </main>
    );
  }

  const paymentCfg = payment ? paymentStatusConfig[payment.status] : null;

  return (
    <main className="bidify-page-narrow">
      {/* Back button */}
      <div className="mb-6">
        <button onClick={() => navigate('/own/bids')} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronLeft className="h-4 w-4" /> My Bids
        </button>
      </div>

      {/* Winner badge */}
      {isWinner && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 flex items-center gap-4 shadow-sm">
          <div className="h-11 w-11 rounded bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Trophy className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <p className="font-bold text-amber-950 text-lg leading-tight">Congratulations, you won!</p>
            <p className="text-amber-700 text-sm mt-0.5">
              You placed the winning bid for this auction
            </p>
          </div>
        </div>
      )}

      {/* Bid Details Card */}
      <div className="bidify-panel overflow-hidden mb-6">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h1 className="text-xl font-bold text-slate-950 flex items-center gap-2">
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
              <p className="line-clamp-3 text-sm text-slate-500 mt-1">{product?.description || 'No product description available.'}</p>
              <Link
                to={`/auctions/${auction?.id}`}
                className="inline-flex items-center gap-1 text-xs text-slate-700 hover:text-slate-950 font-semibold mt-2"
              >
                View Auction Details <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Bid info */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100">
            <div className="flex flex-col items-start gap-1.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <Tag className="h-4 w-4 text-slate-400" /> Your Bid Amount
              </span>
              <strong className="text-slate-900 text-lg sm:text-right">{formatIDR(bid.amount)}</strong>
            </div>
            <div className="flex flex-col items-start gap-1.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" /> Bid Placed At
              </span>
              <strong className="text-slate-900 text-sm sm:text-right">{formatDate(bid.created_at)}</strong>
            </div>
            {isWinner && (
              <div className="flex flex-col items-start gap-1.5 px-4 py-3 bg-amber-50 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-amber-700 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-600" /> Status
                </span>
                <strong className="text-amber-900 text-sm font-bold sm:text-right">Winning Bid</strong>
              </div>
            )}
          </div>

          {/* Auction status */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100">
            <div className="flex flex-col items-start gap-1.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <Package className="h-4 w-4 text-slate-400" /> Auction Status
              </span>
              <span className="text-sm font-semibold text-slate-900 capitalize sm:text-right">
                {auction?.status?.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex flex-col items-start gap-1.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-400" /> Auction End
              </span>
              <strong className="text-slate-900 text-sm sm:text-right">{auction?.end_time ? formatDate(auction.end_time) : ''}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      {isWinner && payment && (
        <div className={`rounded-lg border shadow-sm overflow-hidden ${paymentPending ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}>
          <div className="border-b border-slate-100 bg-white px-6 py-4">
            <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> Payment Information
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex flex-col items-start gap-1.5 py-3 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <Banknote className="h-4 w-4 text-slate-400" /> Total Amount
              </span>
              <span className="font-bold text-slate-900 text-xl sm:text-right">{formatIDR(payment.amount)}</span>
            </div>

            <div className="flex flex-col items-start gap-1.5 py-3 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
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
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <CreditCard className="h-5 w-5" /> Pay Now
              </button>
            )}

            {payment.status === 'PAID' && (
              <div className="flex items-center gap-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded px-3 py-2.5">
                <Trophy className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Payment completed successfully!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {isWinner && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Need to check payment and shipment rules?</p>
          <Link to="/auction-rules#bidder" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline">
            View bidder auction rules <ExternalLink className="h-3.5 w-3.5" />
          </Link>
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
