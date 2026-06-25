import { useEffect, useState } from 'react';
import Logo from '../../../assets/bidify-mark.svg';
import { useLocation, useNavigate } from 'react-router';
import { FaEnvelope, FaKey } from 'react-icons/fa';
import { useToast } from '../../../contexts/toast-context';
import { ToastType } from '../../../enums/toast-type';
import { AuthService } from '../services/auth.service';
import { InputField } from '../../../components/input-field';
import { InputFieldPassword } from '../../../components/input-field-password';
import { capitalizeWords } from '../../../utils/string';

interface ResetPasswordFieldState {
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
}

interface ResetPasswordFieldErrors {
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
}

type ResetPasswordLocationState = {
  email?: string;
};

const getErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

export default function ResetPasswordPage() {
  const [field, setField] = useState<ResetPasswordFieldState>({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<ResetPasswordFieldErrors>({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const state = location.state as ResetPasswordLocationState | null;
    const savedEmail = state?.email || localStorage.getItem('resetPasswordEmail') || '';

    if (savedEmail) {
      setField((prev) => ({
        ...prev,
        email: savedEmail,
      }));
    }
  }, [location.state]);

  const validateField = async () => {
    const newErrors: ResetPasswordFieldErrors = {
      email: '',
      otp: '',
      password: '',
      confirmPassword: '',
    };

    if (!field.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!field.otp.trim()) {
      newErrors.otp = 'Reset code is required';
    } else if (!/^\d{6}$/.test(field.otp.trim())) {
      newErrors.otp = 'Reset code must be 6 digits';
    }

    if (!field.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (field.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (field.password.length > 255) {
      newErrors.password = 'Password must be at most 255 characters';
    }

    if (!field.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (field.confirmPassword !== field.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setErrors((prev) => {
      if (name === 'confirmPassword') {
        return {
          ...prev,
          confirmPassword: !value.trim() ? 'Confirm password is required' : field.password !== value ? 'Passwords do not match' : '',
        };
      }

      if (name === 'otp') {
        return {
          ...prev,
          otp: !value.trim() ? 'Reset code is required' : /^\d{6}$/.test(value.trim()) ? '' : 'Reset code must be 6 digits',
        };
      }

      if (name === 'email') {
        return {
          ...prev,
          email: !value.trim() ? 'Email is required' : '',
        };
      }

      if (name === 'password') {
        return {
          ...prev,
          password: !value.trim()
            ? 'Password is required'
            : value.length < 8
              ? 'Password must be at least 8 characters'
              : value.length > 255
                ? 'Password must be at most 255 characters'
                : '',
        };
      }

      return {
        ...prev,
        [name]: !value.trim() ? `${capitalizeWords(name)} is required` : '',
      };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextValue = name === 'otp' ? value.replace(/\D/g, '').slice(0, 6) : value;

    setField((prev) => {
      const nextField = { ...prev, [name]: nextValue };

      if (name === 'password' && prev.confirmPassword && prev.confirmPassword !== value) {
        setErrors((current) => ({
          ...current,
          confirmPassword: 'Passwords do not match',
        }));
      }

      if (name === 'password' && prev.confirmPassword && prev.confirmPassword === value) {
        setErrors((current) => ({
          ...current,
          confirmPassword: '',
        }));
      }

      return nextField;
    });
  };

  const handleSubmit = async () => {
    if (!(await validateField())) return;

    try {
      setIsSubmitting(true);
      await new AuthService().resetPassword({
        email: field.email,
        otp: field.otp,
        password: field.password,
      });

      localStorage.removeItem('resetPasswordEmail');
      showToast('Password reset successful. Please sign in with your new password.', ToastType.SUCCESS);
      navigate('/login');
    } catch (error: unknown) {
      showToast(getErrorMessage(error, 'Reset password failed'), ToastType.ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit();
    }
  };

  return (
    <div className="bidify-auth-shell min-h-screen flex flex-col lg:flex-row">
      <div className="lg:hidden flex items-center justify-center gap-3 py-8 px-4">
        <img src={Logo} alt="Bidify" className="h-12 w-12" />
        <h1 className="text-2xl font-bold text-white">Bidify</h1>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md" onKeyDown={handleKeyDown}>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-slate-400">Enter the email, 6-digit code, and your new password to regain access.</p>
          </div>

          <div className="rounded-lg bg-white/[0.06] border border-white/10 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <FaKey className="h-5 w-5 text-amber-500" />
              </div>
              <h3 className="font-semibold text-white">Security Check</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Reset codes expire in 5 minutes. If the code is invalid or expired, the backend error key will be shown directly.
            </p>
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

            <InputField
              label="Reset Code"
              type="text"
              name="otp"
              id="otp"
              value={field.otp}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.otp}
              errorMessage={errors.otp}
              icon={<FaKey className="h-4 w-4" />}
              inputMode="numeric"
            />

            <InputFieldPassword
              label="New Password"
              name="password"
              id="password"
              value={field.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.password}
              errorMessage={errors.password}
            />

            <InputFieldPassword
              label="Confirm Password"
              name="confirmPassword"
              id="confirmPassword"
              value={field.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword}
            />

            <p className="text-xs text-slate-500 leading-relaxed">
              Password rules: minimum 8 characters, maximum 255 characters.
            </p>

            <button
              onClick={handleSubmit}
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
                'Reset Password'
              )}
            </button>
          </div>

          <button
            onClick={() => navigate('/forgot-password')}
            className="mt-4 w-full h-12 rounded-lg bg-white/[0.06] border border-white/10 font-semibold text-white transition-all hover:bg-white/[0.1] active:scale-[0.98]"
          >
            Back to Forgot Password
          </button>
        </div>
      </div>

      <div className="bidify-auth-brand hidden lg:flex flex-1 flex-col items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <img src={Logo} alt="Bidify" className="h-20 w-20 drop-shadow-lg" />
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">Bidify</h1>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">A Fresh Start Awaits</h2>
          <p className="text-slate-200 text-lg">Set a new password and jump back into your account without delay.</p>
        </div>
      </div>
    </div>
  );
}
