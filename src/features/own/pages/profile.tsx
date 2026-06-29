import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ownService } from '../services/own.service';
import { useToast } from '../../../contexts/toast-context';
import { ToastType } from '../../../enums/toast-type';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Edit3, X, CheckCircle, BadgeCheck, Calendar, Gavel, Package, Loader2, ShieldCheck, Upload, ChevronRight, Mail, CreditCard, IdCard, Landmark, WalletCards } from 'lucide-react';
import { useLocation } from 'react-router';

const formatDate = (s?: string) => {
  if (!s) return '-';
  return new Date(s).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
};

const getErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

const formatIDR = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export default function ProfilePage() {
  const { showToast } = useToast();
  const qc = useQueryClient();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['own-profile'],
    queryFn: () => ownService.getProfile(),
  });

  useEffect(() => {
    if (location.hash !== '#role-access' || isLoading) return;
    requestAnimationFrame(() => document.getElementById('role-access')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [isLoading, location.hash]);

  const [form, setForm] = useState({
    fullname: '',
    birth: '',
    gender: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullname: user.fullname ?? '',
        birth: user.birth ? user.birth.split('T')[0] : '',
        gender: user.gender ?? '',
      });
    }
  }, [user]);

  const { mutate: update, isPending } = useMutation({
    mutationFn: () =>
      ownService.updateProfile({
        fullname: form.fullname,
        birth: form.birth,
        gender: form.gender || undefined,
      }),
    onSuccess: (res) => {
      showToast(res.message || 'Profile updated!', ToastType.SUCCESS);
      setIsEditing(false);
      qc.invalidateQueries({ queryKey: ['own-profile'] });
    },
    onError: (e: unknown) => showToast(getErrorMessage(e, 'Failed to update profile'), ToastType.ERROR),
  });

  const isBidder = user?.roles?.some((r) => r.role === 'BIDDER') ?? false;
  const isSuperAdmin = user?.roles?.some((r) => r.role === 'SUPERADMIN') ?? false;

  // Role requests
  const [requestedRole, setRequestedRole] = useState<string | null>(null);
  // BIDDER fields
  const [bidderNik, setBidderNik] = useState('');
  const [bidderIdentityFile, setBidderIdentityFile] = useState<File | null>(null);
  const [bidderSelfieFile, setBidderSelfieFile] = useState<File | null>(null);
  const bidderIdentityRef = useRef<HTMLInputElement>(null);
  const bidderSelfieRef = useRef<HTMLInputElement>(null);
  // SELLER fields
  const [sellerBankAccount, setSellerBankAccount] = useState('');
  const [sellerBankAccountName, setSellerBankAccountName] = useState('');
  const [sellerBankName, setSellerBankName] = useState('');

  const { mutate: requestRole, isPending: isRequestingRole } = useMutation({
    mutationFn: async (role: string) => {
      if (role === 'BIDDER') {
        if (!bidderNik.trim()) throw new Error('NIK is required');
        if (!bidderIdentityFile) throw new Error('Identity card image is required');
        if (!bidderSelfieFile) throw new Error('Selfie with identity card is required');
        const [identity_image_path, selfie_identity_image_path] = await Promise.all([
          ownService.uploadFile(bidderIdentityFile),
          ownService.uploadFile(bidderSelfieFile),
        ]);
        return ownService.createRoleRequest({ role: 'BIDDER', nik: bidderNik, identity_image_path, selfie_identity_image_path });
      } else {
        if (!isBidder) throw new Error('You must have the Bidder role before requesting Seller access');
        if (!sellerBankAccount.trim()) throw new Error('Bank account number is required');
        if (!sellerBankAccountName.trim()) throw new Error('Bank account name is required');
        if (!sellerBankName.trim()) throw new Error('Bank name is required');
        return ownService.createRoleRequest({
          role: 'SELLER',
          bank_account_number: sellerBankAccount,
          bank_account_name: sellerBankAccountName,
          bank_name: sellerBankName,
        });
      }
    },
    onSuccess: (res, role) => {
      showToast(res.message || `${role} role requested!`, ToastType.SUCCESS);
      setRequestedRole(role);
      qc.invalidateQueries({ queryKey: ['own-profile'] });
    },
    onError: (e: unknown) => showToast(getErrorMessage(e, 'Failed to submit request'), ToastType.ERROR),
  });

  const handleChange = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  if (isLoading) return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="animate-pulse space-y-4">
        <div className="h-24 w-24 rounded-full bg-slate-100 mx-auto" />
        <div className="h-8 w-1/2 bg-slate-100 rounded mx-auto" />
        <div className="h-40 bg-slate-100 rounded-2xl" />
      </div>
    </main>
  );

  if (!user) return <div className="text-center py-20 text-slate-400">Failed to load profile.</div>;

  const isSeller = user.roles?.some((r) => r.role === 'SELLER') ?? false;
  const pendingBidderRequest = requestedRole === 'BIDDER' || user.role_requests?.some((request) => request.role === 'BIDDER' && request.status === 'REQUESTED');
  const pendingSellerRequest = requestedRole === 'SELLER' || user.role_requests?.some((request) => request.role === 'SELLER' && request.status === 'REQUESTED');
  const showRoleCard = !isSuperAdmin && (!isBidder || !isSeller);

  return (
    <main className="bidify-page-narrow space-y-5">
      <div className="flex flex-col items-center gap-3 pb-2">
        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center ring-4 ring-white shadow-md">
          <User className="h-10 w-10 text-slate-500" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">{user.fullname}</h1>
          <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
            {user.is_verified && (
              <span className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified
              </span>
            )}
            {user.roles?.map((r) => (
              <span key={r.id} className="text-xs font-semibold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full">
                {r.role}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bidify-panel overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center">
              <User className="h-4 w-4 text-slate-700" />
            </div>
            <span className="font-semibold text-slate-800">Profile Information</span>
          </div>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50">
              <Edit3 className="h-4 w-4" /> Edit
            </button>
          )}
        </div>

        <div className="p-5">
          {!isEditing ? (
            <div className="divide-y divide-slate-100">
              {[
                { icon: User, label: 'Full Name', value: user.fullname },
                { icon: Mail, label: 'Email', value: user.email },
                { icon: IdCard, label: 'NIK', value: user.nik || '-' },
                { icon: Calendar, label: 'Date of Birth', value: formatDate(user.birth) },
                { icon: User, label: 'Gender', value: user.gender || '-' },
                { icon: WalletCards, label: 'Balance', value: formatIDR(user.balance ?? 0) },
                { icon: Landmark, label: 'Bank Name', value: user.bank_name || '-' },
                { icon: User, label: 'Bank Account Name', value: user.bank_account_name || '-' },
                { icon: CreditCard, label: 'Bank Account Number', value: user.bank_account_number || '-' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <item.icon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <div className="flex min-w-0 flex-1 flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span className="text-sm text-slate-500">{item.label}</span>
                    <span className="break-words text-left text-sm font-semibold text-slate-900 sm:text-right">{item.value}</span>
                  </div>
                </div>
              ))}

              {(user.identity_image_link || user.selfie_identity_image_link) && (
                <div className="pt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Identity Documents</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {user.identity_image_link && (
                      <a href={user.identity_image_link} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <img src={user.identity_image_link} alt="Identity card" className="h-36 w-full object-cover transition-transform group-hover:scale-[1.02]" />
                        <p className="px-3 py-2 text-xs font-semibold text-slate-700">Identity Card</p>
                      </a>
                    )}
                    {user.selfie_identity_image_link && (
                      <a href={user.selfie_identity_image_link} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <img src={user.selfie_identity_image_link} alt="Selfie with identity card" className="h-36 w-full object-cover transition-transform group-hover:scale-[1.02]" />
                        <p className="px-3 py-2 text-xs font-semibold text-slate-700">Selfie Verification</p>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Full Name *</label>
                <Input value={form.fullname} onChange={(e) => handleChange('fullname', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Date of Birth</label>
                <Input type="date" value={form.birth} onChange={(e) => handleChange('birth', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Gender</label>
                <Select value={form.gender} onValueChange={(v) => handleChange('gender', v)}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5">
                  <X className="h-4 w-4" /> Cancel
                </button>
                <button disabled={isPending} onClick={() => update()}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 text-sm">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  {isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showRoleCard && (
        <div id="role-access" className="bidify-panel scroll-mt-24 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-slate-600" />
            </div>
            <span className="font-semibold text-slate-800">Role Access</span>
          </div>
          <div className="p-5 space-y-4">

            {/* Bidder role */}
            {!isBidder && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Gavel className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Become a Bidder</p>
                    <p className="text-xs text-slate-500">Participate in live auctions and place bids.</p>
                  </div>
                </div>
                {pendingBidderRequest ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                    <p className="text-sm font-semibold text-amber-900">Bidder request is under review</p>
                    <p className="mt-1 text-xs text-amber-700">Inputs are locked until an admin approves or rejects your request.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">NIK *</label>
                      <Input placeholder="National ID number" value={bidderNik}
                        onChange={(e) => setBidderNik(e.target.value)} maxLength={16} className="text-sm h-9" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Identity Card Photo *</label>
                      <input type="file" accept="image/*" ref={bidderIdentityRef} className="hidden"
                        onChange={(e) => setBidderIdentityFile(e.target.files?.[0] ?? null)} />
                      <button type="button" onClick={() => bidderIdentityRef.current?.click()}
                        className={`w-full flex items-center gap-2 border border-dashed rounded-xl px-3 py-2.5 text-xs transition-colors ${
                          bidderIdentityFile ? 'border-slate-300 bg-slate-50 text-slate-800' : 'border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-500'
                        }`}>
                        <Upload className="h-3.5 w-3.5 flex-shrink-0" />
                        {bidderIdentityFile ? bidderIdentityFile.name : 'Upload identity card photo'}
                      </button>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Selfie with Identity Card *</label>
                      <input type="file" accept="image/*" ref={bidderSelfieRef} className="hidden"
                        onChange={(e) => setBidderSelfieFile(e.target.files?.[0] ?? null)} />
                      <button type="button" onClick={() => bidderSelfieRef.current?.click()}
                        className={`w-full flex items-center gap-2 border border-dashed rounded-xl px-3 py-2.5 text-xs transition-colors ${
                          bidderSelfieFile ? 'border-slate-300 bg-slate-50 text-slate-800' : 'border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-500'
                        }`}>
                        <Upload className="h-3.5 w-3.5 flex-shrink-0" />
                        {bidderSelfieFile ? bidderSelfieFile.name : 'Upload selfie holding your identity card'}
                      </button>
                    </div>
                    <button onClick={() => requestRole('BIDDER')} disabled={isRequestingRole}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                      {isRequestingRole ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                      Request Bidder Role
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Seller role */}
            {isBidder && !isSeller && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Package className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Become a Seller</p>
                    <p className="text-xs text-slate-500">List products and run your own auctions.</p>
                  </div>
                </div>
                {pendingSellerRequest ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                    <p className="text-sm font-semibold text-amber-900">Seller request is under review</p>
                    <p className="mt-1 text-xs text-amber-700">Inputs are locked until an admin approves or rejects your request.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Bank Account Number *</label>
                      <Input placeholder="Enter your bank account number" value={sellerBankAccount}
                        onChange={(e) => setSellerBankAccount(e.target.value)} inputMode="numeric" className="text-sm h-9" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Bank Account Name *</label>
                      <Input placeholder="Enter your account holder name" value={sellerBankAccountName}
                        onChange={(e) => setSellerBankAccountName(e.target.value)} className="text-sm h-9" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Bank Name *</label>
                      <Input placeholder="Enter your bank name" value={sellerBankName}
                        onChange={(e) => setSellerBankName(e.target.value)} className="text-sm h-9" />
                    </div>
                    <button onClick={() => requestRole('SELLER')} disabled={isRequestingRole}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                      {isRequestingRole ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                      Request Seller Role
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </main>
  );
}
