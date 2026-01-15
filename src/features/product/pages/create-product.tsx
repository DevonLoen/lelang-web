import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ProductFormSchema,
  type ProductFormData,
  ProductCondition,
} from '../services/product.schema';
import { useCreateProduct } from '../hooks/use-product-mutation';

export default function CreateProductPopup({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  // 1. Setup Form with Zod
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: { condition: ProductCondition.NEW, imageUrls: [] },
  });

  // 2. Setup Mutation
  const { mutate, isPending } = useCreateProduct(onClose);

  // 3. Handle Files manually for previews
  const coverFile = watch('coverImageUrl');
  const detailFiles = watch('imageUrls');

  const onFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: 'coverImageUrl' | 'imageUrls',
  ) => {
    const files = e.target.files;
    if (!files) return;
    if (name === 'coverImageUrl') setValue(name, files[0]);
    else setValue(name, Array.from(files));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit((data) => mutate(data))}
        className="bg-white rounded-lg p-6 w-full max-w-lg overflow-y-auto max-h-[90vh]"
      >
        <h2 className="text-2xl font-bold mb-4">Request Auction</h2>

        <div className="space-y-4">
          <input
            {...register('name')}
            placeholder="Product Name"
            className="w-full border p-2 rounded"
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}

          <textarea
            {...register('description')}
            placeholder="Description"
            className="w-full border p-2 rounded"
          />

          <select {...register('condition')} className="w-full border p-2 rounded">
            <option value="NEW">New</option>
            <option value="PRELOVED">Preloved</option>
          </select>

          {/* File Inputs */}
          <input type="file" onChange={(e) => onFileChange(e, 'coverImageUrl')} />
          <input type="file" multiple onChange={(e) => onFileChange(e, 'imageUrls')} />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            {isPending ? 'Processing...' : 'Request Auction'}
          </button>
        </div>
      </form>
    </div>
  );
}
