import { useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { auctionService } from '../services/auction.service';
import { useToast } from '../../../contexts/toast-context';
import { ToastType } from '../../../enums/toast-type';
import {
  ArrowLeft,
  Clock,
  Link as LinkIcon,
  MapPin,
  Truck,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const formatDate = (value: string) =>
  new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function ShipmentTrackingPage() {
  const { auctionId, shipmentId } = useParams<{ auctionId: string; shipmentId: string }>();
  const { showToast } = useToast();

  const isValidPath = Boolean(auctionId && shipmentId && UUID_PATTERN.test(auctionId) && UUID_PATTERN.test(shipmentId));

  const { data: tracking, isLoading, error } = useQuery({
    queryKey: ['shipment-tracking', auctionId, shipmentId],
    queryFn: () => auctionService.getTracking(auctionId!, shipmentId!),
    enabled: isValidPath,
    retry: false,
    onError: (e: any) => {
      showToast(e?.message || 'Failed to load shipment tracking.', ToastType.ERROR);
    },
  });

  const history = useMemo(
    () => [...(tracking?.history ?? [])].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [tracking?.history],
  );

  if (!isValidPath) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="space-y-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h1 className="text-xl font-semibold text-red-900">Invalid tracking link</h1>
            </div>
            <p className="mt-3 text-sm text-red-700">The tracking URL is malformed. Please verify the shipment link and try again.</p>
            <Link to="/" className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-purple-700 hover:text-purple-900">
              <ArrowLeft className="h-4 w-4" /> Back to auctions
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const renderStatus = tracking?.status ?? 'Unknown';
  const infoSection = tracking ? (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Truck className="h-5 w-5 text-violet-600" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Courier</p>
            <p className="text-sm text-slate-500">{tracking.courier.company || 'Unknown'}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          <p><span className="font-semibold text-slate-800">Driver</span>: {tracking.courier.driver_name || tracking.courier.name || '-'}</p>
          <p><span className="font-semibold text-slate-800">Phone</span>: {tracking.courier.driver_phone || tracking.courier.phone || '-'}</p>
          <p><span className="font-semibold text-slate-800">Waybill</span>: {tracking.waybill_id || '-'}</p>
          <p><span className="font-semibold text-slate-800">Status</span>: {renderStatus}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="h-5 w-5 text-slate-600" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Shipping From</p>
            <p className="text-sm text-slate-500">{tracking.origin?.address || '-'}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          <p><span className="font-semibold text-slate-800">Contact</span>: {tracking.origin?.contact_name || '-'}</p>
          <p><span className="font-semibold text-slate-800">Address</span>: {tracking.origin?.address || '-'}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="h-5 w-5 text-slate-600" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Shipping To</p>
            <p className="text-sm text-slate-500">{tracking.destination?.address || '-'}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          <p><span className="font-semibold text-slate-800">Recipient</span>: {tracking.destination?.contact_name || '-'}</p>
          <p><span className="font-semibold text-slate-800">Address</span>: {tracking.destination?.address || '-'}</p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Shipment Tracking</h1>
          <p className="mt-2 text-sm text-slate-500">Tracking details for shipment <span className="font-medium text-slate-900">{shipmentId}</span>.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to={`/auctions/${auctionId}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" /> Back to auction
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {isLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
              <Clock className="h-4 w-4 animate-spin" /> Loading tracking information…
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p className="font-semibold">Unable to load tracking details.</p>
            </div>
            <p className="mt-2 text-sm">{(error as Error)?.message || 'Tracking data could not be loaded. Please try again later.'}</p>
          </div>
        )}

        {tracking && (
          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-widest text-slate-500">Tracking summary</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">{tracking.message || 'Shipment tracking data'}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">{tracking.object || 'tracking'}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">{tracking.success ? 'Success' : 'Incomplete'}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase text-slate-500">Order ID</p>
                  <p className="mt-2 font-medium text-slate-900 break-all">{tracking.order_id || '-'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase text-slate-500">Tracking ID</p>
                  <p className="mt-2 font-medium text-slate-900 break-all">{tracking.id || '-'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase text-slate-500">Waybill</p>
                  <p className="mt-2 font-medium text-slate-900 break-all">{tracking.waybill_id || '-'}</p>
                </div>
              </div>

              {tracking.link && (
                <a
                  href={tracking.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-purple-700 hover:text-purple-900"
                >
                  <LinkIcon className="h-4 w-4" /> Open courier tracking page
                </a>
              )}
            </div>

            {infoSection}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                <ShieldCheck className="h-4 w-4 text-slate-500" />
                History
              </div>
              {history.length === 0 ? (
                <p className="text-sm text-slate-500">No shipment history is available yet.</p>
              ) : (
                <div className="space-y-4">
                  {history.map((entry) => (
                    <div key={`${entry.status}-${entry.updated_at}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                        <span className="font-semibold text-slate-800">{entry.status}</span>
                        <span>{formatDate(entry.updated_at)}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{entry.note}</p>
                      {entry.service_type && <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">Service: {entry.service_type}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
