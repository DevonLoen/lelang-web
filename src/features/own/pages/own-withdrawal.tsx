import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ownService } from '../services/own.service';
import { useToast } from '../../../contexts/toast-context';
import { ToastType } from '../../../enums/toast-type';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { WithdrawalRequestStatus } from '../services/own.schema';
import { Wallet, Loader2, CheckCircle, ArrowDownToLine, BadgeCheck, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

const formatDate = (value: string) =>
  new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const getErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

const STATUS_OPTIONS: { label: string; value: WithdrawalRequestStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'REQUESTED', value: 'REQUESTED' },
  { label: 'COMPLETED', value: 'COMPLETED' },
];

export default function OwnWithdrawalPage() {
  const { showToast } = useToast();
  const qc = useQueryClient();
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<WithdrawalRequestStatus | ''>('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: user, isLoading } = useQuery({
    queryKey: ['own-profile'],
    queryFn: () => ownService.getProfile(),
  });

  const {
    data: withdrawalData,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError,
  } = useQuery({
    queryKey: ['own-withdrawal-requests', status, page],
    queryFn: () =>
      ownService.listWithdrawalRequests({
        page,
        limit,
        ...(status ? { status } : {}),
        sorts: [{ field: 'created_at', direction: 'desc' }],
      }),
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
      qc.invalidateQueries({ queryKey: ['own-withdrawal-requests'] });
    },
    onError: (e: unknown) => showToast(getErrorMessage(e, 'Failed to submit withdrawal'), ToastType.ERROR),
  });

  const handleSubmit = () => {
    reset();
    requestWithdrawal();
  };

  const balance = user?.balance ?? 0;
  const parsedAmount = Number(amount);
  const isOverBalance = parsedAmount > balance;
  const withdrawalRequests = withdrawalData?.nodes ?? [];
  const total = withdrawalData?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Withdrawal</h1>
        <p className="mt-1 text-sm text-slate-500">Transfer your auction earnings and monitor request status.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white shadow-lg">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-medium text-indigo-100">Available Balance</p>
            </div>
            <p className="text-4xl font-bold tracking-tight">{formatCurrency(balance)}</p>
            {user?.bank_account_number ? (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-indigo-200">
                <BadgeCheck className="h-3.5 w-3.5" />
                Bank account: {user.bank_account_number}
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-indigo-200">
                <AlertCircle className="h-3.5 w-3.5" />
                No bank account registered
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50">
                <ArrowDownToLine className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="font-semibold text-slate-800">Request Withdrawal</span>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 select-none text-sm font-medium text-slate-400">Rp</span>
                  <Input
                    type="number"
                    min={1}
                    max={balance}
                    placeholder="0"
                    className="pl-9"
                    value={amount}
                    onChange={(e) => {
                      reset();
                      setAmount(e.target.value);
                    }}
                  />
                </div>
                {isOverBalance && parsedAmount > 0 && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3" /> Amount exceeds your available balance of {formatCurrency(balance)}
                  </p>
                )}
              </div>

              {balance > 0 && (
                <div className="flex flex-wrap gap-2">
                  {[0.25, 0.5, 0.75, 1].map((frac) => {
                    const val = Math.floor(balance * frac);
                    return (
                      <button
                        key={frac}
                        type="button"
                        onClick={() => {
                          reset();
                          setAmount(String(val));
                        }}
                        className="rounded-full border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
                      >
                        {frac === 1 ? 'Max' : `${frac * 100}%`}
                      </button>
                    );
                  })}
                </div>
              )}

              {isSuccess ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  Request submitted and history refreshed.
                </div>
              ) : (
                <button
                  disabled={isPending || !amount || isOverBalance || balance === 0}
                  onClick={handleSubmit}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownToLine className="h-4 w-4" />}
                  {isPending ? 'Submitting...' : 'Withdraw'}
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">Withdrawal History</h2>
              <p className="mt-0.5 text-xs text-slate-500">{total} request{total !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => {
                    setStatus(option.value);
                    setPage(1);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    status === option.value ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {isHistoryLoading ? (
            <div className="flex min-h-80 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
            </div>
          ) : isHistoryError ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center text-red-500">
              <AlertCircle className="mb-3 h-10 w-10 opacity-30" />
              <p className="font-semibold">Failed to load withdrawal history</p>
              <p className="mt-1 text-sm">{historyError instanceof Error ? historyError.message : 'Please try again later'}</p>
            </div>
          ) : withdrawalRequests.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center text-slate-500">
              <Wallet className="mb-3 h-10 w-10 opacity-30" />
              <p className="font-semibold">No withdrawal requests</p>
              <p className="mt-1 text-sm">Requests will appear here after you submit one.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {withdrawalRequests.map((request) => (
                <div key={request.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{formatCurrency(request.amount)}</p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          request.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Created {formatDate(request.created_at)}</p>
                    <p className="mt-0.5 text-xs text-slate-400">Updated {formatDate(request.updated_at)}</p>
                  </div>
                  <div className="text-xs text-slate-400 sm:text-right">
                    <p>ID: {request.id}</p>
                    {request.validator_user_id && <p>Validator: {request.validator_user_id}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 border-t border-slate-100 px-5 py-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-9 w-9 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 text-sm font-medium text-slate-600">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="h-9 w-9 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
