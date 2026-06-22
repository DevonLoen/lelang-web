import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auctionService } from '../services/auction.service';
import { ownService } from '../../own/services/own.service';
import { userAddressService } from '../../user-address/services/user-address.service';
import { AuctionStatus } from '../services/auction.schema';
import { useToast } from '../../../contexts/toast-context';
import { ToastType } from '../../../enums/toast-type';
import {
  Gavel,
  Clock,
  Tag,
  Package,
  Users,
  ImageOff,
  Trophy,
  Truck,
  MapPin,
  CheckCircle2,
  Upload,
  ChevronLeft,
  AlertCircle,
  CalendarDays,
  Loader2,
  X,
  ZoomIn,
  TrendingUp,
  Crown,
  Timer,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  SCHEDULED: { label: 'Scheduled', bg: 'bg-sky-100', text: 'text-sky-800' },
  ON_GOING: { label: 'Live Now', bg: 'bg-green-100', text: 'text-green-800' },
  WAITING_FOR_PAYMENT: { label: 'Awaiting Payment', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  WAITING_FOR_SELLER_DECISION: { label: 'Pending Decision', bg: 'bg-orange-100', text: 'text-orange-800' },
  WAITING_FOR_BUYER_ADDRESS: { label: 'Waiting for Address', bg: 'bg-indigo-100', text: 'text-indigo-800' },
  WAITING_FOR_SHIPMENT: { label: 'Preparing Shipment', bg: 'bg-blue-100', text: 'text-blue-800' },
  SHIPPED: { label: 'Shipped', bg: 'bg-purple-100', text: 'text-purple-800' },
  DELIVERED: { label: 'Delivered', bg: 'bg-teal-100', text: 'text-teal-800' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-800' },
  COMPLETED: { label: 'Completed', bg: 'bg-slate-100', text: 'text-slate-700' },
};

// ── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown(targetIso: string | undefined) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number; expired: boolean } | null>(null);
  useEffect(() => {
    if (!targetIso) return;
    const calc = () => {
      const diff = new Date(targetIso).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0, expired: true });
        return;
      }
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

function Section({
  title,
  icon: Icon,
  accentBorder = 'border-slate-200',
  accentIcon = 'bg-slate-100 text-slate-600',
  children,
}: {
  title: string;
  icon: any;
  accentBorder?: string;
  accentIcon?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`bg-white rounded-2xl border ${accentBorder} overflow-hidden shadow-sm`}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
        <div className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 ${accentIcon}`}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

const formatIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatDate = (s: string) =>
  new Date(s).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const POST_AUCTION = new Set([
  'WAITING_FOR_SELLER_DECISION',
  'WAITING_FOR_PAYMENT',
  'WAITING_FOR_SHIPMENT',
  'SHIPPED',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
]);
const SHIPMENT_PHASE = new Set(['WAITING_FOR_SHIPMENT', 'WAITING_FOR_BUYER_ADDRESS', 'SHIPPED', 'DELIVERED', 'COMPLETED']);

export default function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bidAmount, setBidAmount] = useState('');
  const [selectedImg, setSelectedImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const proofRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: auction, isLoading } = useQuery({
    queryKey: ['auction', id],
    queryFn: () => auctionService.getAuction(id!),
    enabled: !!id,
  });

  const { data: profile } = useQuery({
    queryKey: ['own-profile'],
    queryFn: () => ownService.getProfile(),
    retry: false,
  });

  useEffect(() => {
    if (!id || !auction || auction.status !== AuctionStatus.ON_GOING) return;

    const wsUrl = `ws://localhost:8080/ws/auctions/${id}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`Connected to live auction stream for Auction ID: ${id}`);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        const isItMe = profile && payload.user === profile.fullname;
        const incomingUserId = isItMe ? profile.id : payload.user_id || -1;

        queryClient.setQueryData(['auction', id], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            winner: {
              ...oldData.winner,
              auction_bid: {
                ...oldData.winner?.auction_bid,
                amount: payload.amount,
                user_id: incomingUserId,
              },
            },
          };
        });

        if (isItMe) {
          queryClient.setQueryData(['my-bids-for-auction', id], (oldData: any) => {
            const newBidNode = {
              id: Date.now(),
              amount: payload.amount,
              is_winner: true,
              created_at: new Date().toISOString(),
            };

            if (!oldData || !oldData.nodes) {
              return { nodes: [newBidNode] };
            }

            const updatedNodes = oldData.nodes.map((b: any) => ({ ...b, is_winner: false }));
            return {
              ...oldData,
              nodes: [newBidNode, ...updatedNodes],
            };
          });
        } else {
          queryClient.setQueryData(['my-bids-for-auction', id], (oldData: any) => {
            if (!oldData || !oldData.nodes) return oldData;
            return {
              ...oldData,
              nodes: oldData.nodes.map((b: any) => ({ ...b, is_winner: false })),
            };
          });
        }

        queryClient.invalidateQueries({ queryKey: ['my-bids-for-auction', id] });

        if (payload.user) {
          showToast(`New bid placed by ${payload.user}: ${formatIDR(payload.amount)}`, ToastType.SUCCESS);
        }
      } catch (err) {
        console.error('Failed to parse websocket message', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected from live auction stream');
    };

    return () => {
      ws.close();
    };
  }, [id, auction?.status, queryClient]);
  // ─────────────────────────────────────────────────────────────────────────────

  const isPostAuction = !!auction && POST_AUCTION.has(auction.status);
  const isShipmentPhase = !!auction && SHIPMENT_PHASE.has(auction.status);
  const isLiveOrScheduled =
    !!auction && (auction.status === AuctionStatus.ON_GOING || auction.status === AuctionStatus.SCHEDULED);

  // Countdown
  const countdownTarget =
    auction?.status === AuctionStatus.SCHEDULED
      ? auction.start_time
      : auction?.status === AuctionStatus.ON_GOING
        ? auction.end_time
        : undefined;
  const countdown = useCountdown(countdownTarget);

  // Fetch my own bids for this auction (to check if I'm currently winning or if I won)
  const { data: myBidsData } = useQuery({
    queryKey: ['my-bids-for-auction', id],
    queryFn: () =>
      ownService.listBids({ auction_id: Number(id), limit: 50, sorts: [{ field: 'created_at', direction: 'desc' }] }),
    enabled: !!id && !!profile,
    retry: false,
  });
  const myBids = myBidsData?.nodes ?? [];
  const myTopBid = myBids.find((b) => b.is_winner === true) ?? myBids[0];
  const isCurrentUserBuyer = myTopBid?.is_winner === true;
  const payment = myTopBid?.payment;

  // Highest bid from auction.winner relation (available from public endpoint)
  const highestBid = auction?.winner?.auction_bid?.amount;
  const highestBidUserId = auction?.winner?.auction_bid?.user_id;
  const iAmWinning = !!profile && !!highestBidUserId && highestBidUserId === profile.id;

  // Shipments
  const { data: shipments } = useQuery({
    queryKey: ['auction-shipments', id],
    queryFn: () => auctionService.listShipments(id!),
    enabled: !!id && isCurrentUserBuyer && isShipmentPhase,
  });
  const shipment = shipments?.[0];

  // Addresses
  const { data: addressesData } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: () => userAddressService.list(),
    enabled:
      isCurrentUserBuyer &&
      (auction?.status === AuctionStatus.WAITING_FOR_BUYER_ADDRESS || auction?.status === AuctionStatus.WAITING_FOR_SHIPMENT),
  });
  const addresses = addressesData?.nodes ?? [];

  // Place bid
  const { mutate: placeBid, isPending: isBidding } = useMutation({
    mutationFn: (amount: number) => auctionService.placeBid(id!, { amount }),
    onSuccess: () => {
      showToast('Bid placed successfully!', ToastType.SUCCESS);
      setBidAmount('');
      queryClient.invalidateQueries({ queryKey: ['auction', id] });
    },
    onError: (e: any) => showToast(e.message, ToastType.ERROR),
  });

  // Set shipping address
  const { mutate: updateAddress, isPending: isUpdatingAddress } = useMutation({
    mutationFn: () => auctionService.updateBuyerAddress(id!, shipment!.id, selectedAddressId),
    onSuccess: () => {
      showToast('Shipping address saved!', ToastType.SUCCESS);
      queryClient.invalidateQueries({ queryKey: ['auction-shipments', id] });
    },
    onError: (e: any) => showToast(e.message, ToastType.ERROR),
  });

  // Confirm receipt
  const { mutate: receiveItem, isPending: isReceiving } = useMutation({
    mutationFn: async () => {
      let proofPath = '';
      if (proofFile) proofPath = await ownService.uploadFile(proofFile);
      return auctionService.receiveItem(id!, shipment!.id, proofPath);
    },
    onSuccess: () => {
      showToast('Receipt confirmed!', ToastType.SUCCESS);
      setProofFile(null);
      queryClient.invalidateQueries({ queryKey: ['auction', id] });
      queryClient.invalidateQueries({ queryKey: ['auction-shipments', id] });
    },
    onError: (e: any) => showToast(e.message, ToastType.ERROR),
  });

  const handleBid = () => {
    const amount = Number(bidAmount);
    if (!amount || amount <= 0) return showToast('Enter a valid bid amount', ToastType.ERROR);
    placeBid(amount);
  };

  if (isLoading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-5 w-40 bg-slate-100 rounded-full" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-square bg-slate-100 rounded-3xl" />
            <div className="space-y-4">
              <div className="h-8 bg-slate-100 rounded-xl w-3/4" />
              <div className="h-5 bg-slate-100 rounded-xl w-1/2" />
              <div className="h-32 bg-slate-100 rounded-2xl" />
              <div className="h-24 bg-slate-100 rounded-2xl" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!auction) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-14 w-14 text-slate-300 mx-auto" />
        <p className="text-slate-500 mt-4 text-lg">Auction not found.</p>
        <Link
          to="/auctions"
          className="inline-block mt-6 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Back to Auctions
        </Link>
      </main>
    );
  }

  const product = auction.product;
  const canBid = auction.status === AuctionStatus.ON_GOING && !!profile;
  const images = [product?.cover_image_link, ...(product?.image_links ?? [])].filter(Boolean) as string[];
  const cfg = STATUS_CONFIG[auction.status] ?? { label: auction.status, bg: 'bg-slate-100', text: 'text-slate-700' };
  const isLive = auction.status === AuctionStatus.ON_GOING;

  return (
    <main className="max-w-5xl mx-auto px-4 pb-16">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-800 font-medium truncate">{product?.name}</span>
      </div>

      {/* ── Winner banner (buyer-only, post-auction) ──── */}
      {isCurrentUserBuyer && isPostAuction && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 px-5 py-4 flex items-center gap-4 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Trophy className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-amber-900 text-lg leading-tight">Congratulations, you won!</p>
            <p className="text-amber-700 text-sm mt-0.5">
              Winning bid: <strong>{formatIDR(payment?.amount ?? 0)}</strong>
            </p>
          </div>
          <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
        </div>
      )}

      {/* ── Live/Scheduled bidding status ──────────────────── */}
      {profile && isLiveOrScheduled && (
        <div
          className={`mb-6 rounded-2xl px-5 py-3.5 flex items-center gap-3 border ${
            iAmWinning
              ? 'bg-green-50 border-green-200'
              : myTopBid
                ? 'bg-orange-50 border-orange-200'
                : 'bg-indigo-50 border-indigo-100'
          }`}
        >
          {iAmWinning ? (
            <>
              <Crown className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-sm font-semibold text-green-800">
                Your bid of <strong>{formatIDR(myTopBid?.amount ?? 0)}</strong> is currently winning!
              </p>
            </>
          ) : myTopBid ? (
            <>
              <TrendingUp className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <p className="text-sm font-semibold text-orange-800">
                You've bid <strong>{formatIDR(myTopBid.amount)}</strong> — currently outbid. Raise your bid!
              </p>
            </>
          ) : (
            <>
              <Gavel className="h-5 w-5 text-indigo-500 flex-shrink-0" />
              <p className="text-sm text-indigo-700">You haven't placed a bid yet.</p>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* ── Image gallery ───────────────────────────────── */}
        <div className="space-y-3 lg:sticky lg:top-24">
          <div
            className="rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 aspect-square shadow-md relative group cursor-zoom-in"
            onClick={() => images.length > 0 && setLightboxOpen(true)}
          >
            {images[selectedImg] ? (
              <>
                <img src={images[selectedImg]} alt={product?.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-white/90 rounded-full p-2.5 shadow-lg">
                    <ZoomIn className="h-5 w-5 text-slate-700" />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <ImageOff className="h-14 w-14 text-slate-300" />
                <span className="text-sm text-slate-400">No image available</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`h-16 w-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImg === i ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <img src={url} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info panel ──────────────────────────────────── */}
        <div className="space-y-4">
          {/* Title & status */}
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}
              >
                {isLive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                )}
                {cfg.label}
              </span>
              {product?.condition && (
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  {product.condition}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{product?.name}</h1>
            {product?.user && (
              <p className="mt-1.5 text-sm text-slate-500 flex items-center gap-1.5">
                <Users className="h-4 w-4" /> Sold by <strong className="text-slate-700">{product.user.fullname}</strong>
              </p>
            )}
          </div>

          {product?.description && (
            <p className="text-slate-600 text-sm leading-relaxed border-l-2 border-indigo-200 pl-3">{product.description}</p>
          )}

          {/* Countdown */}
          {countdown && !countdown.expired && (
            <div
              className={`rounded-2xl px-5 py-4 ${
                isLive
                  ? 'bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg shadow-red-200'
                  : 'bg-gradient-to-br from-sky-600 to-blue-700 text-white shadow-lg shadow-sky-200'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80 flex items-center gap-2 mb-3">
                <Timer className="h-4 w-4" /> {isLive ? 'Closes in' : 'Starts in'}
              </p>
              <div className="flex items-end gap-3">
                {[
                  { v: countdown.d, label: 'Days' },
                  { v: countdown.h, label: 'Hours' },
                  { v: countdown.m, label: 'Min' },
                  { v: countdown.s, label: 'Sec' },
                ].map(({ v, label }) => (
                  <div key={label} className="text-center">
                    <div className="text-3xl font-bold tabular-nums leading-none">{String(v).padStart(2, '0')}</div>
                    <div className="text-xs opacity-70 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auction stats */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <Tag className="h-4 w-4 text-indigo-400" /> Starting Price
              </span>
              <strong className="text-slate-900 text-sm">{formatIDR(auction.starting_price)}</strong>
            </div>
            {highestBid != null && (
              <div className="flex items-center justify-between px-4 py-3 bg-green-50/50">
                <span className="text-sm text-slate-500 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" /> Highest Bid
                </span>
                <strong className="text-green-700 text-sm font-bold">{formatIDR(highestBid)}</strong>
              </div>
            )}
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <Package className="h-4 w-4 text-indigo-400" /> Platform Fee
              </span>
              <strong className="text-slate-900 text-sm">{formatIDR(auction.fee)}</strong>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-indigo-400" /> Starts
              </span>
              <strong className="text-slate-900 text-sm">{formatDate(auction.start_time)}</strong>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-400" /> Ends
              </span>
              <strong className="text-slate-900 text-sm">{formatDate(auction.end_time)}</strong>
            </div>
          </div>

          {/* Bid form */}
          {canBid && (
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-5 shadow-lg shadow-indigo-200">
              <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                <Gavel className="h-4 w-4" /> Place Your Bid
              </p>
              {highestBid != null && (
                <p className="text-indigo-200 text-xs mb-3">
                  Current highest: <strong className="text-white">{formatIDR(highestBid)}</strong>
                </p>
              )}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm font-medium">Rp</span>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBid()}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm bg-white/10 text-white placeholder-indigo-300"
                    min={highestBid != null ? highestBid + 1 : auction.starting_price}
                  />
                </div>
                <button
                  onClick={handleBid}
                  disabled={isBidding}
                  className="px-5 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-60 text-sm flex items-center gap-2 flex-shrink-0"
                >
                  {isBidding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gavel className="h-4 w-4" />}
                  {isBidding ? 'Bidding…' : 'Bid Now'}
                </button>
              </div>
              <p className="text-indigo-300 text-xs mt-2">
                Minimum: {formatIDR(highestBid != null ? highestBid + 1 : auction.starting_price)}
              </p>
            </div>
          )}

          {!profile && auction.status === AuctionStatus.ON_GOING && (
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center">
              <p className="text-sm text-slate-500 mb-3">Sign in to place a bid</p>
              <Link
                to="/login"
                className="inline-block px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── My Bids History ────────────────────────────────────── */}
      {profile && myBids.length > 0 && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <Gavel className="h-4 w-4 text-indigo-500" /> My Bids for This Auction
            <span className="ml-auto text-xs text-slate-400 font-normal">
              {myBids.length} {myBids.length === 1 ? 'bid' : 'bids'}
            </span>
          </h3>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {myBids.map((bid) => (
              <div
                key={bid.id}
                className={`flex items-center justify-between py-3 ${bid.is_winner ? 'bg-green-50 -mx-4 px-4 rounded-xl' : ''}`}
              >
                <div className="flex items-center gap-2">
                  {bid.is_winner && <Trophy className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                  <div>
                    <p className="text-sm font-medium text-slate-800">{formatIDR(bid.amount)}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(bid.created_at).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                {bid.is_winner && (
                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Winning Bid</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Lightbox ─────────────────────────────────────────── */}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImg(i);
                  }}
                  className={`h-2 rounded-full transition-all ${i === selectedImg ? 'bg-white w-6' : 'w-2 bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Post-auction buyer sections ──────────────────────── */}
      {isCurrentUserBuyer && (
        <div className="mt-8 space-y-4">
          {/* Shipment */}
          {isShipmentPhase && (
            <Section title="Shipment" icon={Truck} accentBorder="border-purple-200" accentIcon="bg-purple-100 text-purple-600">
              <div className="space-y-5">
                {/* Address selection */}
                {auction.status === AuctionStatus.WAITING_FOR_BUYER_ADDRESS && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700">Select your delivery address:</p>
                    {addresses.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl">
                        <MapPin className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 mb-1">No address on file.</p>
                        <Link to="/own/addresses" className="text-indigo-600 text-sm font-medium hover:underline">
                          + Add an address
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {addresses.map((addr) => (
                            <label
                              key={addr.id}
                              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                                selectedAddressId === addr.id
                                  ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                  : 'border-slate-200 hover:border-indigo-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="address"
                                value={addr.id}
                                checked={selectedAddressId === addr.id}
                                onChange={(e) => setSelectedAddressId(e.target.value)}
                                className="mt-1 accent-indigo-600"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800">
                                  {addr.label}
                                  {addr.is_default && (
                                    <span className="ml-2 text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-full">
                                      Default
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {addr.recipient_name} · {addr.phone}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {addr.address}, {addr.city_name}, {addr.province_name} {addr.postal_code}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                        <button
                          onClick={() => updateAddress()}
                          disabled={!selectedAddressId || isUpdatingAddress}
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          {isUpdatingAddress ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                          {isUpdatingAddress ? 'Saving…' : 'Use This Address'}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Shipment addresses */}
                <div className="grid gap-4 lg:grid-cols-2">
                  {shipment?.seller_address_snapshot ? (
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
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
                      <p className="font-semibold text-slate-900">Shipping From</p>
                      <p className="text-slate-500 mt-1">Seller sender address snapshot is not available yet.</p>
                    </div>
                  )}

                  {shipment?.buyer_address_snapshot ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> Shipping To
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
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
                      <p className="font-semibold text-slate-900">Shipping To</p>
                      <p className="text-slate-500 mt-1">Buyer destination address is not set yet.</p>
                    </div>
                  )}
                </div>

                {/* Courier info */}
                {shipment?.courier_code && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Courier</span>
                      <span className="font-semibold text-slate-800">
                        {shipment.courier_code} · {shipment.service_code}
                      </span>
                    </div>
                    {shipment.shipping_cost != null && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Shipping Cost</span>
                        <span className="font-semibold text-slate-800">{formatIDR(shipment.shipping_cost)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tracking */}
                {shipment?.tracking_number && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-purple-500 mb-1.5">Tracking Number</p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-mono font-bold text-purple-900 text-base">{shipment.tracking_number}</p>
                      {auction?.id && (
                        <Link
                          to={`/${auction.id}/shipments/${shipment.id}/tracking`}
                          className="inline-flex rounded-full border border-purple-200 bg-white px-3 py-2 text-sm font-semibold text-purple-700 hover:border-purple-300 hover:bg-purple-50"
                        >
                          View shipment tracking
                        </Link>
                      )}
                    </div>
                    {shipment.shipped_at && (
                      <p className="text-xs text-purple-500 mt-1">Shipped on {formatDate(shipment.shipped_at)}</p>
                    )}
                  </div>
                )}

                {/* Confirm receipt */}
                {auction.status === AuctionStatus.SHIPPED && (
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <p className="text-sm font-semibold text-slate-700">Confirm item received:</p>
                    <input
                      ref={proofRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                    />
                    <button
                      type="button"
                      onClick={() => proofRef.current?.click()}
                      className={`w-full py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        proofFile
                          ? 'border-teal-300 bg-teal-50 text-teal-700'
                          : 'border-dashed border-slate-300 text-slate-500 hover:border-slate-400'
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      {proofFile ? proofFile.name : 'Upload delivery proof (optional)'}
                    </button>
                    <button
                      onClick={() => receiveItem()}
                      disabled={isReceiving}
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md shadow-teal-100"
                    >
                      {isReceiving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                      {isReceiving ? 'Confirming…' : 'Confirm Receipt'}
                    </button>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Delivered / completed */}
          {(auction.status === AuctionStatus.DELIVERED || auction.status === AuctionStatus.COMPLETED) && (
            <div className="flex items-center gap-4 bg-teal-50 border border-teal-200 rounded-2xl px-5 py-4">
              <div className="h-10 w-10 rounded-2xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="font-semibold text-teal-900">
                  {auction.status === AuctionStatus.COMPLETED ? 'Transaction Complete' : 'Item Delivered'}
                </p>
                <p className="text-sm text-teal-700">
                  {auction.status === AuctionStatus.COMPLETED
                    ? 'This auction has been successfully completed.'
                    : 'Your item has been delivered. Please confirm receipt above.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
