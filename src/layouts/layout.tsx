import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { checkAuth } from "../utils/auth";
import Header from "./header";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const isPublicAuctionPath = location.pathname === "/" || location.pathname === "/auctions" || /^\/auctions\/[^/]+$/.test(location.pathname);
      if (isPublicAuctionPath) return;

      const isAuth = await checkAuth();

      if (!isAuth) {
        navigate("/login");
      }
    };
    check();
  }, [navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-[#f4f6fa]">
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
