import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAddressService } from '../services/user-address.service';
import { biteshipService } from '../../biteship/services/biteship.service';
import { useToast } from '../../../contexts/toast-context';
import { ToastType } from '../../../enums/toast-type';
import { Input } from '@/components/ui/input';
import type { UserAddressResponse } from '../../auction/services/auction.schema';
import type { BiteshipAreaResponse } from '../../auction/services/auction.schema';
import type { UserAddressCreateRequest } from '../services/user-address.schema';
import { MapPin, Plus, Edit3, Trash2, Star, Search, X, CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';

const emptyForm = (): UserAddressCreateRequest => ({
  label: '',
  recipient_name: '',
  phone: '',
  city_id: '',
  city_name: '',
  province_name: '',
  address: '',
  postal_code: '',
  biteship_area_id: '',
  is_default: false,
});

export default function UserAddressesPage() {
  const { showToast } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<UserAddressCreateRequest>(emptyForm());
  const [areaSearch, setAreaSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: () => userAddressService.list(),
  });
  const addresses = data?.nodes ?? [];

  const { data: areas, isFetching: isSearching } = useQuery({
    queryKey: ['biteship-areas', areaSearch],
    queryFn: () => biteshipService.searchAreas(areaSearch),
    enabled: areaSearch.length >= 3 && !form.biteship_area_id,
  });

  const { mutate: createAddress, isPending: isCreating } = useMutation({
    mutationFn: () => userAddressService.create(form),
    onSuccess: () => {
      showToast('Address created!', ToastType.SUCCESS);
      cancelForm();
      qc.invalidateQueries({ queryKey: ['user-addresses'] });
    },
    onError: (e: any) => showToast(e.message, ToastType.ERROR),
  });

  const { mutate: updateAddress, isPending: isUpdating } = useMutation({
    mutationFn: () => userAddressService.update(editId!, form),
    onSuccess: () => {
      showToast('Address updated!', ToastType.SUCCESS);
      cancelForm();
      qc.invalidateQueries({ queryKey: ['user-addresses'] });
    },
    onError: (e: any) => showToast(e.message, ToastType.ERROR),
  });

  const { mutate: deleteAddress, isPending: isDeleting } = useMutation({
    mutationFn: (addrId: string) => userAddressService.delete(addrId),
    onSuccess: () => {
      showToast('Address deleted!', ToastType.SUCCESS);
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ['user-addresses'] });
    },
    onError: (e: any) => showToast(e.message, ToastType.ERROR),
  });

  const startEdit = (addr: UserAddressResponse) => {
    setEditId(addr.id);
    setForm({
      label: addr.label,
      recipient_name: addr.recipient_name,
      phone: addr.phone,
      city_id: addr.city_id,
      city_name: addr.city_name,
      province_name: addr.province_name,
      address: addr.address,
      postal_code: addr.postal_code,
      biteship_area_id: addr.biteship_area_id,
      is_default: addr.is_default,
    });
    setAreaSearch(`${addr.city_name}, ${addr.province_name}`);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectArea = (area: BiteshipAreaResponse) => {
    setForm(prev => ({
      ...prev,
      city_id: area.id,
      city_name: area.city,
      province_name: area.province,
      postal_code: String(area.postal_code),
      biteship_area_id: area.id,
    }));
    setAreaSearch(`${area.district}, ${area.city}, ${area.province}`);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm());
    setAreaSearch('');
  };

  const handleSubmit = () => {
    if (!form.label.trim()) return showToast('Label is required', ToastType.ERROR);
    if (!form.recipient_name.trim()) return showToast('Recipient name is required', ToastType.ERROR);
    if (!form.phone.trim()) return showToast('Phone is required', ToastType.ERROR);
    if (!form.address.trim()) return showToast('Address is required', ToastType.ERROR);
    if (!form.biteship_area_id) return showToast('Please select an area from the search results', ToastType.ERROR);
    if (editId) updateAddress();
    else createAddress();
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={() => navigate('/profile')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" /> Profile
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your shipping addresses</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm()); setAreaSearch(''); }}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl transition-colors">
            <Plus className="h-4 w-4" /> Add Address
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="font-semibold text-slate-800">{editId ? 'Edit Address' : 'New Address'}</span>
            </div>
            <button onClick={cancelForm} className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Label *</label>
                <Input
                  value={form.label}
                  onChange={(e) => setForm(p => ({ ...p, label: e.target.value }))}
                  placeholder="e.g. Home, Office"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Recipient Name *</label>
                <Input
                  value={form.recipient_name}
                  onChange={(e) => setForm(p => ({ ...p, recipient_name: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Phone *</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>

            {/* Area search */}
            <div className="relative">
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Area / District *</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-9"
                  value={areaSearch}
                  onChange={(e) => {
                    setAreaSearch(e.target.value);
                    setForm(p => ({ ...p, biteship_area_id: '', city_name: '', province_name: '', postal_code: '', city_id: '' }));
                  }}
                  placeholder="Type district or city name (min 3 chars)..."
                />
              </div>
              {isSearching && <p className="text-xs text-slate-400 mt-1">Searching...</p>}
              {areas && areas.length > 0 && !form.biteship_area_id && (
                <div className="absolute z-10 top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-52 overflow-y-auto">
                  {areas.map((area) => (
                    <button
                      key={area.id}
                      onClick={() => selectArea(area)}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
                    >
                      <p className="font-semibold text-slate-800">{area.district}</p>
                      <p className="text-xs text-slate-500">{area.city}, {area.province} {area.postal_code}</p>
                    </button>
                  ))}
                </div>
              )}
              {form.biteship_area_id && (
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {form.city_name}, {form.province_name} {form.postal_code}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Full Address *</label>
              <Input
                value={form.address}
                onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))}
                placeholder="Street, number, RT/RW, village..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={form.is_default ?? false}
                onChange={(e) => setForm(p => ({ ...p, is_default: e.target.checked }))}
                className="rounded border-slate-300"
              />
              <label htmlFor="isDefault" className="text-sm text-slate-700">Set as default address</label>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={cancelForm}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5">
                <X className="h-4 w-4" /> Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isCreating || isUpdating}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 text-sm">
                {isCreating || isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {isCreating || isUpdating ? 'Savingâ€¦' : 'Save Address'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address List */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No addresses yet</p>
          <p className="text-sm text-slate-400 mt-1">Add your first shipping address to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id} className={`bg-white rounded-2xl border overflow-hidden transition-colors ${
              addr.is_default ? 'border-indigo-300 shadow-sm shadow-indigo-50' : 'border-slate-200'
            }`}>
              <div className="flex items-start gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900">{addr.label}</span>
                    {addr.is_default && (
                      <span className="flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                        <Star className="h-3 w-3" /> Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700">{addr.recipient_name} &middot; {addr.phone}</p>
                  <p className="text-sm text-slate-600 mt-0.5">{addr.address}</p>
                  <p className="text-sm text-slate-500">{addr.city_name}, {addr.province_name} {addr.postal_code}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => startEdit(addr)}
                    className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors">
                    <Edit3 className="h-4 w-4 text-slate-600" />
                  </button>
                  {deleteId === addr.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => setDeleteId(null)}
                        className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors">
                        <X className="h-4 w-4 text-slate-500" />
                      </button>
                      <button
                        className="h-8 w-8 rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors disabled:opacity-60"
                        onClick={() => deleteAddress(addr.id)}
                        disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : <Trash2 className="h-4 w-4 text-white" />}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteId(addr.id)}
                      className="h-8 w-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
