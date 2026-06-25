import { AlertCircle, Banknote, Clock3, PackageCheck, ShieldCheck, type LucideIcon } from 'lucide-react';
import type React from 'react';
import type { AuctionResponse, PaymentResponse, ShipmentResponse } from '@/features/auction/services/auction.schema';
import { cn } from '@/lib/utils';

type RegulationContext = 'buyer' | 'seller' | 'full';

interface AuctionRegulationCardProps {
  context?: RegulationContext;
  auction?: AuctionResponse;
  payment?: PaymentResponse;
  shipment?: ShipmentResponse;
  className?: string;
}

const formatIDR = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const formatDate = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export function AuctionRegulationCard({
  context = 'full',
  auction,
  payment,
  shipment,
  className,
}: AuctionRegulationCardProps) {
  const buyerAmount = payment?.amount ?? auction?.payment?.amount ?? auction?.winner?.auction_bid?.amount;
  const sellerFee = auction?.fee;
  const netRevenue = buyerAmount != null && sellerFee != null ? buyerAmount - sellerFee : undefined;

  const showBuyerRules = context === 'buyer' || context === 'full';
  const showSellerRules = context === 'seller' || context === 'full';

  const deadlineRows = [
    ['Buyer address deadline', shipment?.buyer_address_deadline_at],
    ['Ship deadline', shipment?.ship_deadline_at],
    ['Delivered at', shipment?.delivered_at],
    ['Receive deadline', shipment?.receive_deadline_at],
    ['Buyer address failed at', shipment?.buyer_address_failed_at],
    ['Seller failed at', shipment?.seller_failed_at],
    ['Auto received at', shipment?.auto_received_at],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  return (
    <section className={cn('rounded-lg border border-amber-200 bg-amber-50/60 p-4 shadow-sm', className)}>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-950">Auction, Payment, and Shipment Rules</h3>
          <p className="text-xs leading-5 text-slate-600">Bidify keeps buyer checkout and seller payout fees separate.</p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {showBuyerRules && (
          <RuleBlock icon={Banknote} title="Buyer checkout">
            <li>Buyer pays only the winning bid amount in Midtrans.</li>
            <li>Do not add platform or admin fee to buyer checkout total.</li>
            <li>
              Midtrans gross amount is <strong>payment.amount</strong>; item details should represent the winning bid item only.
            </li>
            {buyerAmount != null && <li>Current buyer payment amount: <strong>{formatIDR(buyerAmount)}</strong>.</li>}
          </RuleBlock>
        )}

        {showSellerRules && (
          <RuleBlock icon={Banknote} title="Seller fee and payout">
            <li>Platform fee is charged to seller: 5% of the final winning bid.</li>
            <li>Seller payout equals winning bid minus the 5% seller fee.</li>
            <li>Example: winning bid Rp1,000,000, seller fee Rp50,000, seller receives Rp950,000.</li>
            {sellerFee != null && (
              <li>
                Current seller fee: <strong>{formatIDR(sellerFee)}</strong>
                {sellerFee === 0 ? ' before final winner/payment fee is created.' : '.'}
              </li>
            )}
            {netRevenue != null && <li>Estimated seller net revenue: <strong>{formatIDR(netRevenue)}</strong>.</li>}
            {sellerFee == null && <li>auction.fee stores the nominal seller fee after winner/payment is created.</li>}
          </RuleBlock>
        )}

        <RuleBlock icon={Clock3} title="Payment flow">
          <li>Winner has 24 hours to pay after auction closes.</li>
          <li>If payment expires, winner is cancelled and auction moves to seller decision flow.</li>
          <li>Seller can relist the item or offer it to the next highest bidder.</li>
          {(payment?.expired_at ?? auction?.payment?.expired_at) && (
            <li>Payment deadline: <strong>{formatDate((payment?.expired_at ?? auction?.payment?.expired_at)!)}</strong>.</li>
          )}
        </RuleBlock>

        <RuleBlock icon={PackageCheck} title="Shipment flow">
          <li>After payment succeeds, buyer has 24 hours to confirm or select shipping address.</li>
          <li>If buyer misses address deadline, payment is refunded to buyer balance and seller decision flow starts.</li>
          <li>After buyer confirms address, seller has 72 hours to ship.</li>
          <li>If seller misses shipping deadline, order is refunded and status becomes seller failed to ship.</li>
          <li>After courier delivery, buyer has 168 hours / 7 days to confirm receipt.</li>
          <li>If buyer misses receipt deadline, backend auto-completes and releases seller payout after fee deduction.</li>
          <li>Tracking is checked every 60 minutes; displayed deadlines come from API timestamps.</li>
        </RuleBlock>
      </div>

      {deadlineRows.length > 0 && (
        <div className="mt-3 rounded-lg border border-amber-100 bg-white/80 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-700">
            <AlertCircle className="h-3.5 w-3.5" />
            API timeline fields
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {deadlineRows.map(([label, value]) => (
              <div key={label} className="rounded border border-slate-100 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-800">{formatDate(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function RuleBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-amber-100 bg-white/80 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
        <Icon className="h-4 w-4 text-amber-600" />
        {title}
      </div>
      <ul className="space-y-1.5 text-xs leading-5 text-slate-600">
        {children}
      </ul>
    </div>
  );
}
