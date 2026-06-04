import { useEffect, useRef, useState } from "react";
import Logo from "../../../assets/logo.png";
import { useToast } from "../../../contexts/toast-context";
import { ToastType } from "../../../enums/toast-type";
import { AuthService, type SignupPayload } from "../services/auth.service";
import { useNavigate } from "react-router";

interface SendOtpFieldState {
  fullname: string;
  phone: string;
  password: string;
  gender: string;
  birth: string;
}

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [field, setField] = useState<SendOtpFieldState>({
    fullname: "",
    phone: "",
    password: "",
    gender: "",
    birth: "",
  });

  const loadDataAndValidate = () => {
    const savedDataString = localStorage.getItem("signupPayload");

    if (savedDataString) {
      try {
        const savedData = JSON.parse(savedDataString);
        setField(savedData);
      } catch {
        showToast(
          "Invalid registration data. Please sign up again.",
          ToastType.ERROR
        );
        navigate("/signup");
      }
    } else {
      showToast("Please complete the registration form first.", ToastType.INFO);
      navigate("/signup");
    }
  };

  useEffect(() => {
    const savedExpire = localStorage.getItem("otp_expire");
    if (savedExpire) {
      const expireTime = parseInt(savedExpire, 10);
      const now = Date.now();
      if (expireTime > now) {
        setTimer(Math.floor((expireTime - now) / 1000));
      }
    }
    loadDataAndValidate();
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

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split("").forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
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

      const payload: SignupPayload = {
        fullname: field.fullname,
        phone: field.phone,
        birth: field.birth,
        gender: field.gender,
        password: field.password,
        otp: code,
      };

      const result = await new AuthService().signup(payload);

      showToast(result.message || 'Sign up successful!', ToastType.SUCCESS);
      navigate("/login");
    } catch (err: any) {
      showToast(err.message || 'Invalid OTP', ToastType.ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const expireTime = Date.now() + 60000;
      localStorage.setItem("otp_expire", expireTime.toString());
      setTimer(60);

      const result = await new AuthService().sendOtp({ phone: field.phone });
      showToast(result.message || 'OTP has been resent', ToastType.INFO);
    } catch (err: any) {
      showToast(err.message || 'Failed to resend OTP', ToastType.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-center gap-3 py-8 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <img src={Logo} alt="Auction Logo" className="h-12 w-12" />
        <h1 className="text-2xl font-bold text-white">AUCTION</h1>
      </div>

      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-900">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Verify Your Phone</h2>
            <p className="text-slate-400">
              Enter the 6-digit code sent to{" "}
              <span className="text-amber-500 font-medium">{field.phone || "your phone"}</span>
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-8 flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl bg-slate-800 border-2 border-slate-700 text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerifyOtp}
            disabled={isSubmitting}
            className="w-full h-12 rounded-lg bg-amber-500 font-semibold text-white transition-all hover:bg-amber-600 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
          >
            {isSubmitting ? (
              <div className="flex justify-center items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-white animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 rounded-full bg-white animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 rounded-full bg-white animate-bounce"></div>
              </div>
            ) : (
              "Verify Code"
            )}
          </button>

          {/* Resend OTP */}
          <p className="mt-6 text-center text-slate-400">
            {"Didn't receive the code? "}
            <button
              disabled={timer > 0}
              onClick={handleResendOtp}
              className={`font-medium transition-colors ${
                timer > 0
                  ? "text-slate-500 cursor-not-allowed"
                  : "text-amber-500 hover:text-amber-400"
              }`}
            >
              {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
            </button>
          </p>

          {/* Back to signup */}
          <p className="mt-4 text-center">
            <a href="/signup" className="text-slate-500 hover:text-slate-400 text-sm transition-colors">
              Back to sign up
            </a>
          </p>
        </div>
      </div>

      {/* Right Panel - Branding (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <img src={Logo} alt="Auction Logo" className="h-20 w-20 drop-shadow-lg" />
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">AUCTION</h1>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Almost There!
          </h2>
          <p className="text-amber-100 text-lg">
            Verify your phone number to complete your registration and start bidding.
          </p>
        </div>
      </div>
    </div>
  );
}
