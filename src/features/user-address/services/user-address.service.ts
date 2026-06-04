import { apiClient } from '../../../lib/axios';
import type {
  UserAddressCreateRequest,
  UserAddressUpdateRequest,
  UserAddressFetchRequest,
} from './user-address.schema';
import type {
  UserAddressResponse,
  PaginatedData,
} from '../../auction/services/auction.schema';

const throwMsg = (e: any, fallback: string): never => {
  throw new Error(e?.response?.data?.message || e?.message || fallback);
};

export const userAddressService = {
  list: async (params: UserAddressFetchRequest = {}): Promise<PaginatedData<UserAddressResponse>> => {
    try {
      const res = await apiClient.post('/user-addresses/filter', params);
      return res.data;
    } catch (e) {
      return throwMsg(e, 'Failed to load addresses');
    }
  },

  get: async (userAddressId: string): Promise<UserAddressResponse> => {
    try {
      const res = await apiClient.get(`/user-addresses/${userAddressId}`);
      return res.data.user_address;
    } catch (e) {
      return throwMsg(e, 'Failed to load address');
    }
  },

  create: async (payload: UserAddressCreateRequest): Promise<UserAddressResponse> => {
    try {
      const res = await apiClient.post('/user-addresses', payload);
      return res.data.user_address;
    } catch (e) {
      return throwMsg(e, 'Failed to create address');
    }
  },

  update: async (userAddressId: string, payload: UserAddressUpdateRequest): Promise<UserAddressResponse> => {
    try {
      const res = await apiClient.put(`/user-addresses/${userAddressId}`, payload);
      return res.data.user_address;
    } catch (e) {
      return throwMsg(e, 'Failed to update address');
    }
  },

  delete: async (userAddressId: string): Promise<void> => {
    try {
      await apiClient.delete(`/user-addresses/${userAddressId}`);
    } catch (e) {
      return throwMsg(e, 'Failed to delete address');
    }
  },
};
