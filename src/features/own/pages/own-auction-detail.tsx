import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ownService } from '../services/own.service';
import { auctionService } from '../../auction/services/auction.service';
import { useToast } from '../../../contexts/toast-context';
import { ToastType } from '../../../enums/toast-type';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft, Edit3, X, CheckCircle, Clock, Tag, Package, ImageOff,
  Trophy, RefreshCcw, Gift, Truck, MapPin, CheckCircle2, CalendarDays,
  Banknote, Loader2, ZoomIn, Timer, TrendingUp, Users,
} from 'lucide-react';

// ── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown(targetIso: string | undefined) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number; expired: boolean } | null>(null);
  useEffect(() => {
    if (!targetIso) return;
    const calc = () => {
      const diff = new Date(targetIso).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ d: 0, h: 0, m: 0, s: 0, expired: true }); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ d, h, m, s, expired: false });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [targetIso]);
  return timeLeft;
}

const statusStyles: Record<string, string> = {
  SCHEDULED: 'bg-sky-100 text-sky-800',
  ON_GOING: 'bg-green-100 text-green-800',
  WAITING_FOR_PAYMENT: 'bg-yellow-100 text-yellow-800',
  WAITING_FOR_SELLER_DECISION: 'bg-orange-100 text-orange-800',
  WAITING_FOR_SHIPMENT: 'bg-orange-100 text-orange-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-teal-100 text-teal-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-gray-200 text-gray-700',
};

const formatIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatDate = (s: string) =>
  new Date(s).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const toDatetimeLocal = (iso: string) => {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const POST_AUCTION_STATUSES = new Set([
  'WAITING_FOR_SELLER_DECISION', 'WAITING_FOR_PAYMENT',
  'WAITING_FOR_SHIPMENT', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED',
]);
const SHIPMENT_STATUSES = new Set(['WAITING_FOR_SHIPMENT', 'SHIPPED', 'DELIVERED', 'COMPLETED']);

export default function OwnAuctionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const qc = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [startingPrice, setStartingPrice] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedCost, setSelectedCost] = useState('');
  const [selectedImg, setSelectedImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { data: auction, isLoading } = useQuery({
    queryKey: ['own-auction', id],
    queryFn: () => ownService.getAuction(id!),
    enabled: !!id,
  });

  const startEdit = () => {
    if (!auction) return;
    setStartingPrice(String(auction.starting_price));
    setStartTime(toDatetimeLocal(auction.start_time));
    setEndTime(toDatetimeLocal(auction.end_time));
    setIsEditing(true);
  };

  const { mutate: updateAuction, isPending } = useMutation({
    mutationFn: () =>
      ownService.updateAuction(id!, {
        starting_price: Number(startingPrice),
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
      }),
    onSuccess: (res) => {
      showToast(res.message || 'Auction updated!', ToastType.SUCCESS);
      setIsEditing(false);
      qc.invalidateQueries({ queryKey: ['own-auction', id] });
    },
    onError: (e: any) => showToast(e.message, ToastType.ERROR),
  });

  // Winners
  const { data: winnersData } = useQuery({
    queryKey: ['own-auction-winners', id],
    queryFn: () => auctionService.listWinners(id!),
    enabled: !!id && !!auction && POST_AUCTION_STATUSES.has(auction.status),
  });
  const winner = winnersData?.nodes?.[0];

  // Relist
  const { mutate: relist, isPending: isRelisting } = useMutation({
    mutationFn: () => ownService.relistAuction(id!),
    onSuccess: (res) => {
      showToast(res.message || 'Auction relisted!', ToastType.SUCCESS);
      qc.invalidateQueries({ queryKey: ['own-auction', id] });
    },
    onError: (e: any) => showToast(e.message, ToastType.ERROR),
  });

  // Second chance
  const { mutate: secondChance, isPending: isSecondChancing } = useMutation({
    mutationFn: () => ownService.secondChanceAuction(id!),
    onSuccess: (res) => {
      showToast(res.message || 'Second chance offered!', ToastType.SUCCESS);
      qc.invalidateQueries({ queryKey: ['own-auction', id] });
    },
    onError: (e: any) => showToast(e.message, ToastType.ERROR),
  });

  // Shipments
  const { data: shipments } = useQuery({
    queryKey: ['own-auction-shipments', id],
    queryFn: () => auctionService.listShipments(id!),
    enabled: !!id && !!auction && SHIPMENT_STATUSES.has(auction.status),
  });
  const shipment = shipments?.[0];

  // Ship item
  const { mutate: shipItem, isPending: isShipping } = useMutation({
    mutationFn: () => {
      const [courier_code, service_code] = selectedCost.split(':');
      return auctionService.shipItem(id!, shipment!.id, { courier_code, service_code });
    },
    onSuccess: () => {
      showToast('Item shipped!', ToastType.SUCCESS);
      qc.invalidateQueries({ queryKey: ['own-auction', id] });
      qc.invalidateQueries({ queryKey: ['own-auction-shipments', id] });
    },
    onError: (e: any) => showToast(e.message, ToastType.ERROR),
  });

  // Bid history from auction response (sorted by amount descending)
  const bids = [...(auction?.bids ?? [])].sort((a, b) => b.amount - a.amount);

  // Countdown
  const countdownTarget = auction?.status === 'SCHEDULED'
    ? auction.start_time
    : auction?.status === 'ON_GOING'
    ? auction.end_time
    : undefined;
  const countdown = useCountdown(countdownTarget);

  if (isLoading) return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="animate-pulse space-y-6">
        <div className="h-5 w-32 bg-slate-100 rounded-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-slate-100 rounded-3xl" />
          <div className="space-y-3">
            <div className="h-7 bg-slate-100 rounded-xl w-3/4" />
            <div className="h-5 bg-slate-100 rounded-xl w-1/2" />
            <div className="h-32 bg-slate-100 rounded-2xl" />
          </div>
        </div>
      </div>
    </main>
  );
  if (!auction) return <div className="text-center py-20 text-slate-400">Auction not found.</div>;

  const product = auction.product;
  const images = [product?.cover_image_link, ...(product?.image_links ?? [])].filter(Boolean) as string[];
  const isScheduled = auction.status === 'SCHEDULED';
  const isWaitingDecision = auction.status === 'WAITING_FOR_SELLER_DECISION';
  const cfg = statusStyles[auction.status];
  const isLive = auction.status === 'ON_GOING';

  return (
    <>
    <main className="max-w-4xl mx-auto px-4 pb-16">
      {/* Back */}
      <div className="py-6">
        <button onClick={() => navigate('/own/auctions')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronLeft className="h-4 w-4" /> My Auctions
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Image gallery */}
        <div className="md:sticky md:top-24 space-y-3">
          <div
            className="rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 aspect-square shadow-sm cursor-zoom-in relative group"
            onClick={() => images.length > 0 && setLightboxOpen(true)}
          >
            {images.length > 0 ? (
              <>
                <img src={images[selectedImg]} alt={product?.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <ImageOff className="h-12 w-12 text-slate-300" />
                <span className="text-sm text-slate-400">No image available</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all ${i === selectedImg ? 'border-indigo-500 shadow-md' : 'border-slate-200 opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${cfg}`}>
                {isLive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                )}
                {auction.status.replace(/_/g, ' ')}
              </span>
              {product?.condition && (
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  {product.condition}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{product?.name ?? 'Untitled'}</h1>
            {product?.description && (
              <p className="text-sm text-slate-500 mt-2 leading-relaxed border-l-2 border-indigo-200 pl-3">{product.description}</p>
            )}
          </div>

          {/* Countdown */}
          {countdown && !countdown.expired && (
            <div className={`rounded-2xl px-4 py-3 flex items-center gap-3 ${auction.status === 'ON_GOING' ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'} text-white`}>
              <Timer className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium opacity-80">{auction.status === 'ON_GOING' ? 'Closing in' : 'Starts in'}</p>
                <p className="font-bold text-sm">
                  {countdown.d > 0 && `${countdown.d}d `}{String(countdown.h).padStart(2, '0')}:{String(countdown.m).padStart(2, '0')}:{String(countdown.s).padStart(2, '0')}
                </p>
              </div>
            </div>
          )}

          {/* Auction stats */}
          {!isEditing ? (
            <>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-slate-500 flex items-center gap-2"><Tag className="h-4 w-4 text-indigo-400" /> Starting Price</span>
                  <strong className="text-slate-900 text-sm">{formatIDR(auction.starting_price)}</strong>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-slate-500 flex items-center gap-2"><Banknote className="h-4 w-4 text-indigo-400" /> Platform Fee</span>
                  <strong className="text-slate-900 text-sm">{formatIDR(auction.fee)}</strong>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-slate-500 flex items-center gap-2"><CalendarDays className="h-4 w-4 text-indigo-400" /> Starts</span>
                  <strong className="text-slate-900 text-sm">{formatDate(auction.start_time)}</strong>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-slate-500 flex items-center gap-2"><Clock className="h-4 w-4 text-orange-400" /> Ends</span>
                  <strong className="text-slate-900 text-sm">{formatDate(auction.end_time)}</strong>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-slate-500 flex items-center gap-2"><Package className="h-4 w-4 text-indigo-400" /> Weight</span>
                  <strong className="text-slate-900 text-sm">{product?.weight_gram ? `${product.weight_gram} g` : '—'}</strong>
                </div>
              </div>
              {isScheduled && (
                <button onClick={startEdit}
                  className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors px-4 py-2.5 rounded-xl border border-indigo-200 hover:bg-indigo-50 self-start">
                  <Edit3 className="h-4 w-4" /> Edit Auction
                </button>
              )}
            </>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                <Edit3 className="h-4 w-4 text-indigo-500" /> Edit Auction
              </h2>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Starting Price (IDR)</label>
                <Input type="number" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} min={1} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Start Time</label>
                <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">End Time</label>
                <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5">
                  <X className="h-4 w-4" /> Cancel
                </button>
                <button onClick={() => updateAuction()} disabled={isPending}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 text-sm">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  {isPending ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Post-auction sections ─────────────────────────────── */}
      <div className="mt-8 space-y-4">

        {/* Winner */}
        {winner && (
          <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 px-5 py-4 flex items-center gap-4 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Trophy className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-amber-900">Auction Winner</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Winning bid: <strong>{formatIDR(winner.auction_bid?.amount ?? 0)}</strong>
                {' · '}Status: <strong className="capitalize">{winner.status.replace(/_/g, ' ')}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Bid History */}
        {bids.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-indigo-500" /> Bid History
              <span className="ml-auto text-xs text-slate-400 font-normal flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {bids.length} bids
              </span>
            </h3>
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {bids.map((bid, i) => (
                <div key={bid.id} className={`flex items-center justify-between py-2.5 ${i === 0 ? 'bg-green-50 -mx-3 px-3 rounded-xl' : ''}`}>
                  <div className="flex items-center gap-2">
                    {i === 0 && <Trophy className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                    <div>
                      <p className="text-sm font-medium text-slate-800">{bid.user?.fullname ?? 'Bidder'}</p>
                      <p className="text-xs text-slate-400">{bid.created_at ? new Date(bid.created_at).toLocaleString() : ''}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${i === 0 ? 'text-green-700' : 'text-slate-700'}`}>{formatIDR(bid.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seller Decision */}
        {isWaitingDecision && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-xl bg-orange-100 flex items-center justify-center">
                <RefreshCcw className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-orange-900">Seller Decision Required</p>
                <p className="text-sm text-orange-700">The auction ended without a winner. Choose how to proceed:</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => relist()} disabled={isRelisting}
                className="flex-1 py-3 rounded-xl border border-orange-300 bg-white text-orange-700 font-semibold text-sm hover:bg-orange-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {isRelisting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                Relist Auction
              </button>
              <button onClick={() => secondChance()} disabled={isSecondChancing}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                {isSecondChancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
                Second Chance
              </button>
            </div>
          </div>
        )}

        {/* Shipment */}
        {shipment && SHIPMENT_STATUSES.has(auction.status) && (
          <div className="rounded-2xl border border-purple-200 bg-white overflow-hidden">
            <div className="px-5 py-3.5 border-b border-purple-100 flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-purple-100 flex items-center justify-center">
                <Truck className="h-4 w-4 text-purple-600" />
              </div>
              <span className="font-semibold text-slate-800">Shipment</span>
            </div>
            <div className="p-5 space-y-5">

              {/* Buyer address */}
              {shipment.buyer_address_snapshot ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Ship To
                  </p>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-sm space-y-0.5">
                    <p className="font-semibold text-slate-900">{shipment.buyer_address_snapshot.recipient_name}</p>
                    <p className="text-slate-500">{shipment.buyer_address_snapshot.phone}</p>
                    <p className="text-slate-600">{shipment.buyer_address_snapshot.address}</p>
                    <p className="text-slate-600">
                      {shipment.buyer_address_snapshot.city_name}, {shipment.buyer_address_snapshot.province_name}{' '}
                      {shipment.buyer_address_snapshot.postal_code}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Waiting for buyer to set shipping address…
                </div>
              )}

              {/* Courier selection */}
              {shipment.buyer_address_snapshot && !shipment.courier_code && auction.status === 'WAITING_FOR_SHIPMENT' && (
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <p className="text-sm font-semibold text-slate-700">Select courier:</p>
                  {shipment.estimated_costs.length === 0 ? (
                    <p className="text-sm text-slate-400">No courier options available.</p>
                  ) : (
                    <div className="space-y-2">
                      {shipment.estimated_costs.map((cost) => {
                        const val = `${cost.courier_code}:${cost.courier_service_code}`;
                        return (
                          <label key={val}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                              selectedCost === val ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'
                            }`}>
                            <input type="radio" name="courier" value={val} checked={selectedCost === val}
                              onChange={(e) => setSelectedCost(e.target.value)} className="accent-indigo-600" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-800">{cost.courier_name} · {cost.courier_service_name}</p>
                              <p className="text-xs text-slate-500">{cost.duration} · {formatIDR(cost.price)}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  <button onClick={() => shipItem()} disabled={!selectedCost || isShipping}
                    className="py-3 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm flex items-center gap-2">
                    {isShipping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                    {isShipping ? 'Shipping…' : 'Ship Item'}
                  </button>
                </div>
              )}

              {/* Courier info */}
              {shipment.courier_code && (
                <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-4">
                  <span className="text-slate-500">Courier</span>
                  <strong className="text-slate-800">{shipment.courier_code} · {shipment.service_code}</strong>
                </div>
              )}
              {shipment.shipping_cost != null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Shipping Cost</span>
                  <strong className="text-slate-800">{formatIDR(shipment.shipping_cost)}</strong>
                </div>
              )}

              {/* Tracking */}
              {shipment.tracking_number && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-purple-500 mb-1.5">Tracking Number</p>
                  <p className="font-mono font-bold text-purple-900 text-base">{shipment.tracking_number}</p>
                  {shipment.shipped_at && (
                    <p className="text-xs text-purple-500 mt-1">Shipped on {formatDate(shipment.shipped_at)}</p>
                  )}
                </div>
              )}

              {/* Received by buyer */}
              {shipment.received_at && (
                <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl p-4">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-teal-900 text-sm">Item Received by Buyer</p>
                    <p className="text-xs text-teal-600 mt-0.5">{formatDate(shipment.received_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>

    {/* Lightbox */}
    {lightboxOpen && images.length > 0 && (
      <div
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        onClick={() => setLightboxOpen(false)}
      >
        <button
          className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 rounded-full p-2 transition-colors"
          onClick={() => setLightboxOpen(false)}
        >
          <X className="h-6 w-6" />
        </button>
        <div className="flex gap-4 items-center max-h-full" onClick={(e) => e.stopPropagation()}>
          {images.length > 1 && (
            <button
              className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors flex-shrink-0"
              onClick={() => setSelectedImg((i) => (i - 1 + images.length) % images.length)}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <img
            src={images[selectedImg]}
            alt={product?.name}
            className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl"
          />
          {images.length > 1 && (
            <button
              className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors flex-shrink-0"
              onClick={() => setSelectedImg((i) => (i + 1) % images.length)}
            >
              <ChevronLeft className="h-6 w-6 rotate-180" />
            </button>
          )}
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setSelectedImg(i); }}
                className={`h-2 rounded-full transition-all ${i === selectedImg ? 'bg-white w-6' : 'w-2 bg-white/40'}`}
              />
            ))}
          </div>
        )}
      </div>
    )}
    </>
  );
}

