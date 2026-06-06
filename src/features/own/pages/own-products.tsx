import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ownService } from '../services/own.service';
import { useToast } from '../../../contexts/toast-context';
import { ToastType } from '../../../enums/toast-type';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router';
import { Plus, Search, ChevronLeft, ChevronRight, ArrowRight, Upload, X, ImageOff, Package } from 'lucide-react';
import type { ProductResponse } from '../../auction/services/auction.schema';
import { ProductStatus } from '../../auction/services/auction.schema';

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  REQUEST: 'bg-sky-100 text-sky-800',
  VERIFIED: 'bg-indigo-100 text-indigo-800',
  ON_BIDS: 'bg-orange-100 text-orange-800',
  REJECTED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Draft', value: ProductStatus.DRAFT },
  { label: 'Request', value: ProductStatus.REQUEST },
  { label: 'Verified', value: ProductStatus.VERIFIED },
  { label: 'Rejected', value: ProductStatus.REJECTED },
  { label: 'On Bids', value: ProductStatus.ON_BIDS },
  { label: 'Completed', value: ProductStatus.COMPLETED },
];

// ─── Create Product Modal ───────────────────────────────────────────────────
function CreateProductModal({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<'NEW' | 'PRELOVED'>('NEW');
  const [weightGram, setWeightGram] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const coverRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<HTMLInputElement>(null);

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async () => {
      const image_paths: string[] = await Promise.all(imageFiles.map((f) => ownService.uploadFile(f)));
      const cover_image_path = coverFile ? await ownService.uploadFile(coverFile) : undefined;
      return ownService.createProduct({ name, description: description || undefined, condition, weight_gram: Number(weightGram), image_paths, cover_image_path });
    },
    onSuccess: (res) => {
      showToast(res.message || 'Product created!', ToastType.SUCCESS);
      qc.invalidateQueries({ queryKey: ['own-products'] });
      onClose();
    },
    onError: (e: any) => showToast(e.message, ToastType.ERROR),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return showToast('Name is required', ToastType.ERROR);
    if (!weightGram || Number(weightGram) <= 0) return showToast('Weight is required', ToastType.ERROR);
    if (imageFiles.length === 0) return showToast('At least one image is required', ToastType.ERROR);
    submit();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">New Product</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe your product..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Weight (grams) *</label>
            <Input
              type="number"
              min={1}
              value={weightGram}
              onChange={(e) => setWeightGram(e.target.value)}
              placeholder="e.g. 1000 for 1 kg"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Condition *</label>
            <Select value={condition} onValueChange={(v) => setCondition(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="PRELOVED">Preloved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Cover Image</label>
            <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
            <button type="button" onClick={() => coverRef.current?.click()}
              className={`w-full flex items-center justify-center gap-2 border border-dashed rounded-xl px-3 py-2.5 text-sm transition-colors ${
                coverFile ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-300 text-slate-500 hover:border-indigo-400'
              }`}>
              <Upload className="h-4 w-4" /> {coverFile ? coverFile.name : 'Choose cover image'}
            </button>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Product Images *</label>
            <input ref={imagesRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => setImageFiles(Array.from(e.target.files ?? []))} />
            <button type="button" onClick={() => imagesRef.current?.click()}
              className={`w-full flex items-center justify-center gap-2 border border-dashed rounded-xl px-3 py-2.5 text-sm transition-colors ${
                imageFiles.length > 0 ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-300 text-slate-500 hover:border-indigo-400'
              }`}>
              <Upload className="h-4 w-4" /> {imageFiles.length > 0 ? `${imageFiles.length} image(s) selected` : 'Choose images'}
            </button>
            {imageFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {imageFiles.map((f, i) => (
                  <span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600 truncate max-w-[140px]">{f.name}</span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isPending}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors">
              {isPending ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Product Card ───────────────────────────────────────────────────────────
function OwnProductCard({ product }: { product: ProductResponse }) {
  return (
    <Link to={`/own/products/${product.id}`}>
      <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
          <div className="relative h-44 bg-slate-50 overflow-hidden">
          {product.cover_image_link ? (
            <img src={product.cover_image_link} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <ImageOff className="h-8 w-8 text-slate-300" />
              <span className="text-xs text-slate-300">No image</span>
            </div>
          )}
          <span className={`absolute top-2 right-2 text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[product.status] ?? 'bg-gray-100'}`}>
            {product.status}
          </span>
        </div>
        <div className="p-4 flex flex-col gap-1 flex-1">
          <p className="text-xs font-semibold text-indigo-600 uppercase">{product.condition}</p>
          <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{product.name}</h3>
          {product.description && <p className="text-xs text-slate-500 line-clamp-2">{product.description}</p>}
          <div className="mt-auto pt-2 flex justify-end">
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function OwnProductsPage() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const limit = 12;

  const { data, isLoading } = useQuery({
    queryKey: ['own-products', status, search, page],
    queryFn: () =>
      ownService.listProducts({
        page,
        limit,
        ...(status ? { status } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
        sorts: [{ field: 'created_at', direction: 'desc' }],
      }),
  });

  const products = data?.nodes ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <>
      {isCreateOpen && <CreateProductModal onClose={() => setIsCreateOpen(false)} />}

      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Products</h1>
            <p className="text-slate-500 mt-1">Submit and manage your auction items.</p>
          </div>
          <button onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl transition-colors">
            <Plus className="h-4 w-4" /> New Product
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => { setStatus(o.value); setPage(1); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  status === o.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-44 bg-slate-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-base font-medium">No products found</p>
            <p className="text-sm mt-1">Create your first product to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => <OwnProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="h-9 w-9 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              return (
                <button key={p} onClick={() => setPage(p)} className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${ p === page ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100' }`}>{p}</button>
              );
            })}
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
              className="h-9 w-9 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>
    </>
  );
}
