import { useState, type JSX } from "react";
import Button from "../../../components/button";
import FilterButton from "../components/filter-button";
import ProductCard from "../components/product-card";
import { ProductCondition, ProductStatus } from "../../../enums/product-enum";

export default function ProductPage() {
    return <>
        <main className="flex w-full justify-center mt-10">
            <div className="flex flex-col sm:flex-row max-w-7xl w-full sm:space-x-10">
                <ProductListSection />
                <ProductListInformationSection />
            </div>
            <CreateProductPopup />
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
function ProductListSection(): JSX.Element {
    const [activeStatusFilter, setActiveStatusFilter] = useState<ProductStatus | "ALL">("ALL");
    const handleFilterClick = (filterText: ProductStatus | "ALL") => {
        setActiveStatusFilter(filterText);
    };
    return <>
        <div className="bg-white w-full shadow-sm sm:w-2/3 p-5 relative z-0">
            <div className="flex flex-wrap sm:flex-nowrap justify-between">
                <div className="flex-col space-y-2">
                    <h1 className="text-black font-bold text-4xl">My Products</h1>
                    <h3 className="text-gray-600">Submit, manage, and track the status of your auction items here.</h3>
                </div>
                <Button className="mt-2">
                    <div className="flex justify-center text-xs md:text-sm items-center w-full">
                        + Submit Auction Item
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
                    <label htmlFor="sortOrder" className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort By:</label>
                    <select id="sortOrder" name="sortOrder" className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        <option value="terbaru">Newest</option>
                        <option value="harga-terendah">Highest Price</option>
                        <option value="harga-tertinggi">Lowest Price</option>
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

function ProductListInformationSection() {
    return <aside className="flex-col w-full sm:w-1/3 space-y-5">
        <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Product Summary</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total Submitted Products</span>
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Selling Tips</h3>
            <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    <span>Use product photos with good lighting and from multiple angles.</span>
                </li>
                <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    <span>rite an honest and detailed description, including any defects in the item.</span>
                </li>
                <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"></path></svg>
                    <span>Set a competitive starting price to attract more bidders.</span>
                </li>
            </ul>
        </div>
    </aside>;
}

function CreateProductPopup() {
    return <>
        <div id="successToast" className="fixed bottom-5 right-5 bg-green-500 text-white py-3 px-5 rounded-lg shadow-xl hidden flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>Product successfully created!</span>
        </div>

        <div id="addProductModal" className="fixed flex inset-0 bg-black bg-opacity-50 items-start sm:items-center hidden justify-center p-4 z-50">
            <div className="bg-white overflow-y-scroll max-h-[90vh] rounded-lg shadow-xl w-full max-w-lg p-6 relative transform transition-all opacity-100 scale-95" id="modalContent">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Product To Be Auction</h2>
                <button id="closeModalBtn" className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">Product Name</label>
                        <input type="text" id="itemName" name="itemName" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" name="description" rows={3} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                        <select id="category" name="category" required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            <option>New</option>
                            <option>Preloved</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cover Image (Cover)</label>
                        <div id="coverImagePreviewContainer" className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div id="coverImagePlaceholder" className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="coverImage" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                        <span>Upload File</span>
                                        <input id="coverImage" name="coverImage" type="file" className="sr-only" accept="image/*" required />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF hingga 10MB</p>
                            </div>
                            <img id="coverImagePreview" src="" alt="Cover Image Preview" className="hidden h-32 w-32 object-cover rounded-md" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="detailImages" className="block text-sm font-medium text-gray-700">Product Detail Image (Opsional, maks. 4)</label>
                        <input id="detailImages" name="detailImages" type="file" multiple className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" accept="image/*" />
                        <div id="detailImagesPreviewContainer" className="mt-2 grid grid-cols-4 gap-2">
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" id="cancelBtn" className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                        Cancel
                    </button>
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none">
                        Request
                    </button>
                </div>
            </div>
        </div>
    </>
}