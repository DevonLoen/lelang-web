import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Gavel, Package, Wallet, MapPin, Menu, X as XIcon, CreditCard, ChevronDown } from 'lucide-react';
import Logo from '../assets/logo.png';
import { Link, useNavigate, useLocation } from 'react-router';
import { AuthService } from '../features/auth/services/auth.service';
import { useToast } from '../contexts/toast-context';
import { ToastType } from '../enums/toast-type';
import { useProfile } from '../features/own/hooks/use-profile';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { data: user } = useProfile();

  const isSuperAdmin = user?.roles?.some((r) => r.role === 'SUPERADMIN') ?? false;
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

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await new AuthService().logout();
    showToast('Logged out successfully', ToastType.SUCCESS);
    navigate('/login');
  };

  const navLinks = [
    { to: '/auctions', label: 'Browse Auctions' },
    ...(isSuperAdmin || isSeller ? [{ to: '/own/auctions', label: 'My Auctions' }] : []),
    ...(isSuperAdmin || isBidder ? [{ to: '/own/bids', label: 'My Bids' }] : []),
    ...(isSuperAdmin || isSeller ? [{ to: '/own/products', label: 'My Products' }] : []),
  ];

  const isActiveLink = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/auctions" className="flex items-center gap-2.5 flex-shrink-0">
          <img src={Logo} alt="Auction" className="h-9 w-9" />
          <span className="font-bold text-slate-900 text-lg hidden sm:block">AUCTION</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActiveLink(link.to)
                  ? 'bg-amber-50 text-amber-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((o) => !o)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                profileOpen
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                <User className="h-4 w-4 text-amber-600" />
              </div>
              <span className="hidden sm:block max-w-[100px] truncate">
                {user?.fullname?.split(' ')[0] || 'Profile'}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.fullname || 'User'}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.phone || ''}</p>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="h-4 w-4 text-slate-400" /> My Profile
                  </Link>
                  {(isSuperAdmin || isSeller) && (
                    <>
                      <Link
                        to="/own/products"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Package className="h-4 w-4 text-slate-400" /> My Products
                      </Link>
                      <Link
                        to="/own/auctions"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Gavel className="h-4 w-4 text-slate-400" /> My Auctions
                      </Link>
                    </>
                  )}
                  {(isSuperAdmin || isBidder) && (
                    <>
                      <Link
                        to="/own/bids"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Gavel className="h-4 w-4 text-slate-400" /> My Bids
                      </Link>
                      <Link
                        to="/own/payments"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <CreditCard className="h-4 w-4 text-slate-400" /> My Payments
                      </Link>
                    </>
                  )}
                  <Link
                    to="/own/withdrawal"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Wallet className="h-4 w-4 text-slate-400" /> Withdrawal
                  </Link>
                  <Link
                    to="/own/addresses"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-slate-400" /> My Addresses
                  </Link>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <XIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {menuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 md:hidden z-40" 
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-200 md:hidden z-50 shadow-lg">
            <nav className="py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-4 py-3 text-sm font-medium transition-colors ${
                    isActiveLink(link.to)
                      ? 'bg-amber-50 text-amber-600'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
