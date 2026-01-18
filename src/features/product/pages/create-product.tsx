import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductFormSchema, type ProductFormData, ProductCondition } from '../services/product.schema';
import { useCreateProduct } from '../hooks/use-product-mutation';
import { useEffect, useState } from 'react';

export default function CreateProductPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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

  const { mutate, isPending } = useCreateProduct(onClose);

  const coverFile = watch('coverImageUrl') as unknown as File | undefined;
  const detailFiles = watch('imageUrls') as unknown as File[] | undefined;

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [detailPreviews, setDetailPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (coverFile instanceof File) {
      const objectUrl = URL.createObjectURL(coverFile);
      setCoverPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setCoverPreview(null);
    }
  }, [coverFile]);

  useEffect(() => {
    if (detailFiles && detailFiles.length > 0) {
      const objectUrls = Array.from(detailFiles).map((file) => URL.createObjectURL(file));
      setDetailPreviews(objectUrls);
      return () => objectUrls.forEach((url) => URL.revokeObjectURL(url));
    } else {
      setDetailPreviews([]);
    }
  }, [detailFiles]);
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, name: 'coverImageUrl' | 'imageUrls') => {
    const files = e.target.files;
    if (!files) return;
    if (name === 'coverImageUrl') setValue(name, files[0]);
    else setValue(name, Array.from(files));
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        id="successToast"
        className="fixed bottom-5 right-5 bg-green-500 text-white py-3 px-5 rounded-lg shadow-xl hidden flex items-center gap-3"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span>Product successfully created!</span>
      </div>

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <form
          onSubmit={handleSubmit((data) => mutate(data))}
          className="bg-white rounded-lg p-6 w-full max-w-lg overflow-y-auto max-h-[90vh]"
        >
          <h2 className="text-2xl font-bold mb-4">Request Product To Be Auction</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Product Name
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={3}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              ></textarea>
            </div>
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
                Condition
              </label>
              <select
                {...register('condition')}
                id="condition"
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value={'NEW'}>New</option>
                <option value={'PRELOVED'}>Preloved</option>
              </select>
            </div>

            {/* Cover Image Preview Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Cover Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative">
                {coverPreview ? (
                  <div className="relative">
                    <img src={coverPreview} alt="Preview" className="h-32 w-32 object-cover rounded-md" />
                    <button
                      type="button"
                      onClick={() => setValue('coverImageUrl', undefined as any)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="coverImage"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        <span>Upload File</span>
                        <input
                          id="coverImage"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={(e) => onFileChange(e, 'coverImageUrl')}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Detail Images Preview Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Detail Images (Max 4)</label>
              <input
                multiple
                type="file"
                accept="image/*"
                onChange={(e) => onFileChange(e, 'imageUrls')}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-600"
              />
              <div className="mt-2 grid grid-cols-4 gap-2">
                {detailPreviews.map((url, index) => (
                  <img key={index} src={url} alt={`Detail ${index}`} className="h-20 w-20 object-cover rounded-md border" />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="bg-indigo-600 text-white px-4 py-2 rounded">
              {isPending ? 'Processing...' : 'Request Auction'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
