import Logo from '../../../assets/logo.png';
import { useNavigate } from 'react-router';
import { FaArrowLeft, FaEnvelope } from 'react-icons/fa';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-center gap-3 py-8 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <img src={Logo} alt="Auction Logo" className="h-32 w-auto drop-shadow-lg" />
      </div>

      {/* Left Panel - Content */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-900">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
            <p className="text-slate-400">{"Don't worry, we're here to help"}</p>
          </div>

          {/* Info Card */}
          <div className="rounded-xl bg-slate-800 border border-slate-700 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <FaEnvelope className="h-5 w-5 text-amber-500" />
              </div>
              <h3 className="font-semibold text-white">Contact Support</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Password reset is currently not available in the app. Please contact our support team for assistance with recovering
              your account.
            </p>
          </div>

          {/* Support Options */}
          <div className="space-y-3 mb-8">
            <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-4">
              <p className="text-slate-300 text-sm">
                <span className="text-slate-500">Email:</span>{' '}
                <a href="mailto:support@auction.com" className="text-amber-500 hover:text-amber-400">
                  support@auction.com
                </a>
              </p>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate('/login')}
            className="w-full h-12 rounded-lg bg-slate-800 border border-slate-700 font-semibold text-white transition-all hover:bg-slate-700 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <FaArrowLeft className="h-4 w-4" />
            Back to Login
          </button>
        </div>
      </div>

      {/* Right Panel - Branding (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center gap-4">
            <img src={Logo} alt="Auction Logo" className="h-32 w-auto drop-shadow-lg" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">We Have Got Your Back</h2>
          <p className="text-amber-100 text-lg">Our support team is ready to help you regain access to your account.</p>
        </div>
      </div>
    </div>
  );
}
