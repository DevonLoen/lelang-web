import { useState, type JSX } from "react";
import Button from "../../../components/button";
import FilterButton from "../components/filter-button";
import ProductCard from "../components/product-card";
import { ProductCondition, ProductStatus } from "../../../enums/product-enum";

export default function ProductPage() {
    return <>
        <main className="flex w-full justify-center mt-10">
            <div className="flex flex-col sm:flex-row max-w-7xl w-full sm:space-x-10">
                {ProductListPage()}
                {ProductListInformationPage()}
            </div>

        </main>
    </>
}
const productStatusFilterOption: { text: string, value: ProductStatus | "ALL" }[] = [
    { text: "All", value: "ALL" },
    { text: "Waiting", value: ProductStatus.REQUEST },
    { text: "Approved", value: ProductStatus.VERIFIED },
    { text: "On Bids", value: ProductStatus.ON_BIDS },
    { text: "Rejected", value: ProductStatus.REJECTED },
]
function ProductListPage(): JSX.Element {
    const [activeStatusFilter, setActiveStatusFilter] = useState<ProductStatus | "ALL">("ALL");
    const handleFilterClick = (filterText: ProductStatus | "ALL") => {
        setActiveStatusFilter(filterText);
    };
    return <>
        <div className="bg-white w-full shadow-sm sm:w-2/3 p-5 relative z-0">
            <div className="flex flex-wrap sm:flex-nowrap justify-between">
                <div className="flex-col space-y-2">
                    <h1 className="text-black font-bold text-4xl">Produk Saya</h1>
                    <h3 className="text-gray-600">Ajukan, kelola, dan pantau status barang lelang Anda di sini.</h3>
                </div>
                <Button className="mt-2">
                    <div className="flex justify-center text-xs md:text-sm items-center w-full">
                        + Ajukan Barang Lelang
                    </div>
                </Button>
            </div>
            <hr className="my-8 h-px border-0 bg-gray-200" />
            <div className="flex flex-wrap sm:flex-nowrap gap-2 border rounded-lg p-1 bg-gray-100 mb-6 mt-2">
                {productStatusFilterOption.map(option => {
                    return <FilterButton key={option.text} isActive={activeStatusFilter === option.value} onClick={() => handleFilterClick(option.value)}>
                        {option.text}
                    </FilterButton>
                })}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <div className="relative w-full sm:max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input type="text" id="searchBar" placeholder="Cari produk Anda..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label htmlFor="sortOrder" className="text-sm font-medium text-gray-700 whitespace-nowrap">Urutkan:</label>
                    <select id="sortOrder" name="sortOrder" className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        <option value="terbaru">Terbaru</option>
                        <option value="harga-terendah">Harga Terendah</option>
                        <option value="harga-tertinggi">Harga Tertinggi</option>
                    </select>
                </div>
            </div>
            <div id="productGrid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <ProductCard product={{ id: 1, coverImageUrl: "https://placehold.co/600x400/dbeafe/333?text=Gitar+Akustik", status: ProductStatus.COMPLETED, condition: ProductCondition.NEW, name: 'Gitar Akustik Klasik', startingPrice: 200000 }} />
                <ProductCard product={{ id: 2, coverImageUrl: "https://placehold.co/600x400/dbeafe/333?text=Gitar+Akustik", status: ProductStatus.REJECTED, condition: ProductCondition.NEW, name: 'Gitar Akustik Klasik', startingPrice: 200000 }} />
                <ProductCard product={{ id: 3, coverImageUrl: "https://placehold.co/600x400/dbeafe/333?text=Gitar+Akustik", status: ProductStatus.VERIFIED, condition: ProductCondition.NEW, name: 'Gitar Akustik Klasik', startingPrice: 200000 }} />
            </div>
        </div>
    </>
}

function ProductListInformationPage() {
    return <aside className="flex-col w-full sm:w-1/3 space-y-5">
        <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Ringkasan Produk</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total Produk Diajukan</span>
                    <span id="total-count" className="font-bold text-gray-900">6</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-yellow-500"></span> Menunggu
                    </span>
                    <span id="menunggu-count" className="font-bold text-yellow-600">2</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span> Disetujui
                    </span>
                    <span id="disetujui-count" className="font-bold text-blue-600">1</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span> Dilelang
                    </span>
                    <span id="dilelang-count" className="font-bold text-green-600">2</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500"></span> Ditolak
                    </span>
                    <span id="ditolak-count" className="font-bold text-red-600">1</span>
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tips Berjualan</h3>
            <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    <span>Gunakan foto produk dengan pencahayaan yang baik dan dari berbagai sudut.</span>
                </li>
                <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    <span>Tulis deskripsi yang jujur dan detail, termasuk jika ada kekurangan pada barang.</span>
                </li>
                <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"></path></svg>
                    <span>Atur harga awal yang kompetitif untuk menarik lebih banyak penawar.</span>
                </li>
            </ul>
        </div>
    </aside>;
}

