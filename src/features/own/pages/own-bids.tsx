import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ownService } from '../services/own.service';
import { Link } from 'react-router';
import { Trophy, ChevronLeft, ChevronRight, Gavel, Clock, Tag, ImageOff, CreditCard } from 'lucide-react';

const formatIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatDate = (s: string) =>
  new Date(s).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function OwnBidsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'won' | 'not-won'>('all');
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['own-bids', page],
    queryFn: () =>
      ownService.listBids({
        page,
        limit,
        sorts: [{ field: 'created_at', direction: 'desc' }],
      }),
  });

  const allBids = data?.nodes ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  // Filter bids based on winner status
  const bids =
    filter === 'all'
      ? allBids
      : filter === 'won'
        ? allBids.filter((b) => b.is_winner === true)
        : allBids.filter((b) => b.is_winner !== true);

  const wonCount = allBids.filter((b) => b.is_winner === true).length;
  const notWonCount = allBids.filter((b) => b.is_winner !== true).length;

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Bids</h1>
        <p className="text-slate-500 mt-1">Track all your placed bids.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
            filter === 'all' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          All Bids
          <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">{allBids.length}</span>
          {filter === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
        </button>
        <button
          onClick={() => setFilter('won')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
            filter === 'won' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Trophy className="h-3.5 w-3.5 inline mr-1" />
          Won
          <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">{wonCount}</span>
          {filter === 'won' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
        </button>
        <button
          onClick={() => setFilter('not-won')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
            filter === 'not-won' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Not Won
          <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">{notWonCount}</span>
          {filter === 'not-won' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 animate-pulse">
              <div className="h-16 w-16 rounded-xl bg-slate-100 flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : bids.length === 0 ? (
        <div className="py-24 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
          <Gavel className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-base font-medium">No bids placed yet</p>
          <p className="text-sm mt-1">Browse auctions and place your first bid!</p>
          <Link to="/auctions">
            <button className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors">
              Browse Auctions
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bids.map((bid) => {
            const product = bid.auction?.product;
            const isWinner = bid.is_winner === true;
            const paymentPending = isWinner && bid.payment?.status === 'WAITING_FOR_PAYMENT';
            const paymentPaid = isWinner && bid.payment?.status === 'PAID';
            const cardBorder = paymentPending
              ? 'border-yellow-300 bg-yellow-50/60'
              : isWinner
                ? 'border-green-300 bg-green-50/40'
                : 'border-slate-100 hover:border-indigo-200';
            return (
              <Link key={bid.id} to={`/own/bids/${bid.id}`}>
                <div className={`bg-white rounded-2xl border hover:shadow-md transition-all cursor-pointer group ${cardBorder}`}>
                  <div className="p-4 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                      {product?.cover_image_link ? (
                        <img src={product.cover_image_link} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageOff className="h-6 w-6 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                        {product?.name ?? `Auction #${bid.auction_id}`}
                      </h3>
                      <div className="flex flex-wrap gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Tag className="h-3.5 w-3.5 text-indigo-400" />{' '}
                          <strong className="text-indigo-600">{formatIDR(bid.amount)}</strong>
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="h-3.5 w-3.5" /> {formatDate(bid.created_at)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {isWinner && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <Trophy className="h-3 w-3" /> You Won!
                          </span>
                        )}
                        {paymentPending && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                            <CreditCard className="h-3 w-3" /> Payment Required
                          </span>
                        )}
                        {paymentPaid && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            <CreditCard className="h-3 w-3" /> Paid
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="h-9 w-9 p-0 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center transition-colors"
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
                className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {p}
              </button>
            );
          })}
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="h-9 w-9 p-0 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </main>
  );
}
