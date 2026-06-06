import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auctionService } from '../services/auction.service';
import AuctionCard from '../components/auction-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AuctionStatus } from '../services/auction.schema';
import type { AuctionStatus as AuctionStatusType } from '../services/auction.schema';
import { ChevronLeft, ChevronRight, Gavel } from 'lucide-react';

const STATUS_OPTIONS: { label: string; value: AuctionStatusType | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Scheduled', value: AuctionStatus.SCHEDULED },
  { label: 'On Going', value: AuctionStatus.ON_GOING },
  { label: 'Waiting Payment', value: AuctionStatus.WAITING_FOR_PAYMENT },
  { label: 'Waiting Shipment', value: AuctionStatus.WAITING_FOR_SHIPMENT },
  { label: 'Shipped', value: AuctionStatus.SHIPPED },
  { label: 'Delivered', value: AuctionStatus.DELIVERED },
  { label: 'Completed', value: AuctionStatus.COMPLETED },
];

export default function AuctionsPage() {
  const [status, setStatus] = useState<AuctionStatusType | ''>(AuctionStatus.ON_GOING);
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading } = useQuery({
    queryKey: ['auctions', status, page],
    queryFn: () =>
      auctionService.listAuctions({
        page,
        limit,
        ...(status ? { status } : {}),
        sorts: [{ field: 'created_at', direction: 'desc' }],
      }),
  });

  const auctions = data?.nodes ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);
  const activeFilterLabel = STATUS_OPTIONS.find((option) => option.value === status)?.label ?? 'All';

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
      {/* Hero */}
      <section className="mb-8 rounded-3xl border border-amber-100 bg-gradient-to-br from-white via-amber-50/60 to-emerald-50/60 p-5 md:p-7 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center ring-1 ring-amber-200">
                <Gavel className="h-5 w-5 text-amber-700" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Live Auctions</h1>
            </div>
            <p className="text-slate-600 md:ml-13">Browse curated lots and place your bids in real time.</p>
          </div>

          <div className="rounded-2xl bg-white/90 border border-amber-100 px-4 py-3 shadow-sm min-w-[180px]">
            <p className="text-xs uppercase tracking-wide text-slate-500">Showing</p>
            <p className="text-lg font-semibold text-slate-900">{total} result{total !== 1 ? 's' : ''}</p>
            <p className="text-xs text-slate-500 mt-0.5">Filter: {activeFilterLabel}</p>
          </div>
        </div>
      </section>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2.5 mb-8">
        {STATUS_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => { setStatus(o.value as AuctionStatusType | ''); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              status === o.value
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50/60'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      ) : auctions.length === 0 ? (
        <Card className="py-24 border-dashed">
          <CardContent className="text-center text-slate-500">
            <Gavel className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-base font-medium">No auctions found</p>
            <p className="text-sm mt-1">Try a different filter</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {auctions.map((a) => (
            <AuctionCard key={a.id} auction={a} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-9 w-9 p-0 border-slate-200">
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
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="h-9 w-9 p-0 border-slate-200">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </main>
  );
}
