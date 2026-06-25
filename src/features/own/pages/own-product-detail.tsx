import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ownService } from '../services/own.service';
import { useToast } from '../../../contexts/toast-context';
import { ToastType } from '../../../enums/toast-type';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Edit3, Send, Upload, CheckCircle, X, Clock, ImageOff, Loader2 } from 'lucide-react';

const statusStyles: Record<string, string> = {
  DRAFT: 'border-slate-200 bg-slate-100 text-slate-700',
  REQUEST: 'border-slate-200 bg-slate-50 text-slate-700',
  VERIFIED: 'border-slate-200 bg-slate-50 text-slate-800',
  ON_BIDS: 'border-amber-200 bg-amber-50 text-amber-800',
  REJECTED: 'border-red-200 bg-red-50 text-red-800',
  COMPLETED: 'border-slate-300 bg-slate-100 text-slate-800',
};

const formatDate = (s: string) =>
  new Date(s).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function OwnProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const qc = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImg, setSelectedImg] = useState(0);
  const coverRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<HTMLInputElement>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ['own-product', id],
    queryFn: () => ownService.getProduct(id!),
    enabled: !!id,
  });

  // Edit form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<'NEW' | 'PRELOVED'>('NEW');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const startEdit = () => {
    if (!product) return;
    setName(product.name);
    setDescription(product.description ?? '');
    setCondition(product.condition);
    setCoverFile(null);
    setImageFiles([]);
    setIsEditing(true);
  };

  const { mutate: updateProduct, isPending: isUpdating } = useMutation({
    mutationFn: async () => {
      const image_paths = imageFiles.length > 0
        ? await Promise.all(imageFiles.map((f) => ownService.uploadFile(f)))
        : (product?.image_links ?? []);
      const cover_image_path = coverFile
        ? await ownService.uploadFile(coverFile)
        : product?.cover_image_link;
      return ownService.updateProduct(id!, {
        name,
        description: description || undefined,
        condition,
        weight_gram: product?.weight_gram ?? 0,
        image_paths,
        cover_image_path,
      });
    },
    onSuccess: (res) => {
      showToast(res.message || 'Product updated!', ToastType.SUCCESS);
      setIsEditing(false);
      qc.invalidateQueries({ queryKey: ['own-product', id] });
    },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed to update product', ToastType.ERROR),
  });

  const { mutate: requestReview, isPending: isRequesting } = useMutation({
    mutationFn: () => ownService.requestProductReview(id!),
    onSuccess: (res) => {
      showToast(res.message || 'Review requested!', ToastType.SUCCESS);
      qc.invalidateQueries({ queryKey: ['own-product', id] });
    },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed to request review', ToastType.ERROR),
  });

  if (isLoading) return (
    <main className="bidify-page-narrow">
      <div className="animate-pulse space-y-6">
        <div className="h-5 w-32 bg-slate-100 rounded-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-square bg-slate-100 rounded-3xl" />
          <div className="space-y-3">
            <div className="h-7 bg-slate-100 rounded-xl w-3/4" />
            <div className="h-5 bg-slate-100 rounded-xl w-1/2" />
            <div className="h-24 bg-slate-100 rounded-2xl" />
          </div>
        </div>
      </div>
    </main>
  );
  if (!product) return <div className="text-center py-20 text-slate-400">Product not found.</div>;

  const images = [product.cover_image_link, ...(product.image_links ?? [])].filter(Boolean) as string[];
  const canRequestReview = product.status === 'DRAFT' || product.status === 'REJECTED';

  return (
    <main className="bidify-page-narrow">
      {/* Breadcrumb */}
      <button onClick={() => navigate('/own/products')} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" /> My Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] gap-8">
        {/* Images */}
        <div className="space-y-3">
          <div className="rounded-lg overflow-hidden bg-slate-50 border border-slate-200 aspect-square shadow-sm">
            {images[selectedImg] ? (
              <img src={images[selectedImg]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <ImageOff className="h-12 w-12 text-slate-300" />
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
                  className={`h-16 w-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    i === selectedImg ? 'border-slate-900 ring-2 ring-slate-200' : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          {!isEditing ? (
            <>
              <div>
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[product.status]}`}>
                  {product.status}
                </span>
                <h1 className="text-2xl font-bold text-slate-900 mt-3">{product.name}</h1>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{product.condition}</p>
              </div>
              {product.description && <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-600 text-sm leading-relaxed">{product.description}</p>}

              <div className="flex gap-3 flex-wrap">
                {canRequestReview && (
                  <>
                    <button onClick={startEdit}
                      className="bidify-secondary">
                      <Edit3 className="h-4 w-4" /> Edit
                    </button>
                    <button onClick={() => requestReview()} disabled={isRequesting}
                      className="bidify-primary">
                      {isRequesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {isRequesting ? 'Requesting...' : product.status === 'REJECTED' ? 'Request Review Again' : 'Request Review'}
                    </button>
                  </>
                )}
              </div>

              {/* History */}
              {product.status_histories && product.status_histories.length > 0 && (
                <div className="bidify-panel overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700">Status History</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {product.status_histories.map((h) => (
                      <div key={h.id} className="flex items-start gap-3 px-4 py-3">
                        <span className={`mt-0.5 rounded-full border px-2 py-0.5 text-xs font-semibold flex-shrink-0 ${statusStyles[h.status] ?? 'border-slate-200 bg-slate-100 text-slate-600'}`}>{h.status}</span>
                        <div className="flex-1 min-w-0">
                          {h.message && <p className="text-sm text-slate-600">{h.message}</p>}
                          <p className="text-xs text-slate-400 mt-0.5">{formatDate(h.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Edit Form */
            <div className="space-y-4">
              <h2 className="text-base font-bold flex items-center gap-2 text-slate-800"><Edit3 className="h-4 w-4 text-slate-500" /> Edit Product</h2>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Condition</label>
                <Select value={condition} onValueChange={(v) => setCondition(v as 'NEW' | 'PRELOVED')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="PRELOVED">Preloved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Replace Cover Image</label>
                <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
                <button type="button" onClick={() => coverRef.current?.click()}
                  className={`w-full flex items-center justify-center gap-2 border border-dashed rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    coverFile ? 'border-slate-400 bg-slate-50 text-slate-800' : 'border-slate-300 text-slate-500 hover:border-slate-400'
                  }`}>
                  <Upload className="h-4 w-4" /> {coverFile ? coverFile.name : 'Choose new cover (optional)'}
                </button>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Replace Images</label>
                <input ref={imagesRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => setImageFiles(Array.from(e.target.files ?? []))} />
                <button type="button" onClick={() => imagesRef.current?.click()}
                  className={`w-full flex items-center justify-center gap-2 border border-dashed rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    imageFiles.length > 0 ? 'border-slate-400 bg-slate-50 text-slate-800' : 'border-slate-300 text-slate-500 hover:border-slate-400'
                  }`}>
                  <Upload className="h-4 w-4" /> {imageFiles.length > 0 ? `${imageFiles.length} selected` : 'Choose images (optional)'}
                </button>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5">
                  <X className="h-4 w-4" /> Cancel
                </button>
                <button disabled={isUpdating} onClick={() => updateProduct()}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold rounded transition-colors flex items-center justify-center gap-1.5 text-sm">
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
