import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ownService } from '../services/own.service';
import { useProfile } from '../hooks/use-profile';
import { useToast } from '../../../contexts/toast-context';
import { ToastType } from '../../../enums/toast-type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldAlert, Gavel, Package, Loader2, Upload } from 'lucide-react';

const ROLE_CONFIG = {
  BIDDER: {
    icon: <Gavel className="h-14 w-14 text-slate-300" />,
    title: 'Bidder Access Required',
    description: 'You need the Bidder role to place bids and track your bid history.',
    features: ['Place bids on live auctions', 'Track all your bids in one place', 'Get notified when you win'],
    buttonLabel: 'Request Bidder Role',
  },
  SELLER: {
    icon: <Package className="h-14 w-14 text-slate-300" />,
    title: 'Seller Access Required',
    description: 'You need the Seller role to list products and schedule auctions.',
    features: ['List your products for review', 'Schedule and manage auctions', 'Receive payments from winning bids'],
    buttonLabel: 'Request Seller Role',
  },
} as const;

interface Props {
  requiredRole: keyof typeof ROLE_CONFIG;
  children: React.ReactNode;
}

export default function RoleGate({ requiredRole, children }: Props) {
  const { data: user, isLoading } = useProfile();
  const { showToast } = useToast();
  const qc = useQueryClient();

  // BIDDER fields
  const [nik, setNik] = useState('');
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const identityRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  // SELLER fields
  const [bankAccount, setBankAccount] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankName, setBankName] = useState('');

  const isSuperAdmin = user?.roles?.some((r) => r.role === 'SUPERADMIN') ?? false;
  const hasRole = user?.roles?.some((r) => r.role === requiredRole) ?? false;
  const hasBidderRole = user?.roles?.some((r) => r.role === 'BIDDER') ?? false;
  const needsBidderFirst = requiredRole === 'SELLER' && !hasBidderRole;

  const { mutate: requestRole, isPending, isSuccess } = useMutation({
    mutationFn: async () => {
      if (requiredRole === 'BIDDER') {
        if (!nik.trim()) throw new Error('NIK is required');
        if (!identityFile) throw new Error('Identity card image is required');
        if (!selfieFile) throw new Error('Selfie with identity card is required');
        const [identity_image_path, selfie_identity_image_path] = await Promise.all([
          ownService.uploadFile(identityFile),
          ownService.uploadFile(selfieFile),
        ]);
        return ownService.createRoleRequest({ role: 'BIDDER', nik, identity_image_path, selfie_identity_image_path });
      } else {
        if (!hasBidderRole) throw new Error('You must have the Bidder role before requesting Seller access');
        if (!bankAccount.trim()) throw new Error('Bank account number is required');
        if (!bankAccountName.trim()) throw new Error('Bank account name is required');
        if (!bankName.trim()) throw new Error('Bank name is required');
        return ownService.createRoleRequest({
          role: 'SELLER',
          bank_account_number: bankAccount,
          bank_account_name: bankAccountName,
          bank_name: bankName,
        });
      }
    },
    onSuccess: (res) => {
      showToast(res.message || 'Role request submitted!', ToastType.SUCCESS);
      qc.invalidateQueries({ queryKey: ['own-profile'] });
    },
    onError: (e: unknown) => showToast(e instanceof Error ? e.message : 'Failed to submit request', ToastType.ERROR),
  });

  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </main>
    );
  }

  if (hasRole || isSuperAdmin) return <>{children}</>;

  if (needsBidderFirst) {
    return (
      <main className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="flex flex-col items-center gap-5">
          <div className="h-28 w-28 rounded-full bg-slate-50 flex items-center justify-center">
            <Gavel className="h-14 w-14 text-slate-300" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Bidder Role Required First</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Become a Bidder First</h1>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              You must have the Bidder role before you can request the Seller role. Please request Bidder access first and wait for admin approval.
            </p>
          </div>
          <ul className="w-full text-left space-y-2 bg-gray-50 rounded-xl p-4">
            {ROLE_CONFIG.BIDDER.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400">
            Once your Bidder role is approved, you can come back here to request Seller access.
          </p>
        </div>
      </main>
    );
  }

  const cfg = ROLE_CONFIG[requiredRole];

  return (
    <main className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="flex flex-col items-center gap-5">
        <div className="h-28 w-28 rounded-full bg-slate-50 flex items-center justify-center">
          {cfg.icon}
        </div>

        <div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Access Restricted</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{cfg.title}</h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">{cfg.description}</p>
        </div>

        <ul className="w-full text-left space-y-2 bg-gray-50 rounded-xl p-4">
          {cfg.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {isSuccess ? (
          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-medium">
             Request submitted  awaiting admin approval
          </div>
        ) : (
          <div className="w-full space-y-3 text-left">
            {requiredRole === 'BIDDER' && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">NIK (National ID Number) *</label>
                  <Input
                    placeholder="Enter your NIK"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    maxLength={16}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Identity Card Photo *</label>
                  <input type="file" accept="image/*" ref={identityRef} className="hidden" onChange={(e) => setIdentityFile(e.target.files?.[0] ?? null)} />
                  <button
                    type="button"
                    onClick={() => identityRef.current?.click()}
                    className="w-full flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-500 hover:border-slate-400 hover:text-slate-500 transition-colors"
                  >
                    <Upload className="h-4 w-4 flex-shrink-0" />
                    {identityFile ? identityFile.name : 'Upload identity card'}
                  </button>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Selfie with Identity Card *</label>
                  <input type="file" accept="image/*" ref={selfieRef} className="hidden" onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)} />
                  <button
                    type="button"
                    onClick={() => selfieRef.current?.click()}
                    className="w-full flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-500 hover:border-slate-400 hover:text-slate-500 transition-colors"
                  >
                    <Upload className="h-4 w-4 flex-shrink-0" />
                    {selfieFile ? selfieFile.name : 'Upload selfie holding your identity card'}
                  </button>
                </div>
              </>
            )}
            {requiredRole === 'SELLER' && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Bank Account Number *</label>
                  <Input
                    placeholder="Enter your bank account number"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Bank Account Name *</label>
                  <Input
                    placeholder="Enter your account holder name"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Bank Name *</label>
                  <Input
                    placeholder="Enter your bank name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
              </>
            )}
            <Button
              disabled={isPending}
              onClick={() => requestRole()}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white"
            >
              {isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
              ) : (
                cfg.buttonLabel
              )}
            </Button>
          </div>
        )}

        <p className="text-xs text-gray-400">
          Requests are typically reviewed within 12 business days.
        </p>
      </div>
    </main>
  );
}
