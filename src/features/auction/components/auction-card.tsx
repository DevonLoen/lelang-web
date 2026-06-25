import { Link } from 'react-router';
import type { AuctionResponse } from '../services/auction.schema';
import { AuctionStatus } from '../services/auction.schema';
import { useEffect, useState } from 'react';
import { Clock, ImageOff, CalendarDays, Timer, Gavel } from 'lucide-react';

const statusConfig: Record<AuctionStatus, { bg: string; dot: string; label: string }> = {
  SCHEDULED:            { bg: 'bg-slate-100 text-slate-700 ring-slate-200', dot: 'bg-slate-400', label: 'Scheduled' },
  ON_GOING:             { bg: 'bg-slate-900 text-white ring-slate-800', dot: 'bg-amber-400', label: 'Live' },
  WAITING_FOR_SELLER_DECISION: { bg: 'bg-amber-50 text-amber-900 ring-amber-200', dot: 'bg-amber-500', label: 'Pending Decision' },
  WAITING_FOR_PAYMENT:  { bg: 'bg-amber-50 text-amber-900 ring-amber-200', dot: 'bg-amber-500', label: 'Awaiting Payment' },
  WAITING_FOR_BUYER_ADDRESS: { bg: 'bg-slate-100 text-slate-700 ring-slate-200', dot: 'bg-slate-400', label: 'Awaiting Address' },
  WAITING_FOR_SHIPMENT: { bg: 'bg-slate-100 text-slate-700 ring-slate-200', dot: 'bg-slate-400', label: 'Awaiting Shipment' },
  SHIPPED:              { bg: 'bg-slate-100 text-slate-700 ring-slate-200', dot: 'bg-slate-400', label: 'Shipped' },
  DELIVERED:            { bg: 'bg-slate-100 text-slate-700 ring-slate-200', dot: 'bg-slate-400', label: 'Delivered' },
  CANCELLED:            { bg: 'bg-red-50 text-red-800 ring-red-200', dot: 'bg-red-500', label: 'Cancelled' },
  COMPLETED:            { bg: 'bg-slate-100 text-slate-700 ring-slate-200', dot: 'bg-slate-400', label: 'Completed' },
};

const formatIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatDate = (s: string) =>
  new Date(s).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function useCountdown(targetIso: string) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetIso).getTime() - Date.now();
      if (diff <= 0) {
        setLabel('Ended');
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setLabel(days > 0 ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m ${seconds}s`);
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [targetIso]);

  return label;
}

interface AuctionCardProps {
  auction: AuctionResponse;
  linkTo?: string;
}

export default function AuctionCard({ auction, linkTo }: AuctionCardProps) {
  const product = auction.product;
  const href = linkTo ?? `/auctions/${auction.id}`;
  const cfg = statusConfig[auction.status] ?? { bg: 'bg-slate-100 text-slate-700 ring-slate-200', dot: 'bg-slate-400', label: auction.status };
  const isLive = auction.status === AuctionStatus.ON_GOING;
  const countdownTarget = auction.status === AuctionStatus.SCHEDULED ? auction.start_time : auction.end_time;
  const countdown = useCountdown(countdownTarget);
  const currentBid = auction.winner?.auction_bid?.amount ?? auction.starting_price;
  const bidCount = auction.bids?.length ?? 0;

  return (
    <Link to={href} className="block group">
      <div className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-950/10">
        <div className="relative h-48 overflow-hidden bg-slate-100">
          {product?.cover_image_link ? (
            <img
              src={product.cover_image_link}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <ImageOff className="h-10 w-10 text-slate-300" />
              <span className="text-xs text-slate-400">No image</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />

          <div className={`absolute top-2.5 right-2.5 flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold shadow-sm ring-1 ${cfg.bg}`}>
            {isLive && <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`} />
            </span>}
            {cfg.label}
          </div>

          {product?.condition && (
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
              <span className="rounded-md bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-sm">
                {product.condition}
              </span>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col gap-2 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{isLive ? 'Bid now' : 'Upcoming lot'}</p>
          <h3 className="text-base font-semibold leading-snug text-slate-950 line-clamp-2 transition-colors group-hover:text-slate-700">
            {product?.name ?? 'Untitled'}
          </h3>

          <div className="mt-auto pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-end justify-between gap-3">
              <span className="text-[10px] font-bold uppercase text-slate-500">
                {isLive ? 'Current bid' : 'Starting price'}
              </span>
              <span className="text-base font-extrabold text-slate-950">{formatIDR(currentBid)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Gavel className="h-3 w-3" /> Bids
              </span>
              <span className="text-xs text-slate-700 font-semibold">{bidCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <CalendarDays className="h-3 w-3" /> Starts
              </span>
              <span className="text-xs text-slate-700 font-medium">{formatDate(auction.start_time)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Ends
              </span>
              <span className="text-xs text-slate-700 font-medium">{formatDate(auction.end_time)}</span>
            </div>
            <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${isLive ? 'bg-[#172235] text-white' : 'bg-slate-100 text-slate-700'}`}>
              <span className="text-xs flex items-center gap-1 font-medium">
                <Timer className="h-3 w-3" /> {isLive ? 'Ends in' : 'Starts in'}
              </span>
              <span className={`text-xs font-bold tabular-nums ${isLive ? 'text-white' : 'text-slate-900'}`}>{countdown}</span>
            </div>
            <div className="pt-1">
              <span className="flex h-9 items-center justify-center rounded-lg bg-slate-900 text-xs font-extrabold text-white transition-colors group-hover:bg-slate-800">
                {isLive ? 'Place Bid' : 'View Details'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
