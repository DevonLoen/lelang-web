
export default function ProductDetail() {
    return <>
        <main className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm">
                <div className="mb-6 text-sm text-gray-500">
                    <a href="index.html" className="hover:text-indigo-600">Produk Saya</a>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-gray-800">Detail Produk</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    <div>
                        <div className="mb-4">
                            <img id="mainImage" src="https://placehold.co/600x400/e2e8f0/333?text=Jam+Tangan" alt="Jam Tangan Antik" className="w-full h-auto rounded-lg shadow-md object-cover aspect-square" />
                        </div>
                        <div id="thumbnailContainer" className="grid grid-cols-5 gap-2">
                            <img src="https://placehold.co/600x400/e2e8f0/333?text=Jam+Tangan" alt="Thumbnail 1" className="thumbnail-active cursor-pointer w-full h-auto rounded-md border-2 object-cover aspect-square opacity-60 hover:opacity-100 transition" />
                            <img src="https://placehold.co/600x400/dbeafe/333?text=Detail+1" alt="Thumbnail 2" className="cursor-pointer w-full h-auto rounded-md border-2 border-transparent object-cover aspect-square opacity-60 hover:opacity-100 transition" />
                            <img src="https://placehold.co/600x400/bfdbfe/333?text=Detail+2" alt="Thumbnail 3" className="cursor-pointer w-full h-auto rounded-md border-2 border-transparent object-cover aspect-square opacity-60 hover:opacity-100 transition" />
                            <img src="https://placehold.co/600x400/fecaca/333?text=Detail+3" alt="Thumbnail 4" className="cursor-pointer w-full h-auto rounded-md border-2 border-transparent object-cover aspect-square opacity-60 hover:opacity-100 transition" />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <div>
                            <span className="text-sm font-semibold text-indigo-600 uppercase">Koleksi & Hobi</span>
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mt-2">Jam Tangan Antik</h1>

                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-gray-500">Status:</span>
                                <div className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <span>Dilelang</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <p className="text-sm text-gray-500">Harga Awal:</p>
                                <p className="text-4xl font-bold text-gray-900">Rp 1.500.000</p>
                            </div>
                        </div>

                        <div className="mt-8 border-t pt-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">Deskripsi Produk</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Ini adalah jam tangan antik warisan dari era 1950-an. Kondisi masih sangat baik dengan sedikit tanda pemakaian yang wajar. Mesin otomatis berjalan dengan akurat. Tali kulit asli masih terpasang. Sebuah barang koleksi yang langka dan berharga bagi para penggemar horologi.
                            </p>
                        </div>

                        <div className="mt-auto pt-8 flex flex-col sm:flex-row gap-4">
                            <button className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 transition">
                                Mulai Lelang
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </>
}