import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Auth } from "../enums/auth-token";

interface DecodedToken {
  exp: number;
  // Add other token fields if needed
}

export const checkAuth = async (): Promise<boolean> => {
  const token = Cookies.get(Auth.TOKEN_KEY);

  if (!token || token === 'undefined' || token === 'null') return false;

  try {
    const rawToken = token.replace(/^Bearer\s+/i, '');
    const decoded = jwtDecode<DecodedToken>(rawToken);

    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};
