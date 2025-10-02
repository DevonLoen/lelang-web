import { useEffect, useRef, useState } from "react";
import Logo from "../../../assets/logo.png";
import { useToast } from "../../../contexts/toast-context";
import { ToastType } from "../../../enums/toast-type";
import { AuthService } from "../services/auth.service";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    const savedExpire = localStorage.getItem("otp_expire");
    if (savedExpire) {
      const expireTime = parseInt(savedExpire, 10);
      const now = Date.now();
      if (expireTime > now) {
        setTimer(Math.floor((expireTime - now) / 1000));
      }
    }
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      showToast("OTP must be 6 digits", ToastType.ERROR);
      return;
    }

    try {
      setIsSubmitting(true);
      await new AuthService().verifyOtp({ otp: code });
      showToast("OTP Verified Successfully", ToastType.SUCCESS);
      window.location.href = "/login";
    } catch (err: any) {
      const finalMessage =
        err?.response?.data?.message || err?.message || "Invalid OTP";
      showToast(finalMessage, ToastType.ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const expireTime = Date.now() + 60000; // 60 detik ke depan
      localStorage.setItem("otp_expire", expireTime.toString());
      setTimer(60);

      await new AuthService().sendOtp({});
      showToast("OTP Resent", ToastType.INFO);
    } catch (err: any) {
      showToast("Failed to resend OTP", ToastType.ERROR);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Panel */}
      <div className="flex w-full max-w-md flex-col justify-center bg-gradient-to-br from-blue-950 via-blue-800 to-purple-900 p-8 sm:w-1/3 border-r border-blue-300 shadow-lg">
        <div className="mx-auto w-4/5">
          <h2 className="mb-3 text-3xl font-bold text-white">VERIFY OTP</h2>
          <p className="mb-6 text-gray-300 text-sm">
            Enter the 6-digit code sent to your phone.
          </p>

          {/* OTP Input */}
          <div className="mb-6 flex justify-between space-x-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el; // simpan ref
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-full h-12 text-center text-xl font-bold rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerifyOtp}
            disabled={isSubmitting}
            className={`w-full h-12 rounded-xl font-bold text-white transition bg-yellow-500 hover:bg-yellow-600`}
          >
            {isSubmitting ? (
              <div className="flex justify-center space-x-1">
                <div className="h-4 w-1 bg-white animate-pulse"></div>
                <div className="h-4 w-1 bg-white animate-pulse [animation-delay:0.2s]"></div>
                <div className="h-4 w-1 bg-white animate-pulse [animation-delay:0.4s]"></div>
              </div>
            ) : (
              "VERIFY"
            )}
          </button>

          {/* Resend OTP */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Didn’t receive the code?{" "}
            <button
              disabled={timer > 0}
              onClick={handleResendOtp}
              className={`${
                timer > 0
                  ? "text-gray-500 cursor-not-allowed"
                  : "text-yellow-400 hover:underline"
              }`}
            >
              {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
            </button>
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden flex-1 flex-col items-center justify-center bg-animated-gradient shadow-lg px-6 text-center sm:flex">
        <div className="mb-4 flex items-center">
          <img src={Logo} alt="Logo" className="h-40 w-40" />
          <h1 className="text-6xl font-bold text-white">AUCTION</h1>
        </div>
        <h2 className="mb-1 text-3xl font-bold text-white">
          Secure Your Account
        </h2>
        <p className="text-gray-400">Enter the OTP code to continue.</p>
      </div>
    </div>
  );
}
