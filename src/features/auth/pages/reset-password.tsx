import Logo from "../../../assets/logo.png";
import { useNavigate } from "react-router";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen">
      <div className="flex w-full max-w-md flex-col justify-center bg-gradient-to-br from-blue-950 via-blue-800 to-purple-900 p-8 sm:w-1/3 border-r border-blue-300 shadow-lg">
        <div className="mx-auto w-4/5">
          <h2 className="mb-3 text-3xl font-bold text-white">RESET PASSWORD</h2>
          <div className="rounded-xl bg-white/10 border border-white/20 p-5 text-white space-y-3">
            <p className="font-semibold text-yellow-300">Feature Not Available</p>
            <p className="text-sm text-gray-300">
              Password reset is currently not supported. Please contact support for assistance.
            </p>
          </div>
          <p className="mt-8 text-center text-sm text-gray-400">
            <button onClick={() => navigate('/login')} className="text-yellow-400 hover:underline">
              Back to Login
            </button>
          </p>
        </div>
      </div>
      <div className="hidden flex-1 flex-col items-center justify-center bg-animated-gradient shadow-lg px-6 text-center sm:flex">
        <div className="mb-4 flex items-center">
          <img src={Logo} alt="Logo" className="h-40 w-40" />
          <h1 className="text-6xl font-bold text-white">AUCTION</h1>
        </div>
        <h2 className="mb-1 text-3xl font-bold text-white">Enter the World of Bids</h2>
        <p className="text-gray-400">Your dream item is just one bid away.</p>
      </div>
    </div>
  );
}
