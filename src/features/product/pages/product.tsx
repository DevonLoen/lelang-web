import { useState, type JSX } from 'react';
import { useProducts } from '../hooks/use-product-query';
import ProductCard from '../components/product-card';
import CreateProductPopup from './create-product';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus } from 'lucide-react';
import { ProductStatus } from '../services/product.schema';

import { ProductPagination } from '@/components/pagination';

const productStatusFilterOption: { text: string; value: ProductStatus | undefined }[] = [
  { text: 'All', value: undefined },
  { text: 'Request', value: ProductStatus.REQUEST },
  { text: 'Verified', value: ProductStatus.VERIFIED },
  { text: 'On Bids', value: ProductStatus.ON_BIDS },
  { text: 'Rejected', value: ProductStatus.REJECTED },
];

export default function ProductPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <CreateProductPopup isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <main className="bidify-page">
        <div className="flex flex-col lg:flex-row max-w-7xl w-full gap-10">
          <ProductListSection onOpenModal={() => setIsModalOpen(true)} />
          <ProductListInformationSection />
        </div>
      </main>
    </>
  );
}

function ProductListSection({ onOpenModal }: { onOpenModal: () => void }): JSX.Element {
  const [status, setStatus] = useState<ProductStatus | undefined>(undefined);

  const condition = undefined;
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useProducts(currentPage, 9, status, condition, filter);
  const products = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="w-full lg:w-2/3 space-y-8">
      {/* Header */}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="bidify-title">My Products</h1>
          <p className="bidify-subtitle">Submit, manage, and track the status of your auction items.</p>
        </div>

        <Button onClick={onOpenModal} className="shrink-0 rounded bg-slate-900 hover:bg-slate-800" size={'lg'}>
          <Plus className="mr-2 h-4 w-4" /> Submit Auction Item
        </Button>
      </div>
      <div className="bidify-panel p-1">
        <div className="flex flex-wrap sm:flex-nowrap gap-2 p-1 bg-secondary rounded-lg">
          {productStatusFilterOption.map((option) => (
            <Button
              className="flex-1"
              key={option.text}
              variant={status === option.value ? 'white' : 'ghost'}
              size="lg"
              onClick={() => {
                setStatus(option.value);
                setCurrentPage(1);
              }}
            >
              {option.text}
            </Button>
          ))}
        </div>
      </div>

      <div className="bidify-panel flex flex-col sm:flex-row gap-4 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your products..."
            className="pl-10 w-full"
            value={filter || ''}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
          <label className="text-sm font-medium text-gray-700">Sort By:</label>
          <Select defaultValue="newest">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Lowest Price</SelectItem>
              <SelectItem value="price-high">Highest Price</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-start justify-between border-t pt-6">
        {meta && <ProductPagination meta={meta} onPageChange={(newPage) => setCurrentPage(newPage)} />}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading
          ? Array(6)
              .fill(0)
              .map((_, i) => <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />)
          : products.map((p) => <ProductCard key={p.id} product={{ ...p, startingPrice: 5000 }} />)}
      </div>
    </div>
  );
}

function ProductListInformationSection() {
  return (
    <aside className="w-full lg:w-1/3 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg border-b pb-3">Product Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SummaryRow label="Total Product Submitted" count={6} />
          <SummaryRow label="Waiting" count={2} colorClass="bg-amber-500" textClass="text-amber-700" />
          <SummaryRow label="Approved" count={1} colorClass="bg-slate-500" textClass="text-slate-600" />
          <SummaryRow label="On Bids" count={2} colorClass="bg-slate-500" textClass="text-slate-700" />
          <SummaryRow label="Rejected" count={2} colorClass="bg-red-600" textClass="text-red-600" />
        </CardContent>
      </Card>

      <div className="bidify-panel p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Selling Tips</h3>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <span>Use product photos with good lighting and from multiple angles.</span>
          </li>
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              ></path>
            </svg>
            <span>Write an honest and detailed description, including any defects in the item.</span>
          </li>
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"
              ></path>
            </svg>
            <span>Set a competitive starting price to attract more bidders.</span>
          </li>
        </ul>
      </div>
    </aside>
  );
}

function SummaryRow({
  label,
  count,
  colorClass,
  textClass,
}: {
  label: string;
  count: number;
  colorClass?: string;
  textClass?: string;
}) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        {colorClass && <span className={`h-2 w-2 rounded-full ${colorClass}`} />} {label}
      </span>
      <span className={`font-bold ${textClass || 'text-black'}`}>{count}</span>
    </div>
  );
}
