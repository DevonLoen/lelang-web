import { FaUser } from "react-icons/fa";
import Logo from "../assets/logo.png"

export default function Header() {
    return <>
        <div className="flex justify-center bg-[#1E293B] h-16">
            <div className="w-1/2">
                <div className="flex space-x-12 h-full items-center">
                    <div className="flex items-center space-x-2">
                        <img src={Logo} alt="Logo" className="h-14 w-14" />
                        <h1 className="font-bold text-white">AUCTION</h1>
                    </div>
                    <div className="text-white">Current Auctions</div>
                    <div className="text-white">My Auction</div>
                    <div className="text-white">My Bids</div>
                    <div className="text-white">My Producs</div>
                </div>
            </div>
            <div className="w-1/4">
                <div className="flex h-full space-x-2 items-center w-full justify-end">
                    <FaUser className="h-4 w-5 text-white" />
                    <div className="text-white">User Profile</div>
                </div>
            </div>
        </div>
    </>
}