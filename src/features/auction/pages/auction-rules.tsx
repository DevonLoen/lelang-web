import { ArrowLeft, Banknote, Clock3, PackageCheck, ShieldCheck, Store, UserCheck, type LucideIcon } from 'lucide-react';
import { useProfile } from '@/features/own/hooks/use-profile';
import { hasAuthToken } from '@/utils/auth';

const bidderRules = [
  {
    title: 'Bidding',
    items: [
      'Place a bid only when you are ready to complete the purchase if you win.',
      'The highest valid bid at auction close becomes the winner.',
      'A winning bid cannot be cancelled from the buyer side after the auction closes.',
    ],
  },
  {
    title: 'Payment',
    items: [
      'Bidder pays only the winning bid amount through Midtrans.',
      'Platform or admin fee is not added to the bidder checkout total.',
      'Winner has 24 hours to complete payment after the auction closes.',
      'If payment expires, the winner is cancelled and the auction moves to seller decision flow.',
    ],
  },
  {
    title: 'Address and Receipt',
    items: [
      'After payment succeeds, bidder has 24 hours to confirm or select a shipping address.',
      'If the address deadline is missed, payment is refunded to buyer balance and seller decision flow starts.',
      'After courier delivery, bidder has 7 days to confirm receipt.',
      'If bidder misses the receipt deadline, the system can auto-complete the transaction.',
    ],
  },
];

const sellerRules = [
  {
    title: 'Auction Setup',
    items: [
      'Seller must use verified products before scheduling an auction.',
      'Auction schedule, starting price, and product details should be accurate before publishing.',
      'Seller should not change product expectations after bids have started.',
    ],
  },
  {
    title: 'Fee and Payout',
    items: [
      'Platform fee is charged to seller: 5% of the final winning bid.',
      'Seller payout equals winning bid minus the 5% seller fee.',
      'Example: winning bid Rp1,000,000, seller fee Rp50,000, seller receives Rp950,000.',
      'Seller payout is released after the transaction is completed.',
    ],
  },
  {
    title: 'Shipment',
    items: [
      'After buyer confirms address, seller has 72 hours to ship.',
      'Seller must provide valid shipment information when required.',
      'If seller misses the shipping deadline, the order can be refunded and marked as seller failed to ship.',
      'Tracking is checked periodically and displayed status follows API shipment timestamps.',
    ],
  },
];

export default function AuctionRulesPage() {
  const isAuthenticated = hasAuthToken();
  const { data: user, isLoading } = useProfile();
  
  const isSeller = user?.roles?.some((role) => role.role === 'SELLER') ?? false;
  const isBidder = user?.roles?.some((role) => role.role === 'BIDDER') ?? false;
  
  const canSeeSellerRules = !isLoading && isAuthenticated && isSeller;
  // Hapus !isSeller dan tambahkan (isBidder || isSeller) untuk jaga-jaga
  // jika API hanya mengembalikan role SELLER tanpa BIDDER
  const canSeeBidderRules = !isLoading && isAuthenticated && (isBidder || isSeller);
  
  // Sesuaikan title dan description untuk user yang bisa melihat keduanya
  const title = canSeeSellerRules 
    ? 'Seller & Bidder Auction Rules' 
    : canSeeBidderRules 
      ? 'Bidder Auction Rules' 
      : 'Auction Rules';
      
  const description = canSeeSellerRules
    ? 'Responsibilities for product owners and bidders, covering auction creation, bidding, shipment, and payout flow.'
    : canSeeBidderRules
      ? 'Responsibilities for bidders and auction winners, including payment, address, and receipt flow.'
      : 'Request bidder or seller access to view the rules for that role.';

  return (
    <main className="bidify-page-narrow">
      <button
        type="button"
        onClick={() => window.history.back()}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <section className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-slate-900 text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Bidify Regulation</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6">
        {canSeeBidderRules && (
          <RuleSection 
            id="bidder" 
            icon={UserCheck} 
            title="Bidder Rules" 
            intro="For bidders and auction winners." 
            groups={bidderRules} 
          />
        )}
        {canSeeSellerRules && (
          <RuleSection 
            id="seller" 
            icon={Store} 
            title="Seller Rules" 
            intro="For product owners and auction creators." 
            groups={sellerRules} 
          />
        )}
        {!isLoading && !canSeeBidderRules && !canSeeSellerRules && (
          <section className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
            <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="font-semibold text-slate-900">No auction role yet</p>
            <p className="mt-1 text-sm text-slate-500">Request bidder or seller access to view the rules for that role.</p>
          </section>
        )}
      </div>
    </main>
  );
}

function RuleSection({
  id,
  icon: Icon,
  title,
  intro,
  groups,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  intro: string;
  groups: { title: string; items: string[] }[];
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 text-slate-800">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          <p className="text-sm text-slate-500">{intro}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {groups.map((group, index) => (
          <div key={group.title} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
              {index === 0 && <ShieldCheck className="h-4 w-4 text-slate-500" />}
              {index === 1 && <Banknote className="h-4 w-4 text-slate-500" />}
              {index === 2 && (id === 'bidder' ? <Clock3 className="h-4 w-4 text-slate-500" /> : <PackageCheck className="h-4 w-4 text-slate-500" />)}
              {group.title}
            </div>
            <ul className="space-y-2 text-sm leading-6 text-slate-600">
              {group.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}