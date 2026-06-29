import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useProductDetail } from '../hooks/use-product-detail';
import { CalendarDays, ChevronLeft, ImageOff, Layers, PackageCheck, Tag, X, ZoomIn } from 'lucide-react';

const statusStyles: Record<string, string> = {
  DRAFT: 'border-slate-200 bg-slate-100 text-slate-700',
  REQUEST: 'border-slate-200 bg-slate-50 text-slate-700',
  VERIFIED: 'border-slate-200 bg-slate-50 text-slate-800',
  SCHEDULED: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  ON_BIDS: 'border-amber-200 bg-amber-50 text-amber-800',
  REJECTED: 'border-red-200 bg-red-50 text-red-800',
  COMPLETED: 'border-slate-300 bg-slate-100 text-slate-800',
};

const formatDate = (date?: Date) =>
  date
    ? new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
    : 'Not available';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const productId = id ? Number(id) : NaN;
  const hasValidId = Number.isFinite(productId);
  const { data, isLoading } = useProductDetail(hasValidId ? productId : '');

  if (!hasValidId) return <main className="bidify-page text-center text-slate-500">Product ID is missing.</main>;

  if (isLoading) {
    return (
      <main className="bidify-page">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
          <div className="aspect-[4/3] animate-pulse rounded-lg bg-slate-100" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-slate-100" />
            <div className="h-28 animate-pulse rounded bg-slate-100" />
            <div className="h-40 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </main>
    );
  }
  if (!data) return <main className="bidify-page text-center text-slate-500">Product not found.</main>;

  const allImages = [data.coverImageUrl, ...(data.imageUrls || [])];
  const currentImage = allImages[selectedImageIndex];
  const statusClass = statusStyles[data.status] ?? 'border-slate-200 bg-slate-100 text-slate-700';

  return (
    <>
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 transition-opacity"
          onClick={() => setIsLightboxOpen(false)}
        >
          <img
            src={currentImage}
            alt="Full view"
            className="max-w-[95%] max-h-[90vh] object-contain cursor-zoom-out shadow-2xl"
          />
          <button className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      <main className="bidify-page">
        <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-950">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <section className="space-y-3">
            <div
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm"
              onClick={() => currentImage && setIsLightboxOpen(true)}
            >
              {currentImage ? (
                <>
                  <img
                    src={currentImage}
                    alt={data.name}
                    className="h-full w-full cursor-zoom-in object-cover transition-transform duration-300 group-hover:scale-[1.015]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/0 opacity-0 transition-all group-hover:bg-slate-950/10 group-hover:opacity-100">
                    <span className="rounded-full bg-white/90 p-2 shadow-sm">
                      <ZoomIn className="h-5 w-5 text-slate-700" />
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                  <ImageOff className="h-10 w-10" />
                  <span className="text-sm">No image available</span>
                </div>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                {allImages.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded border transition-all ${
                      selectedImageIndex === index
                        ? 'border-slate-900 ring-2 ring-slate-200'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`View ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-5">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
                  {data.status.replace(/_/g, ' ')}
                </span>
                <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {data.condition}
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">{data.name}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">{data.description || 'No description provided.'}</p>
            </div>

            <div className="bidify-panel divide-y divide-slate-100">
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                  <PackageCheck className="h-4 w-4 text-slate-400" /> Status
                </span>
                <strong className="text-right text-sm text-slate-900">{data.status.replace(/_/g, ' ')}</strong>
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                  <Tag className="h-4 w-4 text-slate-400" /> Condition
                </span>
                <strong className="text-right text-sm text-slate-900">{data.condition}</strong>
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays className="h-4 w-4 text-slate-400" /> Created
                </span>
                <strong className="text-right text-sm text-slate-900">{formatDate(data.createdAt)}</strong>
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                  <Layers className="h-4 w-4 text-slate-400" /> Gallery
                </span>
                <strong className="text-right text-sm text-slate-900">{allImages.length} image{allImages.length === 1 ? '' : 's'}</strong>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Auction Readiness</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Verified products can be scheduled from your product inventory. Keep the photos and description clear before starting an auction.
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
