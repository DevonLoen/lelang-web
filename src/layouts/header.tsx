import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Gavel, Package, Wallet, MapPin, Menu, X as XIcon, CreditCard, ChevronDown, Bell } from 'lucide-react';
import LogoMark from '../assets/bidify-mark.svg';
import { Link, useNavigate, useLocation } from 'react-router';
import { AuthService } from '../features/auth/services/auth.service';
import { useToast } from '../contexts/toast-context';
import { ToastType } from '../enums/toast-type';
import { useProfile } from '../features/own/hooks/use-profile';
import { deleteFCMToken } from '@/utils/fcm';
import { hasAuthToken } from '../utils/auth';
import { useQuery } from '@tanstack/react-query';
import { ownService } from '../features/own/services/own.service';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { data: user } = useProfile();
  const isAuthenticated = hasAuthToken();

  const { data: unreadNotifications } = useQuery({
    queryKey: ['own-notifications', 'header-unread'],
    queryFn: () =>
      ownService.listNotifications({
        page: 1,
        limit: 20,
        is_read: false,
        sorts: [{ field: 'created_at', direction: 'desc' }],
      }),
    enabled: isAuthenticated,
    retry: false,
  });

  const isSuperAdmin = user?.roles?.some((r) => r.role === 'SUPERADMIN') ?? false;
  const isSeller = user?.roles?.some((r) => r.role === 'SELLER') ?? false;
  const isBidder = user?.roles?.some((r) => r.role === 'BIDDER') ?? false;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await deleteFCMToken();
    await new AuthService().logout();
    showToast('Logged out successfully', ToastType.SUCCESS);
    navigate('/login');
  };

  const navLinks = [
    { to: '/auctions', label: 'Live Auctions', icon: Gavel },
    ...(isSuperAdmin || isSeller ? [{ to: '/own/auctions', label: 'My Auctions', icon: Gavel }] : []),
    ...(isSuperAdmin || isBidder ? [{ to: '/own/bids', label: 'My Bids', icon: Wallet }] : []),
    ...(isSuperAdmin || isSeller ? [{ to: '/own/products', label: 'My Products', icon: Package }] : []),
  ];

  const isActiveLink = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-[#172235]/95 text-white shadow-sm shadow-slate-950/10 backdrop-blur z-50">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/auctions" className="group flex items-center gap-3 flex-shrink-0" aria-label="Bidify home">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-white/60 transition-transform group-hover:scale-[1.03]">
            <img src={LogoMark} alt="" className="h-7 w-7" />
          </span>
          <span className="font-extrabold text-white text-xl tracking-tight hidden sm:block">Bidify</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
            <Link
              key={link.to}
              to={link.to}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActiveLink(link.to)
                  ? 'bg-white/[0.14] text-white shadow-inner shadow-white/5'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((open) => !open)}
                className={`relative rounded-lg p-2 transition-colors ${
                  notifOpen ? 'bg-white/10 text-white' : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {(unreadNotifications?.total ?? 0) > 0 && (
                  <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-amber-500 px-1.5 text-center text-[10px] font-bold leading-5 text-slate-950">
                    {Math.min(unreadNotifications?.total ?? 0, 99)}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-900 shadow-xl shadow-slate-950/10">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">Notifications</p>
                    <Link
                      to="/own/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-950"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="max-h-80 overflow-y-auto py-1">
                    {(unreadNotifications?.nodes ?? []).length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-slate-500">No unread notifications</p>
                    ) : (
                      unreadNotifications!.nodes.slice(0, 5).map((notification) => (
                        <Link
                          key={notification.id}
                          to={`/own/notifications/${notification.id}`}
                          onClick={() => setNotifOpen(false)}
                          className="block border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50"
                        >
                          <div className="flex items-start gap-2">
                            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-slate-400" />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">{notification.title}</p>
                              <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{notification.body}</p>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-100 sm:inline-flex"
            >
              Sign In
            </Link>
          )}

          {isAuthenticated && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  profileOpen
                    ? 'bg-white/10 text-white'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center ring-1 ring-white/10">
                  <User className="h-4 w-4 text-slate-100" />
                </div>
                <span className="hidden sm:block max-w-[100px] truncate">
                  {user?.fullname?.split(' ')[0] || 'Profile'}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-3 w-60 bg-white text-slate-900 rounded-lg shadow-xl shadow-slate-950/10 border border-slate-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user?.fullname || 'User'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="h-4 w-4 text-slate-400" /> My Profile
                    </Link>
                    <Link
                      to="/own/notifications"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Bell className="h-4 w-4 text-slate-400" /> Notifications
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
          )}

          <button
            className="md:hidden p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <XIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 md:hidden z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-[#172235] border-b border-white/10 md:hidden z-50 shadow-lg">
            <nav className="py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-4 py-3 text-sm font-medium transition-colors ${
                    isActiveLink(link.to)
                      ? 'bg-white/10 text-white'
                      : 'text-slate-200 hover:bg-white/10'
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
