import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ownService } from '../services/own.service';
import { CreditCard, Loader2, AlertCircle, CheckCircle2, ChevronLeft, ArrowLeft } from 'lucide-react';

declare global {
  interface Window {
    snap: {
      embed: (
        token: string,
        options: {
          embedId: string;
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

const formatIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatDate = (s: string) =>
  new Date(s).toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

type PaymentState = 'idle' | 'embedded' | 'success' | 'pending' | 'error';

export default function OwnPaymentPage() {
  const { auctionId, paymentId } = useParams<{ auctionId: string; paymentId: string }>();
  const navigate = useNavigate();
  const snapScriptRef = useRef<HTMLScriptElement | null>(null);
  const snapEmbedded = useRef(false);
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [snapReady, setSnapReady] = useState(false);
  const [snapError, setSnapError] = useState(false);

  const { data: payment, isLoading, error } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => ownService.getPayment(paymentId!),
    enabled: !!paymentId,
  });

  // Inject Midtrans Snap.js once
  useEffect(() => {
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY as string;
    if (!clientKey) {
      console.error('Midtrans client key not found');
      setSnapError(true);
      return;
    }
    if (snapScriptRef.current) return;

    const script = document.createElement('script');
    script.src = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', clientKey);
    
    script.onload = () => {
      console.log('✅ Midtrans Snap loaded successfully');
      setSnapReady(true);
      setSnapError(false);
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Midtrans Snap script');
      setSnapError(true);
      setSnapReady(false);
    };

    document.head.appendChild(script);
    snapScriptRef.current = script;

    return () => {
      if (snapScriptRef.current) {
        document.head.removeChild(snapScriptRef.current);
        snapScriptRef.current = null;
      }
    };
  }, []);

  // Auto-embed when snap is ready and payment token exists
  useEffect(() => {
    if (snapReady && payment?.snap_token && !snapEmbedded.current && window.snap) {
      console.log('🎯 Embedding Midtrans payment form...');
      snapEmbedded.current = true;
      setPaymentState('embedded');
      
      window.snap.embed(payment.snap_token, {
        embedId: 'snap-container',
        onSuccess: (result) => {
          console.log('✅ Payment success:', result);
          setPaymentState('success');
        },
        onPending: (result) => {
          console.log('⏳ Payment pending:', result);
          setPaymentState('pending');
        },
        onError: (result) => {
          console.error('❌ Payment error:', result);
          setPaymentState('error');
        },
      });
    }
  }, [snapReady, payment?.snap_token]);

  const retrySnapInit = () => {
    setSnapError(false);
    setSnapReady(false);
    snapEmbedded.current = false;
    
    if (snapScriptRef.current) {
      document.head.removeChild(snapScriptRef.current);
      snapScriptRef.current = null;
    }

    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY as string;
    const script = document.createElement('script');
    script.src = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', clientKey);
    
    script.onload = () => {
      setSnapReady(true);
      setSnapError(false);
    };
    
    script.onerror = () => {
      setSnapError(true);
      setSnapReady(false);
    };

    document.head.appendChild(script);
    snapScriptRef.current = script;
  };

  if (isLoading) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-400 mx-auto" />
          <p className="text-slate-500 mt-4 text-sm">Loading payment details…</p>
        </div>
      </main>
    );
  }

  if (error || !payment) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="h-16 w-16 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Payment Not Found</h2>
          <p className="text-slate-500 text-sm mt-1 mb-6">This payment may have expired or does not exist.</p>
          <button onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Go Back
          </button>
        </div>
      </main>
    );
  }

  if (paymentState === 'success') {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="h-20 w-20 rounded-3xl bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Payment Successful!</h2>
          <p className="text-slate-500 mt-2 text-sm">Your payment has been confirmed. The seller will prepare your shipment soon.</p>
          <button onClick={() => navigate(`/auctions/${auctionId}`)}
            className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
            View Auction
          </button>
        </div>
      </main>
    );
  }

  if (paymentState === 'pending') {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="h-20 w-20 rounded-3xl bg-yellow-100 flex items-center justify-center mx-auto mb-5">
            <CreditCard className="h-10 w-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Payment Pending</h2>
          <p className="text-slate-500 mt-2 text-sm">Your payment is being processed. Please complete it if you were redirected to a payment page.</p>
          <button onClick={() => navigate(`/auctions/${auctionId}`)}
            className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
            Back to Auction
          </button>
        </div>
      </main>
    );
  }

  if (paymentState === 'error') {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="h-20 w-20 rounded-3xl bg-red-100 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Payment Failed</h2>
          <p className="text-slate-500 mt-2 text-sm">Something went wrong during the payment process. Please try again.</p>
          <div className="flex gap-3 mt-6">
            <button onClick={() => navigate(`/auctions/${auctionId}`)}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              Back
            </button>
            <button onClick={() => setPaymentState('idle')}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Left: Payment Info */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 text-white">
              <div className="flex items-center gap-2.5 mb-1">
                <CreditCard className="h-5 w-5" />
                <h2 className="font-bold text-lg">Payment Details</h2>
              </div>
              <p className="text-indigo-100 text-xs">Secure payment by Midtrans</p>
            </div>

            {/* Product info */}
            {payment.auction?.product && (
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                {payment.auction.product.cover_image_link ? (
                  <img
                    src={payment.auction.product.cover_image_link}
                    alt={payment.auction.product.name}
                    className="h-14 w-14 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-5 w-5 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">{payment.auction.product.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Auction #{auctionId?.slice(0, 8)?.toUpperCase()}</p>
                </div>
              </div>
            )}

            {/* Payment summary */}
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Total Amount</span>
                <span className="font-bold text-slate-900 text-xl">{formatIDR(payment.amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  payment.status === 'WAITING_FOR_PAYMENT' ? 'bg-yellow-100 text-yellow-700' :
                  payment.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {payment.status.replace(/_/g, ' ')}
                </span>
              </div>
              {payment.expired_at && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-xs">Pay before</p>
                      <p className="font-semibold">{formatDate(payment.expired_at)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <p className="text-sm text-blue-900 font-medium mb-2">💡 Payment Instructions</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Choose your payment method on the right</li>
              <li>• Complete payment within the time limit</li>
              <li>• Payment confirmation is automatic</li>
            </ul>
          </div>
        </div>

        {/* Right: Midtrans Embed */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {!snapReady && !snapError && (
              <div className="flex flex-col items-center justify-center py-20 px-6">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-400 mb-4" />
                <p className="text-slate-500 text-sm">Loading payment gateway...</p>
              </div>
            )}

            {snapError && (
              <div className="flex flex-col items-center justify-center py-20 px-6">
                <div className="h-16 w-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
                <p className="text-slate-900 font-semibold mb-1">Failed to load payment</p>
                <p className="text-slate-500 text-sm mb-4">Please check your connection and retry</p>
                <button
                  onClick={retrySnapInit}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {payment.snap_token && snapReady && !snapError && (
              <div id="snap-container" className="min-h-[600px]" />
            )}

            {!payment.snap_token && !isLoading && (
              <div className="flex flex-col items-center justify-center py-20 px-6">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-400 mb-4" />
                <p className="text-slate-500 text-sm">Preparing payment token...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
