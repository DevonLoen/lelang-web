import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Gavel, Package, Wallet, MapPin, Menu, X as XIcon, CreditCard } from 'lucide-react';
import Logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router';
import { AuthService } from '../features/auth/services/auth.service';
import { useToast } from '../contexts/toast-context';
import { ToastType } from '../enums/toast-type';
import { useProfile } from '../features/own/hooks/use-profile';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: user } = useProfile();

  const isSeller = user?.roles?.some((r) => r.role === 'SELLER') ?? false;
  const isBidder = user?.roles?.some((r) => r.role === 'BIDDER') ?? false;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await new AuthService().logout();
    showToast('Logged out successfully', ToastType.SUCCESS);
    navigate('/login');
  };

  const navLinks = [
    ...(isSeller ? [{ to: '/own/auctions', label: 'My Auctions' }] : []),
    ...(isBidder  ? [{ to: '/own/bids',     label: 'My Bids'     }] : []),
    ...(isSeller ? [{ to: '/own/products', label: 'My Products' }] : []),
  ];

  return (
    <div className="flex lg:justify-center h-20 bg-[rgb(30,41,59)] fixed w-full z-50 shadow-lg">
      <div className="grow-[2] ml-4 md:ml-10">
        <div className="flex space-x-2 md:space-x-8 h-full items-center">
          {/* Logo */}
          <Link to="/auctions" className="flex flex-shrink-0 items-center space-x-2">
            <img src={Logo} alt="Logo" className="h-12 w-12" />
            <h1 className="font-bold text-white tracking-wide">AUCTION</h1>
          </Link>

          {/* Desktop Nav */}
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md font-medium transition-colors hidden md:block text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center pr-4 md:pr-10 gap-3">
        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md hover:bg-slate-700 transition-colors"
          >
            <User className="h-4 w-4" />
            <span className="hidden md:block text-sm font-medium">Profile</span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
              <Link
                to="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <User className="h-3.5 w-3.5" /> My Profile
              </Link>
              {isSeller && (
                <>
                  <Link
                    to="/own/products"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <Package className="h-3.5 w-3.5" /> My Products
                  </Link>
                  <Link
                    to="/own/auctions"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <Gavel className="h-3.5 w-3.5" /> My Auctions
                  </Link>
                </>
              )}
              {isBidder && (
                <>
                  <Link
                    to="/own/bids"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <Gavel className="h-3.5 w-3.5" /> My Bids
                  </Link>
                  <Link
                    to="/own/payments"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <CreditCard className="h-3.5 w-3.5" /> My Payments
                  </Link>
                </>
              )}
              <Link
                  to="/own/withdrawal"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  <Wallet className="h-3.5 w-3.5" /> Withdrawal
                </Link>
              <Link
                to="/own/addresses"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5" /> My Addresses
              </Link>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-300 hover:text-white p-2 rounded-md"
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? <XIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="absolute top-20 left-0 right-0 bg-[rgb(30,41,59)] border-t border-slate-700 md:hidden z-40">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="block px-6 py-3 text-gray-300 hover:text-white hover:bg-slate-700 font-medium text-sm transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/profile"
            onClick={() => setMenuOpen(false)}
            className="block px-6 py-3 text-gray-300 hover:text-white hover:bg-slate-700 font-medium text-sm transition-colors"
          >
            Profile
          </Link>
          {isSeller && (
            <>
              <Link
                to="/own/products"
                onClick={() => setMenuOpen(false)}
                className="block px-6 py-3 text-gray-300 hover:text-white hover:bg-slate-700 font-medium text-sm transition-colors"
              >
                My Products
              </Link>
              <Link
                to="/own/auctions"
                onClick={() => setMenuOpen(false)}
                className="block px-6 py-3 text-gray-300 hover:text-white hover:bg-slate-700 font-medium text-sm transition-colors"
              >
                My Auctions
              </Link>
            </>
          )}
          {isBidder && (
            <>
              <Link
                to="/own/bids"
                onClick={() => setMenuOpen(false)}
                className="block px-6 py-3 text-gray-300 hover:text-white hover:bg-slate-700 font-medium text-sm transition-colors"
              >
                My Bids
              </Link>
              <Link
                to="/own/payments"
                onClick={() => setMenuOpen(false)}
                className="block px-6 py-3 text-gray-300 hover:text-white hover:bg-slate-700 font-medium text-sm transition-colors"
              >
                My Payments
              </Link>
            </>
          )}
          <Link
            to="/own/withdrawal"
            onClick={() => setMenuOpen(false)}
            className="block px-6 py-3 text-gray-300 hover:text-white hover:bg-slate-700 font-medium text-sm transition-colors"
          >
            Withdrawal
          </Link>
          <Link
            to="/own/addresses"
            onClick={() => setMenuOpen(false)}
            className="block px-6 py-3 text-gray-300 hover:text-white hover:bg-slate-700 font-medium text-sm transition-colors"
          >
            My Addresses
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-6 py-3 text-red-400 hover:text-red-300 hover:bg-slate-700 font-medium text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

