import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { checkAuth } from "../utils/auth";

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
    <div>
      {/* ...header/nav... */}
      <Outlet />
      {/* ...footer... */}
    </div>
  );
}
