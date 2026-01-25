import { Link } from 'react-router';
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
  DRAFT: 'bg-gray-100 text-gray-800',
  REQUEST: 'bg-sky-100 text-sky-800',
  VERIFIED: 'bg-indigo-100 text-indigo-800',
  ON_BIDS: 'bg-orange-100 text-orange-800',
  REJECTED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

function ProductCard({ product }: ProductCardProps) {
  const { coverImageUrl: imageUrl, status, condition: category, name: title, startingPrice: price } = product;

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
  return (
    <Link to={`/my-product/${product.id}`}>
      <div className="group bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        <div className="relative">
          <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
          <div
            className={`absolute top-2 right-2 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
              statusStyles[status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            <span>{status}</span>
          </div>
        </div>
        <div className="p-5">
          <span className="text-xs font-semibold text-indigo-600 uppercase">{category}</span>
          <h3 className="text-lg font-bold text-gray-800 mt-1 truncate group-hover:text-indigo-600 transition-colors">{title}</h3>
          <p className="text-sm text-gray-500 mt-2">Starting Price:</p>
          <p className="text-xl font-bold text-gray-900">{formattedPrice}</p>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
