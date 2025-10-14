import { FaUser } from "react-icons/fa";
import Logo from "../assets/logo.png"

export default function Header() {
    return <>
        <div className="flex lg:justify-center h-20 bg-[rgb(30,41,59)] absolute sm:fixed w-full z-50">
            <div className="grow-[2] ml-10">
                <div className="flex space-x-12 h-full items-center">
                    <div className="flex flex-shrink-0 items-center space-x-2">
                        <img src={Logo} alt="Logo" className="h-14 w-14" />
                        <h1 className="font-bold text-white">AUCTION</h1>
                    </div>
                    <a className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md font-medium transition-colors hidden md:block ">Current Auctions</a>
                    <a className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md font-medium transition-colors hidden md:block">My Auction</a>
                    <a className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md font-medium transition-colors hidden md:block">My Bids</a>
                    <a className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md font-medium transition-colors hidden md:block">My Products</a>
                </div>
            </div>
            <div className="hidden md:block">
                <div className="flex h-full space-x-2 items-center justify-end lg:mr-20 hover:text-white group">
                    <FaUser className="h-4 w-5 text-gray-300 group-hover:text-white" />
                    <div className="text-gray-300 group-hover:text-white font-medium transition-colors">User Profile</div>
                </div>
            </div>
        </div>
    </>
}