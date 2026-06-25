import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ownService } from '../services/own.service';
import { useToast } from '../../../contexts/toast-context';
import { ToastType } from '../../../enums/toast-type';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router';
import {
  ArrowRight,
  BadgeDollarSign,
  Camera,
  ChevronLeft,
  ChevronRight,
  FileText,
  ImageOff,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import type { ProductResponse } from '../../auction/services/auction.schema';
import { ProductStatus } from '../../auction/services/auction.schema';

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  REQUEST: 'bg-slate-100 text-slate-700',
  VERIFIED: 'bg-slate-100 text-slate-800',
  ON_BIDS: 'bg-amber-100 text-amber-900',
  REJECTED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-slate-100 text-slate-800',
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

//  Create Product Modal 
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
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed to create product', ToastType.ERROR),
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
            <Select value={condition} onValueChange={(v) => setCondition(v as 'NEW' | 'PRELOVED')}>
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
                coverFile ? 'border-slate-300 bg-slate-50 text-slate-800' : 'border-slate-300 text-slate-500 hover:border-slate-400'
              }`}>
              <Upload className="h-4 w-4" /> {coverFile ? coverFile.name : 'Choose cover image'}
            </button>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Product Images *</label>
            <input ref={imagesRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => setImageFiles(Array.from(e.target.files ?? []))} />
            <button type="button" onClick={() => imagesRef.current?.click()}
              className={`w-full flex items-center justify-center gap-2 border border-dashed rounded-xl px-3 py-2.5 text-sm transition-colors ${
                imageFiles.length > 0 ? 'border-slate-300 bg-slate-50 text-slate-800' : 'border-slate-300 text-slate-500 hover:border-slate-400'
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
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors">
              {isPending ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

//  Product Card 
function OwnProductCard({ product }: { product: ProductResponse }) {
  return (
    <Link to={`/own/products/${product.id}`}>
      <div className="group bg-white rounded-lg border border-slate-100 shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
          <div className="relative h-44 bg-slate-50 overflow-hidden">
          {product.cover_image_link ? (
            <img src={product.cover_image_link} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <ImageOff className="h-8 w-8 text-slate-300" />
              <span className="text-xs text-slate-300">No image</span>
            </div>
          )}
          <span className={`absolute top-2 right-2 text-[10px] font-bold px-2.5 py-1 rounded ${statusStyles[product.status] ?? 'bg-gray-100'}`}>
            {product.status}
          </span>
        </div>
        <div className="p-4 flex flex-col gap-1 flex-1">
          <p className="text-[10px] font-bold text-slate-700 uppercase">{product.condition}</p>
          <h3 className="text-base font-semibold text-slate-900 truncate group-hover:text-slate-700 transition-colors">{product.name}</h3>
          {product.description && <p className="text-xs text-slate-500 line-clamp-2">{product.description}</p>}
          <div className="mt-auto pt-2 flex justify-end">
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}

//  Page 
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

  const { data: summaryData } = useQuery({
    queryKey: ['own-products-summary'],
    queryFn: () =>
      ownService.listProducts({
        limit: 100,
        sorts: [{ field: 'created_at', direction: 'desc' }],
      }),
  });

  const products = data?.nodes ?? [];
  const summaryProducts = summaryData?.nodes ?? products;
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);
  const productSummary = [
    { label: 'Request', value: summaryProducts.filter((product) => product.status === ProductStatus.REQUEST).length, tone: 'bg-amber-400' },
    { label: 'Verified', value: summaryProducts.filter((product) => product.status === ProductStatus.VERIFIED).length, tone: 'bg-slate-500' },
    { label: 'On Bids', value: summaryProducts.filter((product) => product.status === ProductStatus.ON_BIDS).length, tone: 'bg-slate-500' },
    { label: 'Rejected', value: summaryProducts.filter((product) => product.status === ProductStatus.REJECTED).length, tone: 'bg-red-500' },
  ];
  const totalSubmitted = summaryData?.total ?? summaryProducts.length;

  return (
    <>
      {isCreateOpen && <CreateProductModal onClose={() => setIsCreateOpen(false)} />}

      <main className="bidify-page">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="bidify-title">My Products</h1>
            <p className="bidify-subtitle">Submit products for review and manage auction-ready inventory.</p>
          </div>
          <button onClick={() => setIsCreateOpen(true)}
            className="bidify-primary">
            <Plus className="h-4 w-4" /> New Product
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <div className="bidify-panel mb-6 p-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search products..."
                  className="pl-9"
                />
              </div>
              <div className="mt-3 rounded bg-slate-200 p-1">
                <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-7">
                {STATUS_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => { setStatus(o.value); setPage(1); }}
                    className={`bidify-tab ${status === o.value ? 'bidify-tab-active' : ''}`}
                  >
                    {o.label}
                  </button>
                ))}
                </div>
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <button key={p} onClick={() => setPage(p)} className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${ p === page ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100' }`}>{p}</button>
                  );
                })}
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                  className="h-9 w-9 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <div className="bidify-panel p-5">
              <h2 className="text-base font-bold text-slate-900">Product Summary</h2>
              <div className="mt-4 space-y-3">
                {productSummary.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className={`h-2 w-2 rounded-full ${item.tone}`} />
                      {item.label}
                    </span>
                    <strong className="text-slate-900">{item.value}</strong>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                <span className="text-slate-500">Total Product Submitted</span>
                <strong className="text-slate-900">{totalSubmitted}</strong>
              </div>
            </div>

            <div className="bidify-panel p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-slate-700" />
                <h2 className="text-base font-bold text-slate-800">Selling Tips</h2>
              </div>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
                <p className="flex gap-3">
                  <Camera className="mt-1 h-4 w-4 flex-shrink-0 text-slate-500" />
                  Use product photos with good lighting and multiple angles.
                </p>
                <p className="flex gap-3">
                  <FileText className="mt-1 h-4 w-4 flex-shrink-0 text-slate-500" />
                  Write an honest, detailed description, including any defects.
                </p>
                <p className="flex gap-3">
                  <BadgeDollarSign className="mt-1 h-4 w-4 flex-shrink-0 text-slate-500" />
                  Set a competitive starting price to attract more bidders.
                </p>
                <p className="flex gap-3">
                  <ShieldCheck className="mt-1 h-4 w-4 flex-shrink-0 text-slate-500" />
                  Seller admin fee is 5% of the final winning bid after payment is created.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
