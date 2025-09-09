import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
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
    console.log("asem");
    check();
  }, [navigate, location.pathname]);

  return <div>h</div>;
}
