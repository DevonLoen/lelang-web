import { useState } from 'react';
import { useParams } from 'react-router';
import { useProductDetail } from '../hooks/use-product-detail';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (id == null) return <h1>no id</h1>;
  const { data, isLoading } = useProductDetail(parseInt(id));

  if (isLoading) return <div className="text-center py-20">Loading...</div>;
  if (!data) return <div className="text-center py-20">Product not found.</div>;

  const allImages = [data.coverImageUrl, ...(data.imageUrls || [])];
  const currentImage = allImages[selectedImageIndex];

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
          <button className="absolute top-6 right-8 text-white text-5xl font-light hover:text-gray-300">&times;</button>
        </div>
      )}

      <main className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm">
          <div className="mb-6 text-sm text-gray-500">
            <a href="/" className="hover:text-indigo-600">
              Produk Saya
            </a>
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-800">Detail Produk</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <div className="mb-4 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                <img
                  src={currentImage}
                  alt={data.name}
                  className="w-full h-auto cursor-zoom-in object-cover aspect-square hover:scale-[1.02] transition-transform duration-300"
                  onClick={() => setIsLightboxOpen(true)}
                />
              </div>

              <div className="grid grid-cols-5 gap-3">
                {allImages.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-square ${
                      selectedImageIndex === index
                        ? 'border-indigo-600 ring-2 ring-indigo-100'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`View ${index}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex-1">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{data.condition}</span>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">{data.name}</h1>

                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-gray-500 font-medium">Status:</span>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">{data.status}</span>
                </div>

                <div className="mt-8 bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Harga Awal:</p>
                  <p className="text-3xl font-black text-gray-900">Rp 150.000</p>
                </div>

                <div className="mt-8">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Deskripsi</h2>
                  <p className="text-gray-600 leading-relaxed text-sm">{data.description || 'No description provided.'}</p>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-gray-100">
                <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-700 active:scale-[0.98] transition-all">
                  Mulai Lelang
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
