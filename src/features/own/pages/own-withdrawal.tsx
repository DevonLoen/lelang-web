import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ownService } from '../services/own.service';
import { useToast } from '../../../contexts/toast-context';
import { ToastType } from '../../../enums/toast-type';
import { Input } from '@/components/ui/input';
import { Wallet, Loader2, CheckCircle, ArrowDownToLine, BadgeCheck, AlertCircle } from 'lucide-react';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

export default function OwnWithdrawalPage() {
  const { showToast } = useToast();
  const qc = useQueryClient();
  const [amount, setAmount] = useState('');

  const { data: user, isLoading } = useQuery({
    queryKey: ['own-profile'],
    queryFn: () => ownService.getProfile(),
  });

  const {
    mutate: requestWithdrawal,
    isPending,
    isSuccess,
    reset,
  } = useMutation({
    mutationFn: () => {
      const n = Number(amount);
      if (!n || n <= 0) throw new Error('Enter a valid amount');
      if (user?.balance !== undefined && n > user.balance) throw new Error('Amount exceeds your available balance');
      return ownService.createWithdrawalRequest({ amount: n });
    },
    onSuccess: (res) => {
      showToast(res.message || 'Withdrawal request submitted!', ToastType.SUCCESS);
      setAmount('');
      qc.invalidateQueries({ queryKey: ['own-profile'] });
    },
    onError: (e: any) => showToast(e.message ?? 'Failed to submit withdrawal', ToastType.ERROR),
  });

  const handleSubmit = () => {
    reset();
    requestWithdrawal();
  };

  const balance = user?.balance ?? 0;
  const parsedAmount = Number(amount);
  const isOverBalance = parsedAmount > balance;

  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Withdrawal</h1>
        <p className="text-sm text-slate-500 mt-1">Transfer your auction earnings to your registered bank account.</p>
      </div>

      {/* Balance card */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <p className="text-sm font-medium text-indigo-100">Available Balance</p>
        </div>
        <p className="text-4xl font-bold tracking-tight">{formatCurrency(balance)}</p>
        {user?.bank_account_number ? (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-indigo-200">
            <BadgeCheck className="h-3.5 w-3.5" />
            Bank account: {user.bank_account_number}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-indigo-200">
            <AlertCircle className="h-3.5 w-3.5" />
            No bank account registered — request Seller role first
          </div>
        )}
      </div>

      {/* Withdrawal form */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center">
            <ArrowDownToLine className="h-4 w-4 text-indigo-600" />
          </div>
          <span className="font-semibold text-slate-800">Request Withdrawal</span>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium select-none">Rp</span>
              <Input
                type="number"
                min={1}
                max={balance}
                placeholder="0"
                className="pl-9"
                value={amount}
                onChange={(e) => { reset(); setAmount(e.target.value); }}
              />
            </div>
            {isOverBalance && parsedAmount > 0 && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Amount exceeds your available balance of {formatCurrency(balance)}
              </p>
            )}
          </div>

          {/* Quick amount buttons */}
          {balance > 0 && (
            <div className="flex flex-wrap gap-2">
              {[0.25, 0.5, 0.75, 1].map((frac) => {
                const val = Math.floor(balance * frac);
                return (
                  <button
                    key={frac}
                    type="button"
                    onClick={() => { reset(); setAmount(String(val)); }}
                    className="text-xs px-3 py-1.5 rounded-full border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
                  >
                    {frac === 1 ? 'Max' : `${frac * 100}%`}
                  </button>
                );
              })}
            </div>
          )}

          {isSuccess ? (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              Request submitted — we'll process it to your bank account shortly.
            </div>
          ) : (
            <button
              disabled={isPending || !amount || isOverBalance || balance === 0}
              onClick={handleSubmit}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
              {isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                <><ArrowDownToLine className="h-4 w-4" /> Withdraw</>
              )}
            </button>
          )}

          <p className="text-xs text-slate-400 text-center">
            Withdrawals are typically processed within 1–3 business days.
          </p>
        </div>
      </div>
    </main>
  );
}
