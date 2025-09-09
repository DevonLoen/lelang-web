import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Auth } from "../enums/auth-token";

interface DecodedToken {
  exp: number;
  // Add other token fields if needed
}

export const checkAuth = async (): Promise<boolean> => {
  const token = Cookies.get(Auth.TOKEN_KEY);

  if (!token) return false;

  try {
    const decoded = jwtDecode<DecodedToken>(token);

    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};
