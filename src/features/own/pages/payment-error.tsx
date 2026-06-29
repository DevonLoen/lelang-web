import { AlertCircle, ArrowLeft, ReceiptText } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';

export default function PaymentErrorPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-100">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900">Payment Failed</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Midtrans could not complete your payment. No successful payment has been recorded. Please review the payment and try again.
        </p>

        {orderId && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Order ID</p>
            <p className="mt-1 break-all text-sm font-semibold text-slate-700">{orderId}</p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
          <Link
            to="/own/payments"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <ReceiptText className="h-4 w-4" />
            My Payments
          </Link>
        </div>
      </div>
    </main>
  );
}
