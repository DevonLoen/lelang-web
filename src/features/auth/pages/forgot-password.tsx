import Logo from '../../../assets/bidify-mark.svg';
import { useNavigate } from 'react-router';
import { FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import { useState } from 'react';
import { useToast } from '../../../contexts/toast-context';
import { ToastType } from '../../../enums/toast-type';
import { InputField } from '../../../components/input-field';
import { AuthService } from '../services/auth.service';

interface ForgotPasswordFieldState {
  email: string;
}

interface ForgotPasswordFieldErrors {
  email: string;
}

const getErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [field, setField] = useState<ForgotPasswordFieldState>({
    email: '',
  });
  const [errors, setErrors] = useState<ForgotPasswordFieldErrors>({
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = async () => {
    const newErrors: ForgotPasswordFieldErrors = {
      email: '',
    };

    if (!field.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setErrors((prev) => ({
      ...prev,
      [name]: !value.trim() ? 'Email is required' : '',
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setField((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!(await validateField())) return;

    try {
      setIsSubmitting(true);
      localStorage.setItem('resetPasswordEmail', field.email);
      await new AuthService().forgotPassword({ email: field.email });
      showToast('If the email exists, a reset code has been sent to your inbox.', ToastType.SUCCESS);
      navigate('/reset-password', { state: { email: field.email } });
    } catch (error: unknown) {
      showToast(getErrorMessage(error, 'Failed to send reset code'), ToastType.ERROR);
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

      {/* Left Panel - Content */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md" onKeyDown={handleKeyDown}>
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
            <p className="text-slate-400">Enter your email and we will send a 6-digit reset code if the account exists.</p>
          </div>

          {/* Info Card */}
          <div className="rounded-lg bg-white/[0.06] border border-white/10 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <FaEnvelope className="h-5 w-5 text-amber-500" />
              </div>
              <h3 className="font-semibold text-white">Reset via Email</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              The code expires in 5 minutes. For security, we will always show the same confirmation message after submission.
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
                'Send Reset Code'
              )}
            </button>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate('/login')}
            className="mt-4 w-full h-12 rounded-lg bg-white/[0.06] border border-white/10 font-semibold text-white transition-all hover:bg-white/[0.1] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <FaArrowLeft className="h-4 w-4" />
            Back to Login
          </button>
        </div>
      </div>

      {/* Right Panel - Branding (hidden on mobile) */}
      <div className="bidify-auth-brand hidden lg:flex flex-1 flex-col items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <img src={Logo} alt="Bidify" className="h-20 w-20 drop-shadow-lg" />
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">Bidify</h1>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Recover Access Fast</h2>
          <p className="text-amber-100 text-lg">We will send a reset code to your email so you can set a new password securely.</p>
        </div>
      </div>
    </div>
  );
}
