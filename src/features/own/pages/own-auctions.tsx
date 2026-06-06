import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ownService } from '../services/own.service';
import { useToast } from '../../../contexts/toast-context';
import { ToastType } from '../../../enums/toast-type';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router';
import { Plus, Clock, Tag, ChevronLeft, ChevronRight, X, Gavel, ImageOff } from 'lucide-react';
import type { AuctionResponse, ProductResponse } from '../../auction/services/auction.schema';

const statusStyles: Record<string, string> = {
  SCHEDULED: 'bg-sky-100 text-sky-800',
  ON_GOING: 'bg-green-100 text-green-800',
  WAITING_FOR_PAYMENT: 'bg-yellow-100 text-yellow-800',
  WAITING_FOR_SHIPMENT: 'bg-orange-100 text-orange-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-teal-100 text-teal-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-gray-200 text-gray-700',
};

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'On Going', value: 'ON_GOING' },
  { label: 'Waiting Payment', value: 'WAITING_FOR_PAYMENT' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const formatIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatDate = (s: string) =>
  new Date(s).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─── Create Auction Modal ────────────────────────────────────────────────────
function CreateAuctionModal({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast();
  const qc = useQueryClient();
  const [productId, setProductId] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Load verified products for selection
  const { data: productsData } = useQuery({
    queryKey: ['own-products-verified'],
    queryFn: () => ownService.listProducts({ status: 'VERIFIED', limit: 100 }),
  });
  const verifiedProducts: ProductResponse[] = productsData?.nodes ?? [];

  const { mutate: create, isPending } = useMutation({
    mutationFn: () =>
      ownService.createAuction({
        product_id: productId,
        starting_price: Number(startingPrice),
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
      }),
    onSuccess: (res) => {
      showToast(res.message || 'Auction created!', ToastType.SUCCESS);
      qc.invalidateQueries({ queryKey: ['own-auctions'] });
      onClose();
    },
    onError: (e: any) => showToast(e.message, ToastType.ERROR),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return showToast('Select a product', ToastType.ERROR);
    if (!startingPrice || Number(startingPrice) <= 0) return showToast('Enter a valid starting price', ToastType.ERROR);
    if (!startTime || !endTime) return showToast('Select start and end time', ToastType.ERROR);
    if (new Date(startTime) >= new Date(endTime)) return showToast('End time must be after start time', ToastType.ERROR);
    create();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2"><Gavel className="h-5 w-5 text-indigo-600" /> Schedule Auction</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X /></button>
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
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Starting Price (IDR) *</label>
            <Input type="number" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} placeholder="e.g. 100000" min={1} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Start Time *</label>
            <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">End Time *</label>
            <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isPending}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors">
              {isPending ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Auction Card ────────────────────────────────────────────────────────────
function OwnAuctionCard({ auction }: { auction: AuctionResponse }) {
  const product = auction.product;
  return (
    <Link to={`/own/auctions/${auction.id}`}>
      <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
          <div className="relative h-44 bg-slate-50 overflow-hidden">
          {product?.cover_image_link ? (
            <img src={product.cover_image_link} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <ImageOff className="h-8 w-8 text-slate-300" />
              <span className="text-xs text-slate-300">No image</span>
            </div>
          )}
          <span className={`absolute top-2 right-2 text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[auction.status] ?? 'bg-gray-100'}`}>
            {auction.status.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="p-4 flex flex-col gap-1.5 flex-1">
          <h3 className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{product?.name ?? 'Untitled'}</h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Tag className="h-3.5 w-3.5" />
            <span>{formatIDR(auction.starting_price)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5 text-orange-400" />
            <span>Ends {formatDate(auction.end_time)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function OwnAuctionsPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const limit = 12;

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

  const auctions = data?.nodes ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <>
      {isCreateOpen && <CreateAuctionModal onClose={() => setIsCreateOpen(false)} />}

      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Auctions</h1>
            <p className="text-slate-500 mt-1">Schedule and manage auctions for your products.</p>
          </div>
          <button onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl transition-colors">
            <Plus className="h-4 w-4" /> Schedule Auction
          </button>
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => { setStatus(o.value); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                status === o.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
              }`}
            >
              {o.label}
            </button>
          ))}
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
            {auctions.map((a) => <OwnAuctionCard key={a.id} auction={a} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="h-9 w-9 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              return (
                <button key={p} onClick={() => setPage(p)} className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${ p === page ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100' }`}>{p}</button>
              );
            })}
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
              className="h-9 w-9 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>
    </>
  );
}
