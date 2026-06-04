import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ownService } from '../services/own.service';
import { useToast } from '../../../contexts/toast-context';
import { ToastType } from '../../../enums/toast-type';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Edit3, X, CheckCircle, BadgeCheck, Calendar, Gavel, Package, Loader2, ShieldCheck, Upload, ChevronRight } from 'lucide-react';

const formatDate = (s?: string) => {
  if (!s) return '-';
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

export default function ProfilePage() {
  const { showToast } = useToast();
  const qc = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['own-profile'],
    queryFn: () => ownService.getProfile(),
  });

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
    onError: (e: any) => showToast(e.message, ToastType.ERROR),
  });

  const isBidder = user?.roles?.some((r) => r.role === 'BIDDER') ?? false;

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
        return ownService.createRoleRequest({ role: 'SELLER', bank_account_number: sellerBankAccount });
      }
    },
    onSuccess: (res, role) => {
      showToast(res.message || `${role} role requested!`, ToastType.SUCCESS);
      setRequestedRole(role);
      qc.invalidateQueries({ queryKey: ['own-profile'] });
    },
    onError: (e: any) => showToast(e.message ?? 'Failed to submit request', ToastType.ERROR),
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
  const showRoleCard = !isBidder || !isSeller;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12 space-y-5">

      {/* â”€â”€ Avatar & name â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex flex-col items-center gap-3 pb-2">
        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center ring-4 ring-white shadow-md">
          <User className="h-10 w-10 text-indigo-500" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">{user.fullname}</h1>
          <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
            {user.is_verified && (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified
              </span>
            )}
            {user.roles?.map((r) => (
              <span key={r.id} className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">
                {r.role}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* â”€â”€ Profile info â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <User className="h-4 w-4 text-indigo-600" />
            </div>
            <span className="font-semibold text-slate-800">Profile Information</span>
          </div>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50">
              <Edit3 className="h-4 w-4" /> Edit
            </button>
          )}
        </div>

        <div className="p-5">
          {!isEditing ? (
            <div className="divide-y divide-slate-100">
              {[
                { icon: User, label: 'Full Name', value: user.fullname },
                { icon: Calendar, label: 'Date of Birth', value: formatDate(user.birth) },
                { icon: User, label: 'Gender', value: user.gender || 'â€”' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <item.icon className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-500">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                  </div>
                </div>
              ))}
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
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 text-sm">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  {isPending ? 'Savingâ€¦' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* â”€â”€ Role requests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {showRoleCard && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-purple-50 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-purple-600" />
            </div>
            <span className="font-semibold text-slate-800">Role Access</span>
          </div>
          <div className="p-5 space-y-4">

            {/* Bidder role */}
            {!isBidder && (
              <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Gavel className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Become a Bidder</p>
                    <p className="text-xs text-slate-500">Participate in live auctions and place bids.</p>
                  </div>
                </div>
                {requestedRole === 'BIDDER' ? (
                  <p className="text-xs text-emerald-600 font-medium text-center py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                    âœ“ Request sent â€” awaiting approval
                  </p>
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
                          bidderIdentityFile ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-500'
                        }`}>
                        <Upload className="h-3.5 w-3.5 flex-shrink-0" />
                        {bidderIdentityFile ? bidderIdentityFile.name : 'Upload KTP photo'}
                      </button>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Selfie with Identity Card *</label>
                      <input type="file" accept="image/*" ref={bidderSelfieRef} className="hidden"
                        onChange={(e) => setBidderSelfieFile(e.target.files?.[0] ?? null)} />
                      <button type="button" onClick={() => bidderSelfieRef.current?.click()}
                        className={`w-full flex items-center gap-2 border border-dashed rounded-xl px-3 py-2.5 text-xs transition-colors ${
                          bidderSelfieFile ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-500'
                        }`}>
                        <Upload className="h-3.5 w-3.5 flex-shrink-0" />
                        {bidderSelfieFile ? bidderSelfieFile.name : 'Upload selfie holding KTP'}
                      </button>
                    </div>
                    <button onClick={() => requestRole('BIDDER')} disabled={isRequestingRole}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                      {isRequestingRole ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                      Request Bidder Role
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Seller role */}
            {isBidder && !isSeller && (
              <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Package className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Become a Seller</p>
                    <p className="text-xs text-slate-500">List products and run your own auctions.</p>
                  </div>
                </div>
                {requestedRole === 'SELLER' ? (
                  <p className="text-xs text-emerald-600 font-medium text-center py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                    âœ“ Request sent â€” awaiting approval
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Bank Account Number *</label>
                      <Input placeholder="Enter your bank account number" value={sellerBankAccount}
                        onChange={(e) => setSellerBankAccount(e.target.value)} inputMode="numeric" className="text-sm h-9" />
                    </div>
                    <button onClick={() => requestRole('SELLER')} disabled={isRequestingRole}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
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
