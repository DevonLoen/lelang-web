import { Link } from 'react-router';
import type { AuctionResponse } from '../services/auction.schema';
import { AuctionStatus } from '../services/auction.schema';
import { Clock, Tag, ImageOff } from 'lucide-react';

const statusConfig: Record<AuctionStatus, { bg: string; dot: string; label: string }> = {
  SCHEDULED:            { bg: 'bg-sky-100 text-sky-800',      dot: 'bg-sky-400',    label: 'Scheduled' },
  ON_GOING:             { bg: 'bg-green-100 text-green-800',   dot: 'bg-green-500',  label: 'Live' },
  WAITING_FOR_SELLER_DECISION: { bg: 'bg-amber-100 text-amber-800',  dot: 'bg-amber-400',  label: 'Pending Decision' },
  WAITING_FOR_PAYMENT:  { bg: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-400', label: 'Awaiting Payment' },
  WAITING_FOR_SHIPMENT: { bg: 'bg-orange-100 text-orange-800', dot: 'bg-orange-400', label: 'Awaiting Shipment' },
  SHIPPED:              { bg: 'bg-purple-100 text-purple-800', dot: 'bg-purple-400', label: 'Shipped' },
  DELIVERED:            { bg: 'bg-teal-100 text-teal-800',     dot: 'bg-teal-400',   label: 'Delivered' },
  CANCELLED:            { bg: 'bg-red-100 text-red-800',       dot: 'bg-red-400',    label: 'Cancelled' },
  COMPLETED:            { bg: 'bg-gray-200 text-gray-700',     dot: 'bg-gray-400',   label: 'Completed' },
};

const formatIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatDate = (s: string) =>
  new Date(s).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

interface AuctionCardProps {
  auction: AuctionResponse;
  linkTo?: string;
}

export default function AuctionCard({ auction, linkTo }: AuctionCardProps) {
  const product = auction.product;
  const href = linkTo ?? `/auctions/${auction.id}`;
  const cfg = statusConfig[auction.status] ?? { bg: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400', label: auction.status };
  const isLive = auction.status === AuctionStatus.ON_GOING;

  return (
    <Link to={href} className="block group">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-amber-200 flex flex-col h-full">
        {/* Image */}
        <div className="relative h-48 bg-slate-50 overflow-hidden">
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

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-75" />

          {/* Status badge */}
          <div className={`absolute top-2.5 right-2.5 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${cfg.bg}`}>
            {isLive && <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`} />
            </span>}
            {cfg.label}
          </div>

          {/* Condition ribbon */}
          {product?.condition && (
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">{product.condition}</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-amber-700 transition-colors leading-snug">
            {product?.name ?? 'Untitled'}
          </h3>

          <div className="mt-auto pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Tag className="h-3 w-3" /> Starting bid
              </span>
              <span className="text-sm font-bold text-amber-700">{formatIDR(auction.starting_price)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Ends
              </span>
              <span className="text-xs text-slate-700 font-medium">{formatDate(auction.end_time)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
