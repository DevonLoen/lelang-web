import { useCallback, useEffect, useRef, useState } from 'react';
import Logo from '../../../assets/bidify-mark.svg';
import { useToast } from '../../../contexts/toast-context';
import { ToastType } from '../../../enums/toast-type';
import { AuthService, type SignupPayload } from '../services/auth.service';
import { useNavigate } from 'react-router';

interface SendOtpFieldState {
  fullname: string;
  email: string;
  password: string;
  gender: string;
  birth: string;
}

const getErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [field, setField] = useState<SendOtpFieldState>({
    fullname: '',
    email: '',
    password: '',
    gender: '',
    birth: '',
  });

  const loadDataAndValidate = useCallback(() => {
    const savedDataString = localStorage.getItem('signupPayload');

    if (savedDataString) {
      try {
        const savedData = JSON.parse(savedDataString);
        setField(savedData);
      } catch {
        showToast('Invalid registration data. Please sign up again.', ToastType.ERROR);
        navigate('/signup');
      }
    } else {
      showToast('Please complete the registration form first.', ToastType.INFO);
      navigate('/signup');
    }
  }, [navigate, showToast]);

  useEffect(() => {
    const savedExpire = localStorage.getItem('otp_expire');
    if (savedExpire) {
      const expireTime = parseInt(savedExpire, 10);
      const now = Date.now();
      if (expireTime > now) {
        setTimer(Math.floor((expireTime - now) / 1000));
      }
    }
    loadDataAndValidate();
  }, [loadDataAndValidate]);

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

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split('').forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');

    if (code.length !== 6) {
      showToast('OTP must be 6 digits', ToastType.ERROR);
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: SignupPayload = {
        fullname: field.fullname,
        email: field.email,
        birth: field.birth,
        gender: field.gender,
        password: field.password,
        otp: code,
      };

      const result = await new AuthService().signup(payload);

      showToast(result.message || 'Sign up successful!', ToastType.SUCCESS);
      navigate('/login');
    } catch (err: unknown) {
      showToast(getErrorMessage(err, 'Invalid OTP'), ToastType.ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const expireTime = Date.now() + 60000;
      localStorage.setItem('otp_expire', expireTime.toString());
      setTimer(60);

      const result = await new AuthService().sendOtp({ email: field.email });
      showToast(result.message || 'OTP has been resent', ToastType.INFO);
    } catch (err: unknown) {
      showToast(getErrorMessage(err, 'Failed to resend OTP'), ToastType.ERROR);
    }
  };

  return (
    <div className="bidify-auth-shell min-h-screen flex flex-col lg:flex-row">
      <div className="lg:hidden flex items-center justify-center gap-3 py-8 px-4">
        <img src={Logo} alt="Bidify" className="h-12 w-12" />
        <h1 className="text-2xl font-bold text-white">Bidify</h1>
      </div>

      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Verify Your Email</h2>
            <p className="text-slate-400">
              Enter the 6-digit code sent to <span className="text-amber-500 font-medium">{field.email || 'your email'}</span>
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
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-lg bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all"
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerifyOtp}
            disabled={isSubmitting}
            className="w-full h-12 rounded-lg bg-amber-400 font-bold text-slate-950 transition-all hover:bg-amber-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
          >
            {isSubmitting ? (
              <div className="flex justify-center items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-white animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 rounded-full bg-white animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 rounded-full bg-white animate-bounce"></div>
              </div>
            ) : (
              'Verify Code'
            )}
          </button>

          {/* Resend OTP */}
          <p className="mt-6 text-center text-slate-400">
            {"Didn't receive the code? "}
            <button
              disabled={timer > 0}
              onClick={handleResendOtp}
              className={`font-medium transition-colors ${
                timer > 0 ? 'text-slate-500 cursor-not-allowed' : 'text-amber-500 hover:text-amber-400'
              }`}
            >
              {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
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
      <div className="bidify-auth-brand hidden lg:flex flex-1 flex-col items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <img src={Logo} alt="Bidify" className="h-20 w-20 drop-shadow-lg" />
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">Bidify</h1>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Almost There!
          </h2>
          <p className="text-slate-200 text-lg">
            Verify your email address to complete your registration and start bidding.
          </p>
        </div>
      </div>
    </div>
  );
}
