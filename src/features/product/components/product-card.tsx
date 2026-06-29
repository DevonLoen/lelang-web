import { Link } from 'react-router';
import { ImageOff } from 'lucide-react';
import type { ProductCondition, ProductStatus } from '../services/product.schema';

export interface IProductCard {
  id: string | number;
  coverImageUrl: string;
  name: string;
  condition: ProductCondition;
  status: ProductStatus;
  startingPrice: number;
}

export interface ProductCardProps {
  product: IProductCard;
}

const statusStyles: Record<ProductStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  REQUEST: 'bg-slate-50 text-slate-700',
  VERIFIED: 'bg-slate-50 text-slate-800',
  SCHEDULED: 'bg-indigo-50 text-indigo-800',
  ON_BIDS: 'bg-amber-50 text-amber-800',
  REJECTED: 'bg-red-50 text-red-700',
  COMPLETED: 'bg-slate-50 text-slate-800',
};

function ProductCard({ product }: ProductCardProps) {
  const { coverImageUrl: imageUrl, status, condition: category, name: title, startingPrice: price } = product;

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
  return (
    <Link to={`/my-product/${product.id}`} className="block">
      <div className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg hover:shadow-slate-950/10">
        <div className="relative h-48 bg-slate-100">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
              <ImageOff className="h-9 w-9" />
              <span className="text-xs font-medium">No image</span>
            </div>
          )}
          <div
            className={`absolute right-2.5 top-2.5 rounded-md px-2.5 py-1 text-[10px] font-bold capitalize shadow-sm ring-1 ring-white/70 ${
              statusStyles[status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            <span>{status}</span>
          </div>
        </div>
        <div className="p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">{category}</span>
          <h3 className="mt-1 truncate text-base font-semibold text-slate-950 transition-colors group-hover:text-slate-800">{title}</h3>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Starting Price</p>
          <p className="text-xl font-extrabold text-slate-800">{formattedPrice}</p>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
