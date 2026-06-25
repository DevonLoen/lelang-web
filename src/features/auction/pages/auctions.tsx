import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auctionService } from '../services/auction.service';
import AuctionCard from '../components/auction-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Filter, Gavel, Search } from 'lucide-react';
import { ProductCondition } from '../services/auction.schema';

export default function AuctionsPage() {
  const [page, setPage] = useState(1);
  const [condition, setCondition] = useState<'ALL' | ProductCondition>('ALL');
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const limit = 10;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['auctions', 'on-going', page],
    queryFn: () =>
      auctionService.listOngoingAuctions({
        page,
        limit,
        sorts: [{ field: 'end_time', direction: 'asc' }],
      }),
  });

  const auctions = (data?.nodes ?? []).filter((auction) => {
    const productName = auction.product?.name?.toLowerCase() ?? '';
    const price = auction.winner?.auction_bid?.amount ?? auction.starting_price;
    const matchesSearch = !search.trim() || productName.includes(search.trim().toLowerCase());
    const matchesCondition = condition === 'ALL' || auction.product?.condition === condition;
    const matchesMin = !minPrice || price >= Number(minPrice);
    const matchesMax = !maxPrice || price <= Number(maxPrice);
    return matchesSearch && matchesCondition && matchesMin && matchesMax;
  });
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);
  const featuredAuction = (data?.nodes ?? [])[0];
  const featuredImage = featuredAuction?.product?.cover_image_link;

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <section className="mb-6 overflow-hidden rounded border border-amber-300 bg-[#272783] p-5 text-white shadow-sm md:p-7">
        <div className="grid gap-6 md:grid-cols-[1fr_260px] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase text-amber-300">Live Marketplace</p>
            <h1 className="mt-2 max-w-xl text-3xl font-extrabold leading-tight md:text-5xl">Find Your Next Treasure Today</h1>
            <p className="mt-4 max-w-md text-sm text-slate-200 md:text-base">
              Bid on curated electronics, collectibles, and fashion items ordered by the auctions ending soonest.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#auction-grid" className="rounded bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 shadow hover:bg-amber-300">
                Start Bidding
              </a>
              <a href="/own/products" className="rounded bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/15">
                Sell Item
              </a>
            </div>
          </div>
          <div className="hidden rounded-lg bg-white/10 p-3 md:block">
            <div className="aspect-[4/3] overflow-hidden rounded bg-white/10">
              {featuredImage ? (
                <img src={featuredImage} alt={featuredAuction?.product?.name ?? 'Featured auction'} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-slate-950/45" />
              )}
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold text-slate-300">Featured Auction</p>
                <p className="line-clamp-1 text-sm font-bold">{featuredAuction?.product?.name ?? 'Live auction'}</p>
              </div>
              <p className="text-right text-xs font-bold text-amber-300">
                Rp {(featuredAuction?.winner?.auction_bid?.amount ?? featuredAuction?.starting_price ?? 0).toLocaleString('en-US')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Filter className="h-4 w-4" /> Filters
            </div>
            <button
              className="text-xs font-semibold text-slate-700 hover:text-slate-800"
              onClick={() => {
                setCondition('ALL');
                setSearch('');
                setMinPrice('');
                setMaxPrice('');
              }}
            >
              Reset
            </button>
          </div>
          <label className="text-xs font-bold text-slate-700">Search</label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search auctions..."
              className="h-10 w-full rounded border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
            />
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-700">Condition</p>
            <div className="mt-2 flex gap-2">
              {(['ALL', ProductCondition.NEW, ProductCondition.PRELOVED] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setCondition(option)}
                  className={`rounded px-3 py-1.5 text-xs font-semibold ${
                    condition === option ? 'bg-slate-100 text-slate-800' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {option === 'ALL' ? 'All' : option === ProductCondition.NEW ? 'New' : 'Used'}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-700">Price Range</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input value={minPrice} onChange={(event) => setMinPrice(event.target.value)} type="number" placeholder="Rp Min" className="h-9 rounded border border-slate-200 px-2 text-xs outline-none focus:border-slate-400" />
              <input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} type="number" placeholder="Rp Max" className="h-9 rounded border border-slate-200 px-2 text-xs outline-none focus:border-slate-400" />
            </div>
          </div>
          <div className="mt-5 rounded bg-slate-950 px-3 py-2 text-center text-xs font-bold text-white">
            {auctions.length} shown
          </div>
        </aside>

        <section id="auction-grid">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">
              {total} live auction{total !== 1 ? 's' : ''}
            </p>
          </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-100 overflow-hidden animate-pulse shadow-sm">
              <div className="h-48 bg-slate-100" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-px bg-slate-100" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <Card className="py-24 border-red-100">
          <CardContent className="text-center text-red-500">
            <Gavel className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-base font-medium">Failed to load auctions</p>
            <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Please try again later'}</p>
          </CardContent>
        </Card>
      ) : auctions.length === 0 ? (
        <Card className="py-24 border-dashed">
          <CardContent className="text-center text-slate-500">
            <Gavel className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-base font-medium">No auctions found</p>
            <p className="text-sm mt-1">No live auctions are available right now</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {auctions.map((a) => (
            <AuctionCard key={a.id} auction={a} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="h-9 w-9 p-0 border-slate-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
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
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="h-9 w-9 p-0 border-slate-200"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
        </section>
      </div>
    </main>
  );
}
