import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { checkAuth } from "../utils/auth";
import Header from "./header";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const isAuth = await checkAuth();

      if (!isAuth) {
        navigate("/login");
      }
    };
    check();
  }, [navigate, location.pathname]);

  return (
    <div className="bg-slate-50 min-h-screen relative">
      <Header />
      <div className="h-20"></div>
      <Outlet />
    </div>
  );
}


