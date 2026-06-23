import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Logo from '../../../assets/logo.png';
import { FaPhone } from 'react-icons/fa';
import { ToastType } from '../../../enums/toast-type';
import { useToast } from '../../../contexts/toast-context';
import { AuthService } from '../services/auth.service';
import { InputField } from '../../../components/input-field';
import { InputFieldPassword } from '../../../components/input-field-password';
import { capitalizeWords } from '../../../utils/string';
import { useNavigate } from 'react-router';
import { initFCM } from '@/utils/fcm';

interface LoginFieldState {
  phone: string;
  password: string;
}

interface LoginFieldErrors {
  phone: string;
  password: string;
}

export default function LoginPage() {
  const [field, setField] = useState<LoginFieldState>({
    phone: '',
    password: '',
  });

  const [errors, setErrors] = useState<LoginFieldErrors>({
    phone: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const validateField = async () => {
    const newErrors: LoginFieldErrors = {
      phone: '',
      password: '',
    };
    if (!field.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d+$/.test(field.phone)) {
      newErrors.phone = 'Phone must be a number';
    }

    if (!field.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleLogin = async () => {
    if (await validateField()) {
      try {
        setIsSubmitting(true);
        const payload = {
          phone: field.phone,
          password: field.password,
        };
        const result = await new AuthService().login(payload);
        showToast(result.message || 'Login Successfully', ToastType.SUCCESS);
        qc.invalidateQueries({ queryKey: ['own-profile'] });

        // inisialisasi fcm
        await initFCM();
        navigate(`/`);
      } catch (error: any) {
        showToast(error.message || 'Login failed', ToastType.ERROR);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setErrors((prev) => ({
      ...prev,
      [name]: !value.trim() ? `${capitalizeWords(name)} is required` : '',
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setField((prev) => ({ ...prev, [name]: value as any }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleLogin();
    }
  };

  useEffect(() => {
    localStorage.removeItem('signupPayload');
    localStorage.removeItem('otp_expire');
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-900">
      {/* Mobile Header - Logo section visible on small screens */}
      <div className="lg:hidden flex items-center justify-center gap-3 py-8 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <img src={Logo} alt="Auction Logo" className="h-12 w-12" />
        <h1 className="text-2xl font-bold text-white">AUCTION</h1>
      </div>

      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-900">
        <div className="w-full max-w-md" onKeyDown={handleKeyDown}>
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-slate-400">Sign in to continue to your account</p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            <div className="relative">
              <InputField
                label="Phone Number"
                type="text"
                name="phone"
                id="phone"
                value={field.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.phone}
                errorMessage={errors.phone}
                icon={<FaPhone className="h-4 w-4" />}
                inputMode="numeric"
              />
            </div>

            <div className="relative">
              <InputFieldPassword
                label="Password"
                name="password"
                id="password"
                value={field.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.password}
                errorMessage={errors.password}
              />
              <div className="flex justify-end mt-2">
                <a href="/forgot-password" className="text-sm text-amber-500 hover:text-amber-400 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
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
                'Sign In'
              )}
            </button>
          </div>

          {/* Signup Link */}
          <p className="mt-8 text-center text-slate-400">
            {"Don't have an account? "}
            <a href="/signup" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
              Create one
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
          <h2 className="text-3xl font-bold text-white mb-4">Enter the World of Bids</h2>
          <p className="text-amber-100 text-lg">
            Your dream item is just one bid away. Join thousands of users and start bidding today.
          </p>
        </div>
      </div>
    </div>
  );
}
