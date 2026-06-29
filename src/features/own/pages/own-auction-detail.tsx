import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ownService } from '../services/own.service';
import { auctionService } from '../../auction/services/auction.service';
import { useToast } from '../../../contexts/toast-context';
import { ToastType } from '../../../enums/toast-type';
import { Input } from '@/components/ui/input';
import { DateTimePicker, toLocalDateTimeInputValue } from '@/components/date-time-picker';
import {
  ChevronLeft, Edit3, X, CheckCircle, Clock, Tag, Package, ImageOff,
  Trophy, RefreshCcw, Gift, Truck, MapPin, CheckCircle2, CalendarDays,
  Banknote, Loader2, ZoomIn, Timer, TrendingUp, Users,
} from 'lucide-react';

//  Countdown hook 
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
  SCHEDULED: 'bg-slate-100 text-slate-700',
  ON_GOING: 'bg-slate-100 text-slate-800',
  WAITING_FOR_PAYMENT: 'bg-amber-50 text-amber-900',
  WAITING_FOR_SELLER_DECISION: 'bg-amber-100 text-amber-900',
  WAITING_FOR_SHIPMENT: 'bg-amber-100 text-amber-900',
  SHIPPED: 'bg-slate-100 text-slate-800',
  DELIVERED: 'bg-slate-100 text-slate-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-gray-200 text-gray-700',
};

const formatIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatDate = (s: string) =>
  new Date(s).toLocaleString('en-US', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const toDatetimeLocal = (iso: string) => {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const getMinimumScheduleTime = () => {
  const next = new Date(Date.now() + 5 * 60 * 1000);
  next.setSeconds(0, 0);
  return toLocalDateTimeInputValue(next);
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
  const [scheduleError, setScheduleError] = useState('');
  const [selectedCost, setSelectedCost] = useState('');
  const [selectedSellerAddressId, setSelectedSellerAddressId] = useState('');
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
    setScheduleError('');
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
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed to update auction', ToastType.ERROR),
  });

  const handleUpdateAuction = () => {
    const minScheduleTime = getMinimumScheduleTime();
    setScheduleError('');
    if (!startingPrice || Number(startingPrice) <= 0) {
      setScheduleError('Starting price must be greater than zero.');
      showToast('Enter a valid starting price', ToastType.ERROR);
      return;
    }
    if (!startTime || !endTime) {
      setScheduleError('Choose both start and end time.');
      showToast('Select start and end time', ToastType.ERROR);
      return;
    }
    if (new Date(startTime).getTime() < new Date(minScheduleTime).getTime()) {
      setScheduleError('Start time must be at least five minutes from now.');
      showToast('Start time must be in the future', ToastType.ERROR);
      return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
      setScheduleError('End time must be after start time.');
      showToast('End time must be after start time', ToastType.ERROR);
      return;
    }
    updateAuction();
  };

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
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed to relist auction', ToastType.ERROR),
  });

  // Second chance
  const { mutate: secondChance, isPending: isSecondChancing } = useMutation({
    mutationFn: () => ownService.secondChanceAuction(id!),
    onSuccess: (res) => {
      showToast(res.message || 'Second chance offered!', ToastType.SUCCESS);
      qc.invalidateQueries({ queryKey: ['own-auction', id] });
    },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed to offer second chance', ToastType.ERROR),
  });

  // Shipments
  const { data: shipments } = useQuery({
    queryKey: ['own-auction-shipments', id],
    queryFn: () => auctionService.listShipments(id!),
    enabled: !!id && !!auction && SHIPMENT_STATUSES.has(auction.status),
  });
  const shipment = shipments?.[0];

  // Owner addresses (for seller) - used to let seller choose a sender address before shipping
  const { data: ownerAddressesData } = useQuery({
    queryKey: ['own-user-addresses'],
    queryFn: () => ownService.listUserAddresses(),
    enabled: !!id && !!auction && auction.status === 'WAITING_FOR_SHIPMENT',
  });
  const ownerAddresses = useMemo(() => ownerAddressesData?.nodes ?? [], [ownerAddressesData?.nodes]);

  useEffect(() => {
    if (!shipment || !ownerAddresses.length) return;
    if (shipment.seller_address_id) {
      setSelectedSellerAddressId(String(shipment.seller_address_id));
      return;
    }
    const defaultAddress = ownerAddresses.find((addr) => addr.is_default);
    if (defaultAddress) setSelectedSellerAddressId(String(defaultAddress.id));
  }, [shipment, ownerAddresses]);

  const { mutate: updateSellerAddress, isPending: isUpdatingSellerAddress } = useMutation({
    mutationFn: () => auctionService.updateSellerAddress(id!, shipment!.id, Number(selectedSellerAddressId)),
    onSuccess: () => {
      showToast('Sender address selected!', ToastType.SUCCESS);
      qc.invalidateQueries({ queryKey: ['own-auction-shipments', id] });
    },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed to select sender address', ToastType.ERROR),
  });

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
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed to ship item', ToastType.ERROR),
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
  const minScheduleTime = getMinimumScheduleTime();

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
                  className={`flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all ${i === selectedImg ? 'border-slate-500 shadow-md' : 'border-slate-200 opacity-60 hover:opacity-100'}`}
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
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500" />
                  </span>
                )}
                {auction.status.replace(/_/g, ' ')}
              </span>
              {product?.condition && (
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 bg-slate-50 px-2.5 py-1 rounded-full">
                  {product.condition}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{product?.name ?? 'Untitled'}</h1>
            {product?.description && (
              <p className="text-sm text-slate-500 mt-2 leading-relaxed border-l-2 border-slate-200 pl-3">{product.description}</p>
            )}
          </div>

          {/* Countdown */}
          {countdown && !countdown.expired && (
            <div className={`rounded-2xl px-4 py-3 flex items-center gap-3 ${auction.status === 'ON_GOING' ? 'bg-gradient-to-r from-slate-900 to-slate-800' : 'bg-gradient-to-r from-slate-900 to-slate-800'} text-white`}>
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
                <div className="flex flex-col items-start gap-1.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-slate-500 flex items-center gap-2"><Tag className="h-4 w-4 text-slate-400" /> Starting Price</span>
                  <strong className="text-slate-900 text-sm sm:text-right">{formatIDR(auction.starting_price)}</strong>
                </div>
                <div className="flex flex-col items-start gap-1.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-slate-500 flex items-center gap-2"><Banknote className="h-4 w-4 text-slate-400" /> Seller Admin Fee</span>
                  <strong className="text-slate-900 text-sm sm:text-right">{formatIDR(auction.fee)}</strong>
                </div>
                <div className="flex flex-col items-start gap-1.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-slate-500 flex items-center gap-2"><CalendarDays className="h-4 w-4 text-slate-400" /> Starts</span>
                  <strong className="text-slate-900 text-sm sm:text-right">{formatDate(auction.start_time)}</strong>
                </div>
                <div className="flex flex-col items-start gap-1.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-slate-500 flex items-center gap-2"><Clock className="h-4 w-4 text-amber-600" /> Ends</span>
                  <strong className="text-slate-900 text-sm sm:text-right">{formatDate(auction.end_time)}</strong>
                </div>
                <div className="flex flex-col items-start gap-1.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-slate-500 flex items-center gap-2"><Package className="h-4 w-4 text-slate-400" /> Weight</span>
                  <strong className="text-slate-900 text-sm sm:text-right">{product?.weight_gram ? `${product.weight_gram} g` : ''}</strong>
                </div>
              </div>
              {isScheduled && (
                <button onClick={startEdit}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-800 transition-colors px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 self-start">
                  <Edit3 className="h-4 w-4" /> Edit Auction
                </button>
              )}
            </>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                <Edit3 className="h-4 w-4 text-slate-500" /> Edit Auction
              </h2>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Starting Price (IDR)</label>
                <Input type="number" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} min={1} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Start Time</label>
                <DateTimePicker
                  label="Auction starts"
                  value={startTime}
                  onChange={setStartTime}
                  minValue={minScheduleTime}
                  helperText="Pick a start time at least five minutes from now."
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">End Time</label>
                <DateTimePicker
                  label="Auction ends"
                  value={endTime}
                  onChange={setEndTime}
                  minValue={startTime || minScheduleTime}
                  helperText="The end time must be after the start time."
                />
              </div>
              {scheduleError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {scheduleError}
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5">
                  <X className="h-4 w-4" /> Cancel
                </button>
                <button onClick={handleUpdateAuction} disabled={isPending}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 text-sm">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  {isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/*  Post-auction sections  */}
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
                {'  '}Status: <strong className="capitalize">{winner.status.replace(/_/g, ' ')}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Bid History */}
        {bids.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-slate-500" /> Bid History
              <span className="ml-auto text-xs text-slate-400 font-normal flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {bids.length} bids
              </span>
            </h3>
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {bids.map((bid, i) => (
                <div key={bid.id} className={`flex flex-col items-start gap-2 py-2.5 sm:flex-row sm:items-center sm:justify-between ${i === 0 ? 'bg-slate-50 -mx-3 px-3 rounded-xl' : ''}`}>
                  <div className="flex items-center gap-2">
                    {i === 0 && <Trophy className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                    <div>
                      <p className="text-sm font-medium text-slate-800">{bid.user?.fullname ?? 'Bidder'}</p>
                      <p className="text-xs text-slate-400">{bid.created_at ? new Date(bid.created_at).toLocaleString('en-US') : ''}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${i === 0 ? 'text-slate-700' : 'text-slate-700'}`}>{formatIDR(bid.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seller Decision */}
        {isWaitingDecision && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center">
                <RefreshCcw className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="font-semibold text-amber-950">Seller Decision Required</p>
                <p className="text-sm text-amber-800">The auction ended without a winner. Choose how to proceed:</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => relist()} disabled={isRelisting}
                className="flex-1 py-3 rounded-xl border border-amber-300 bg-white text-amber-800 font-semibold text-sm hover:bg-amber-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {isRelisting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                Relist Auction
              </button>
              <button onClick={() => secondChance()} disabled={isSecondChancing}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                {isSecondChancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
                Second Chance
              </button>
            </div>
          </div>
        )}

        {/* Shipment */}
        {shipment && SHIPMENT_STATUSES.has(auction.status) && (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-3.5 border-b border-purple-100 flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center">
                <Truck className="h-4 w-4 text-slate-600" />
              </div>
              <span className="font-semibold text-slate-800">Shipment</span>
            </div>
            <div className="p-5 space-y-5">

              {/* Seller address */}
              {auction.status === 'WAITING_FOR_SHIPMENT' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700">Select your sender address:</p>
                    {ownerAddresses.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl">
                        <MapPin className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 mb-1">No seller address on file.</p>
                        <Link to="/own/addresses" className="text-slate-700 text-sm font-medium hover:underline">
                          + Add an address
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {ownerAddresses.map((addr) => (
                            <label
                              key={addr.id}
                              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                                selectedSellerAddressId === String(addr.id)
                                  ? 'border-slate-500 bg-slate-50 shadow-sm'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="sellerAddress"
                                value={String(addr.id)}
                                checked={selectedSellerAddressId === String(addr.id)}
                                onChange={(e) => setSelectedSellerAddressId(e.target.value)}
                                className="mt-1 accent-indigo-600"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800">
                                  {addr.label}
                                  {addr.is_default && (
                                    <span className="ml-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-full">
                                      Default
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">{addr.recipient_name}  {addr.phone}</p>
                                <p className="text-xs text-slate-500">{addr.address}, {addr.city_name}, {addr.province_name} {addr.postal_code}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                        <button
                          onClick={() => updateSellerAddress()}
                          disabled={!selectedSellerAddressId || isUpdatingSellerAddress}
                          className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          {isUpdatingSellerAddress ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                          {isUpdatingSellerAddress ? 'Saving...' : 'Use This Address'}
                        </button>
                      </>
                    )}
                  </div>

                  {shipment.seller_address_snapshot ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> Shipping From
                      </p>
                      <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-sm space-y-0.5">
                        <p className="font-semibold text-slate-900">{shipment.seller_address_snapshot.recipient_name}</p>
                        <p className="text-slate-500">{shipment.seller_address_snapshot.phone}</p>
                        <p className="text-slate-600">{shipment.seller_address_snapshot.address}</p>
                        <p className="text-slate-600">
                          {shipment.seller_address_snapshot.city_name}, {shipment.seller_address_snapshot.province_name}{' '}
                          {shipment.seller_address_snapshot.postal_code}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-sm">
                      <p className="font-semibold text-slate-900">Shipping From</p>
                      <p className="text-slate-500 mt-1">No sender address snapshot is available yet.</p>
                      <p className="text-sm text-slate-500 mt-2">
                        Please add your seller address in{' '}
                        <Link to="/own/addresses" className="font-semibold text-slate-700 hover:underline">My Addresses</Link> before shipping.
                      </p>
                    </div>
                  )}
                </div>
              )}

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
                  <Loader2 className="h-4 w-4 animate-spin" /> Waiting for buyer to set shipping address
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
                              selectedCost === val ? 'border-slate-500 bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                            }`}>
                            <input type="radio" name="courier" value={val} checked={selectedCost === val}
                              onChange={(e) => setSelectedCost(e.target.value)} className="accent-indigo-600" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-800">{cost.courier_name}  {cost.courier_service_name}</p>
                              <p className="text-xs text-slate-500">{cost.duration}  {formatIDR(cost.price)}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  <button onClick={() => shipItem()} disabled={!selectedCost || isShipping}
                    className="py-3 px-5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm flex items-center gap-2">
                    {isShipping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                    {isShipping ? 'Shipping...' : 'Ship Item'}
                  </button>
                </div>
              )}

              {/* Courier info */}
              {shipment.courier_code && (
                <div className="flex flex-col items-start gap-1.5 text-sm border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-slate-500">Courier</span>
                  <strong className="text-slate-800 sm:text-right">{shipment.courier_code}  {shipment.service_code}</strong>
                </div>
              )}
              {shipment.shipping_cost != null && (
                <div className="flex flex-col items-start gap-1.5 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-slate-500">Shipping Cost</span>
                  <strong className="text-slate-800 sm:text-right">{formatIDR(shipment.shipping_cost)}</strong>
                </div>
              )}

              {/* Tracking */}
              {shipment.tracking_number && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Tracking Number</p>
                      <p className="font-mono font-bold text-slate-900 text-base">{shipment.tracking_number}</p>
                    </div>
                    {auction?.id && (
                      <Link
                        to={`/${auction.id}/shipments/${shipment.id}/tracking`}
                        className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      >
                        View shipment tracking
                      </Link>
                    )}
                  </div>
                  {shipment.shipped_at && (
                    <p className="text-xs text-slate-500 mt-1">Shipped on {formatDate(shipment.shipped_at)}</p>
                  )}
                </div>
              )}

              {/* Received by buyer */}
              {shipment.received_at && (
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <CheckCircle2 className="h-5 w-5 text-slate-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Item Received by Buyer</p>
                    <p className="text-xs text-slate-600 mt-0.5">{formatDate(shipment.received_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Need to check seller responsibilities?</p>
          <Link to="/auction-rules#seller" className="mt-1 inline-flex text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline">
            View seller auction rules
          </Link>
        </div>
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

