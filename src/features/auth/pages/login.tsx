import { useState } from "react";
import Logo from "../../../assets/logo.png";
import { FaPhone } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { ToastType } from "../../../enums/toast-type";
import { useToast } from "../../../contexts/toast-context";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { showToast } = useToast();

  const handleLogin = async () => {
    console.log("Login with:", { email, password });
    showToast("Invalid Phone or Password", ToastType.ERROR);
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Left Panel */}
      <div className="flex w-full max-w-md flex-col justify-center bg-[#1f2c44] p-8 sm:w-1/3  border-r border-white">
        <div className="mx-auto w-4/5">
          <h2 className="mb-6 text-3xl font-bold text-white">LOGIN</h2>

          {/* Phone Input */}
          <div className="mb-6 relative">
            <input
              type="text"
              id="phone"
              placeholder="Phone"
              className="peer w-full border-b border-gray-500 bg-transparent px-4 pt-5 pb-2 text-gray-200 
               placeholder-transparent focus:border-white focus:outline-none"
            />
            <label
              htmlFor="phone"
              className="absolute left-4 top-0 text-sm text-gray-400 transition-all duration-200 
               peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
               peer-focus:top-0 peer-focus:text-sm peer-focus:text-white"
            >
              Phone +62
            </label>
            <span className="absolute right-3 top-7 -translate-y-1/2 text-gray-400 pointer-events-none">
              <FaPhone className="h-5 w-5" />
            </span>
            <a
              href="#"
              className="mt-1 block text-right text-xs  text-yellow-400 hover:underline"
            >
              Forgot Password?
            </a>
          </div>

          {/* Password Input */}
          <div className="mb-6 relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Password"
              className="peer w-full border-b border-gray-500 bg-transparent px-4 pt-5 pb-2 text-gray-200 
               placeholder-transparent focus:border-white focus:outline-none"
            />
            <label
              htmlFor="password"
              className="absolute left-4 top-0 text-sm text-gray-400 transition-all duration-200 
               peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
               peer-focus:top-0 peer-focus:text-sm peer-focus:text-white"
            >
              Password
            </label>
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
              onMouseLeave={() => setShowPassword(false)} // kalau mouse geser keluar icon
              onTouchStart={() => setShowPassword(true)} // support mobile
              onTouchEnd={() => setShowPassword(false)}
            >
              {showPassword ? (
                <FaEye className="h-5 w-5" />
              ) : (
                <FaEyeSlash className="h-5 w-5" />
              )}
            </span>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full rounded-xl bg-yellow-500 py-2 font-bold text-white transition hover:bg-yellow-600"
          >
            LOGIN
          </button>

          {/* Signup */}
          <p className="mt-8 text-center text-sm text-gray-400">
            Don’t have an Account?{" "}
            <a href="#" className="text-yellow-400 hover:underline">
              Sign Up Here
            </a>
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden flex-1 flex-col items-center justify-center bg-[#0d1c36] px-6 text-center sm:flex">
        <div className="mb-4 flex items-center">
          <img src={Logo} alt="Logo" className="h-40 w-40" />
          <h1 className="text-6xl font-bold text-white">AUCTION</h1>
        </div>
        <h2 className="mb-1 text-3xl font-bold text-white">
          Enter the World of Bids
        </h2>
        <p className="text-gray-400">Your dream item is just one bid away.</p>
      </div>
    </div>
  );
}
