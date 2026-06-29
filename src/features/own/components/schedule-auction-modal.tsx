import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Gavel, X } from 'lucide-react';
import { DateTimePicker, toLocalDateTimeInputValue } from '@/components/date-time-picker';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/contexts/toast-context';
import { ToastType } from '@/enums/toast-type';
import { ownService } from '../services/own.service';
import type { ProductResponse } from '../../auction/services/auction.schema';

const getMinimumScheduleTime = () => {
  const next = new Date(Date.now() + 5 * 60 * 1000);
  next.setSeconds(0, 0);
  return toLocalDateTimeInputValue(next);
};

interface ScheduleAuctionModalProps {
  onClose: () => void;
  initialProduct?: Pick<ProductResponse, 'id' | 'name'>;
}

export function ScheduleAuctionModal({ onClose, initialProduct }: ScheduleAuctionModalProps) {
  const { showToast } = useToast();
  const qc = useQueryClient();
  const [productId, setProductId] = useState(initialProduct ? String(initialProduct.id) : '');
  const [startingPrice, setStartingPrice] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [formError, setFormError] = useState('');
  const minScheduleTime = getMinimumScheduleTime();

  const { data: productsData } = useQuery({
    queryKey: ['own-products-verified'],
    queryFn: () => ownService.listProducts({ status: 'VERIFIED', limit: 100 }),
    enabled: !initialProduct,
  });
  const verifiedProducts: Pick<ProductResponse, 'id' | 'name'>[] = initialProduct
    ? [initialProduct]
    : (productsData?.nodes ?? []);

  const { mutate: create, isPending } = useMutation({
    mutationFn: () =>
      ownService.createAuction({
        product_id: Number(productId),
        starting_price: Number(startingPrice),
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
      }),
    onSuccess: (res) => {
      showToast(res.message || 'Auction created!', ToastType.SUCCESS);
      qc.invalidateQueries({ queryKey: ['own-auctions'] });
      qc.invalidateQueries({ queryKey: ['own-products'] });
      qc.invalidateQueries({ queryKey: ['own-products-summary'] });
      qc.invalidateQueries({ queryKey: ['own-products-verified'] });
      qc.invalidateQueries({ queryKey: ['own-product', productId] });
      if (res.data.product) {
        qc.setQueryData(['own-product', productId], res.data.product);
      }
      onClose();
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : 'Failed to schedule auction';
      showToast(message, ToastType.ERROR);
      setFormError(message);
      qc.invalidateQueries({ queryKey: ['own-auctions'] });
      qc.invalidateQueries({ queryKey: ['own-products'] });
      qc.invalidateQueries({ queryKey: ['own-products-summary'] });
      qc.invalidateQueries({ queryKey: ['own-products-verified'] });
      qc.invalidateQueries({ queryKey: ['own-product', productId] });

      if (message.toLowerCase().includes('sudah memiliki lelang terjadwal')) {
        onClose();
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!productId) {
      setFormError('Select a verified product first.');
      return;
    }
    if (!startingPrice || Number(startingPrice) <= 0) {
      setFormError('Starting price must be greater than zero.');
      return;
    }
    if (!startTime || !endTime) {
      setFormError('Choose both start and end time.');
      return;
    }
    if (new Date(startTime).getTime() < new Date(minScheduleTime).getTime()) {
      setFormError('Start time must be at least five minutes from now.');
      return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
      setFormError('End time must be after start time.');
      return;
    }
    create();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Gavel className="h-5 w-5 text-slate-700" /> Schedule Auction
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close schedule auction form">
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Product (Verified) *</label>
            <Select value={productId} onValueChange={setProductId} disabled={!!initialProduct}>
              <SelectTrigger><SelectValue placeholder="Select a verified product" /></SelectTrigger>
              <SelectContent>
                {verifiedProducts.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-slate-400">No verified products found</div>
                ) : verifiedProducts.map((product) => (
                  <SelectItem key={product.id} value={String(product.id)}>{product.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Starting Price (IDR) *</label>
            <Input
              type="text"
              inputMode="numeric"
              value={startingPrice ? Number(startingPrice).toLocaleString('id-ID') : ''}
              onChange={(event) => setStartingPrice(event.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 0"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Start Time *</label>
            <DateTimePicker label="Auction starts" value={startTime} onChange={setStartTime} minValue={minScheduleTime} helperText="Pick a start time at least five minutes from now." />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">End Time *</label>
            <DateTimePicker label="Auction ends" value={endTime} onChange={setEndTime} minValue={startTime || minScheduleTime} helperText="The end time must be after the start time." />
          </div>
          {formError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{formError}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={isPending} className="flex-1 rounded-lg bg-slate-900 py-2.5 font-bold text-white hover:bg-slate-800 disabled:opacity-60">
              {isPending ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
