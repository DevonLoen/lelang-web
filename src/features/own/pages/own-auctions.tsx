import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ownService } from '../services/own.service';
import { useToast } from '../../../contexts/toast-context';
import { ToastType } from '../../../enums/toast-type';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateTimePicker, toLocalDateTimeInputValue } from '@/components/date-time-picker';
import { Link } from 'react-router';
import { Plus, ChevronRight, X, Gavel, ImageOff, Search, BarChart3 } from 'lucide-react';
import type { AuctionResponse, ProductResponse } from '../../auction/services/auction.schema';
import { AppPagination } from '@/components/pagination';

const statusStyles: Record<string, string> = {
  SCHEDULED: 'bg-slate-100 text-slate-700',
  ON_GOING: 'bg-slate-100 text-slate-800',
  WAITING_FOR_PAYMENT: 'bg-amber-50 text-amber-900',
  WAITING_FOR_SHIPMENT: 'bg-amber-50 text-amber-800',
  SHIPPED: 'bg-slate-100 text-slate-800',
  DELIVERED: 'bg-slate-100 text-slate-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-gray-200 text-gray-700',
};

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Live', value: 'ON_GOING' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Closed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const formatIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatDate = (s: string) =>
  new Date(s).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const getMinimumScheduleTime = () => {
  const next = new Date(Date.now() + 5 * 60 * 1000);
  next.setSeconds(0, 0);
  return toLocalDateTimeInputValue(next);
};

//  Create Auction Modal 
function CreateAuctionModal({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast();
  const qc = useQueryClient();
  const [productId, setProductId] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [formError, setFormError] = useState('');
  const minScheduleTime = getMinimumScheduleTime();

  // Load verified products for selection
  const { data: productsData } = useQuery({
    queryKey: ['own-products-verified'],
    queryFn: () => ownService.listProducts({ status: 'VERIFIED', limit: 100 }),
  });
  const verifiedProducts: ProductResponse[] = productsData?.nodes ?? [];

  const { mutate: create, isPending } = useMutation({
    mutationFn: () =>
      ownService.createAuction({
        product_id: Number(productId),
        starting_price: Number(startingPrice),
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
      }),
    onSuccess: (res) => {
      showToast(res.message || 'Auction created!', ToastType.SUCCESS);
      qc.invalidateQueries({ queryKey: ['own-auctions'] });
      onClose();
    },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed to schedule auction', ToastType.ERROR),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!productId) {
      setFormError('Select a verified product first.');
      return showToast('Select a product', ToastType.ERROR);
    }
    if (!startingPrice || Number(startingPrice) <= 0) {
      setFormError('Starting price must be greater than zero.');
      return showToast('Enter a valid starting price', ToastType.ERROR);
    }
    if (!startTime || !endTime) {
      setFormError('Choose both start and end time.');
      return showToast('Select start and end time', ToastType.ERROR);
    }
    if (new Date(startTime).getTime() < new Date(minScheduleTime).getTime()) {
      setFormError('Start time must be at least five minutes from now.');
      return showToast('Start time must be in the future', ToastType.ERROR);
    }
    if (new Date(startTime) >= new Date(endTime)) {
      setFormError('End time must be after start time.');
      return showToast('End time must be after start time', ToastType.ERROR);
    }
    create();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Gavel className="h-5 w-5 text-slate-700" /> Schedule Auction
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Product (Verified) *</label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a verified product" />
              </SelectTrigger>
              <SelectContent>
                {verifiedProducts.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-slate-400">No verified products found</div>
                ) : (
                  verifiedProducts.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Starting Price (IDR) *</label>
            <Input
              type="number"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              placeholder="e.g. 100000"
              min={1}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Start Time *</label>
            <DateTimePicker
              label="Auction starts"
              value={startTime}
              onChange={setStartTime}
              minValue={minScheduleTime}
              helperText="Pick a start time at least five minutes from now."
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">End Time *</label>
            <DateTimePicker
              label="Auction ends"
              value={endTime}
              onChange={setEndTime}
              minValue={startTime || minScheduleTime}
              helperText="The end time must be after the start time."
            />
          </div>
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {formError}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold rounded-lg transition-colors"
            >
              {isPending ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

//  Auction Card 
function OwnAuctionCard({ auction }: { auction: AuctionResponse }) {
  const product = auction.product;
  const isLive = auction.status === 'ON_GOING';
  const isScheduled = auction.status === 'SCHEDULED';
  const bidCount = auction.bids?.length ?? 0;
  const soldPrice = auction.winner?.auction_bid?.amount;

  return (
    <Link to={`/own/auctions/${auction.id}`}>
      <div className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
        <div className="relative h-44 bg-slate-50 overflow-hidden">
          {product?.cover_image_link ? (
            <img
              src={product.cover_image_link}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <ImageOff className="h-8 w-8 text-slate-300" />
              <span className="text-xs text-slate-300">No image</span>
            </div>
          )}
          <span className={`absolute top-2 right-2 rounded px-2.5 py-1 text-[10px] font-bold ${statusStyles[auction.status] ?? 'bg-gray-100'}`}>
            {isLive ? 'LIVE' : isScheduled ? 'SCHEDULED' : auction.status.replace(/_/g, ' ')}
          </span>
          <span className="absolute bottom-2 left-2 rounded bg-slate-950/85 px-2 py-1 text-xs font-bold text-amber-300">
            {isScheduled ? `Starts ${formatDate(auction.start_time)}` : `Ends ${formatDate(auction.end_time)}`}
          </span>
        </div>
        <div className="p-4 flex flex-col gap-2 flex-1">
          <p className="text-[10px] font-bold uppercase text-slate-500">{product?.condition ?? 'Auction'}</p>
          <h3 className="font-semibold text-slate-900 truncate group-hover:text-slate-700 transition-colors">
            {product?.name ?? 'Untitled'}
          </h3>
          <div className="mt-auto grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500">{soldPrice ? 'Sold price' : 'Starting price'}</p>
              <p className={`text-sm font-extrabold ${soldPrice ? 'text-slate-700' : 'text-slate-950'}`}>{formatIDR(soldPrice ?? auction.starting_price)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-slate-500">Bids</p>
              <p className="text-sm font-extrabold text-slate-950">{bidCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            View Details
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

//  Page 
export default function OwnAuctionsPage() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const limit = 6;

  const { data, isLoading } = useQuery({
    queryKey: ['own-auctions', status, page],
    queryFn: () =>
      ownService.listAuctions({
        page,
        limit,
        ...(status ? { status } : {}),
        sorts: [{ field: 'created_at', direction: 'desc' }],
      }),
  });

  const allAuctions = data?.nodes ?? [];
  const auctions = allAuctions.filter((auction) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return true;
    return auction.product?.name?.toLowerCase().includes(keyword) || String(auction.id).includes(keyword);
  });
  const total = data?.total ?? 0;
  const performance = {
    scheduled: allAuctions.filter((auction) => auction.status === 'SCHEDULED').length,
    closed: allAuctions.filter((auction) => auction.status === 'COMPLETED').length,
    live: allAuctions.filter((auction) => auction.status === 'ON_GOING').length,
  };

  return (
    <>
      {isCreateOpen && <CreateAuctionModal onClose={() => setIsCreateOpen(false)} />}

      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">My Auctions</h1>
                <p className="text-slate-500 mt-1">Manage your live auctions and view sales history.</p>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="flex items-center gap-2 rounded bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" /> Schedule Auction
                </button>
                <Link to="/auction-rules#seller" className="text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline">
                  View seller rules
                </Link>
              </div>
            </div>

            <div className="mt-6 rounded bg-slate-200 p-1">
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-5">
                {STATUS_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => {
                      setStatus(o.value);
                      setPage(1);
                    }}
                    className={`h-10 rounded text-sm font-medium transition-all ${
                      status === o.value ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:bg-white/60'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search your auctions..."
                className="h-11 rounded border-slate-200 bg-white pl-9"
              />
            </div>
            <AppPagination page={page} total={total} limit={limit} onPageChange={setPage} className="mt-4" />
          </div>

          <aside className="rounded border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <BarChart3 className="h-4 w-4 text-amber-500" /> Performance
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500"><span className="h-2 w-2 rounded-full bg-amber-400" /> Scheduled</span>
                <span className="font-semibold text-amber-600">{performance.scheduled}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500"><span className="h-2 w-2 rounded-full bg-slate-500" /> Closed</span>
                <span className="font-semibold text-slate-700">{performance.closed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500"><span className="h-2 w-2 rounded-full bg-red-500" /> Live</span>
                <span className="font-semibold text-red-600">{performance.live}</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                <span className="text-slate-500">Total Auction Submitted</span>
                <span className="font-semibold text-slate-900">{total}</span>
              </div>
            </div>
          </aside>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-44 bg-slate-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : auctions.length === 0 ? (
          <div className="py-24 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400">
            <Gavel className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-base font-medium">No auctions found</p>
            <p className="text-sm mt-1">Schedule an auction for your verified products</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {auctions.map((a) => (
              <OwnAuctionCard key={a.id} auction={a} />
            ))}
          </div>
        )}

      </main>
    </>
  );
}
