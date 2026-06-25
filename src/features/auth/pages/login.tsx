import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Logo from '../../../assets/bidify-mark.svg';
import { FaEnvelope } from 'react-icons/fa';
import { ToastType } from '../../../enums/toast-type';
import { useToast } from '../../../contexts/toast-context';
import { AuthService } from '../services/auth.service';
import { InputField } from '../../../components/input-field';
import { InputFieldPassword } from '../../../components/input-field-password';
import { capitalizeWords } from '../../../utils/string';
import { useNavigate } from 'react-router';
import { initFCM } from '@/utils/fcm';

interface LoginFieldState {
  email: string;
  password: string;
}

interface LoginFieldErrors {
  email: string;
  password: string;
}

const getErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

export default function LoginPage() {
  const [field, setField] = useState<LoginFieldState>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<LoginFieldErrors>({
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const validateField = async () => {
    const newErrors: LoginFieldErrors = {
      email: '',
      password: '',
    };
    if (!field.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.email)) {
      newErrors.email = 'Email is invalid';
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
          email: field.email,
          password: field.password,
        };
        const result = await new AuthService().login(payload);
        showToast(result.message || 'Login Successfully', ToastType.SUCCESS);
        qc.invalidateQueries({ queryKey: ['own-profile'] });
        await initFCM();
        navigate(`/`);
      } catch (error: unknown) {
        showToast(getErrorMessage(error, 'Login failed'), ToastType.ERROR);
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
    setField((prev) => ({ ...prev, [name]: value }));
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
    <div className="bidify-auth-shell min-h-screen flex flex-col lg:flex-row">
      <div className="lg:hidden flex items-center justify-center gap-3 py-8 px-4">
        <img src={Logo} alt="Bidify" className="h-12 w-12" />
        <h1 className="text-2xl font-bold text-white">Bidify</h1>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md" onKeyDown={handleKeyDown}>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-slate-400">Sign in to continue bidding, selling, and tracking your auctions.</p>
          </div>

          <div className="space-y-5">
            <InputField
              label="Email"
              type="email"
              name="email"
              id="email"
              value={field.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.email}
              errorMessage={errors.email}
              icon={<FaEnvelope className="h-4 w-4" />}
            />

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

            <button
              onClick={handleLogin}
              disabled={isSubmitting}
              className="w-full h-12 rounded-lg bg-amber-400 font-bold text-slate-950 transition-all hover:bg-amber-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
            >
              {isSubmitting ? (
                <div className="flex justify-center items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-slate-950 animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 rounded-full bg-slate-950 animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 rounded-full bg-slate-950 animate-bounce"></div>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <p className="mt-8 text-center text-slate-400">
            {"Don't have an account? "}
            <a href="/signup" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
              Create one
            </a>
          </p>
        </div>
      </div>

      <div className="bidify-auth-brand hidden lg:flex flex-1 flex-col items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <img src={Logo} alt="Bidify" className="h-24 w-24 drop-shadow-lg" />
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">Bidify</h1>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Enter the live marketplace</h2>
          <p className="text-slate-200 text-lg">
            Discover curated products, compete in real time, and manage every auction from one secure workspace.
          </p>
        </div>
      </div>
    </div>
  );
}
