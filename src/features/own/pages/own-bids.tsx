import { useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { ownService } from '../services/own.service';
import { auctionService } from '../../auction/services/auction.service';
import { Link } from 'react-router';
import { Trophy, ChevronRight, Gavel, Clock, Tag, ImageOff, CreditCard } from 'lucide-react';
import { AppPagination } from '@/components/pagination';

const formatIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatDate = (s: string) =>
  new Date(s).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function OwnBidsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'won' | 'not-won'>('all');
  const limit = 6;

  const { data, isLoading } = useQuery({
    queryKey: ['own-bids', 'winner-aware'],
    queryFn: async () => {
      const firstPage = await ownService.listBids({
        page: 1,
        limit: 100,
        sorts: [{ field: 'created_at', direction: 'desc' }],
      });
      const pageCount = Math.ceil(firstPage.total / 100);
      if (pageCount <= 1) return firstPage;

      const remainingPages = await Promise.all(
        Array.from({ length: pageCount - 1 }, (_, index) =>
          ownService.listBids({
            page: index + 2,
            limit: 100,
            sorts: [{ field: 'created_at', direction: 'desc' }],
          }),
        ),
      );
      return {
        ...firstPage,
        nodes: [firstPage, ...remainingPages].flatMap((result) => result.nodes),
      };
    },
  });

  const allBids = data?.nodes ?? [];
  const auctionIds = [...new Set(allBids.map((bid) => bid.auction_id))];
  const auctionQueries = useQueries({
    queries: auctionIds.map((auctionId) => ({
      queryKey: ['auction', String(auctionId)],
      queryFn: () => auctionService.getAuction(auctionId),
      staleTime: 30_000,
    })),
  });
  const auctionById = new Map(auctionIds.map((auctionId, index) => [auctionId, auctionQueries[index]?.data]));
  const isWinningBid = (bid: (typeof allBids)[number]) => {
    const resolvedAuction = auctionById.get(bid.auction_id) ?? bid.auction;
    return bid.is_winner === true || resolvedAuction?.winner?.auction_bid_id === bid.id;
  };

  // Filter bids based on winner status
  const filteredBids =
    filter === 'all'
      ? allBids
      : filter === 'won'
        ? allBids.filter(isWinningBid)
        : allBids.filter((bid) => !isWinningBid(bid));
  const total = filteredBids.length;
  const bids = filteredBids.slice((page - 1) * limit, page * limit);

  const wonCount = allBids.filter(isWinningBid).length;
  const notWonCount = allBids.length - wonCount;
  const isResolvingWinners = auctionQueries.some((query) => query.isLoading);

  return (
    <main className="bidify-page-narrow">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="bidify-title">My Bids</h1>
          <p className="bidify-subtitle">Track active bids, winning bids, and payment follow-ups.</p>
        </div>
        <Link to="/auction-rules#bidder" className="text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline">
          View bidder rules
        </Link>
      </div>

      <div className="mb-6 rounded bg-slate-200 p-1">
        <div className="grid grid-cols-3 gap-1">
        <button
          onClick={() => { setFilter('all'); setPage(1); }}
          className={`bidify-tab ${filter === 'all' ? 'bidify-tab-active' : ''}`}
        >
          All Bids
          <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">{allBids.length}</span>
        </button>
        <button
          onClick={() => { setFilter('won'); setPage(1); }}
          className={`bidify-tab ${filter === 'won' ? 'bidify-tab-active' : ''}`}
        >
          <Trophy className="h-3.5 w-3.5 inline mr-1" />
          Won
          <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">{wonCount}</span>
        </button>
        <button
          onClick={() => { setFilter('not-won'); setPage(1); }}
          className={`bidify-tab ${filter === 'not-won' ? 'bidify-tab-active' : ''}`}
        >
          Not Won
          <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">{notWonCount}</span>
        </button>
        </div>
      </div>
      <AppPagination page={page} total={total} limit={limit} onPageChange={setPage} className="mb-4 mt-0" />

      {isLoading || isResolvingWinners ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bidify-card p-4 flex gap-4 animate-pulse">
              <div className="h-16 w-16 rounded-xl bg-slate-100 flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : bids.length === 0 ? (
        <div className="bidify-card py-24 text-center text-slate-400 border-dashed">
          <Gavel className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-base font-medium">No bids placed yet</p>
          <p className="text-sm mt-1">Browse auctions and place your first bid!</p>
          <Link to="/auctions">
            <button className="bidify-primary mt-4">
              Browse Auctions
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bids.map((bid) => {
            const resolvedAuction = auctionById.get(bid.auction_id) ?? bid.auction;
            const product = resolvedAuction?.product;
            const isWinner = isWinningBid(bid);
            const paymentPending = isWinner && bid.payment?.status === 'WAITING_FOR_PAYMENT';
            const paymentPaid = isWinner && bid.payment?.status === 'PAID';
            const cardBorder = paymentPending
              ? 'border-amber-300 bg-amber-50/60'
              : isWinner
                ? 'border-slate-300 bg-slate-50/40'
                : 'border-slate-100 hover:border-slate-200';
            return (
              <Link key={bid.id} to={`/own/bids/${bid.id}`}>
                <div className={`rounded-lg border bg-white hover:shadow-md transition-all cursor-pointer group ${cardBorder}`}>
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
                      <h3 className="font-semibold text-slate-900 truncate group-hover:text-slate-700 transition-colors">
                        {product?.name ?? `Auction #${bid.auction_id}`}
                      </h3>
                      <div className="flex flex-wrap gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Tag className="h-3.5 w-3.5 text-slate-400" />{' '}
                          <strong className="text-slate-700">{formatIDR(bid.amount)}</strong>
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
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                            <CreditCard className="h-3 w-3" /> Payment Required
                          </span>
                        )}
                        {paymentPaid && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                            <CreditCard className="h-3 w-3" /> Paid
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
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
