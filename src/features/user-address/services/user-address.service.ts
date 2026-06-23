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
  get: async (userAddressId: string): Promise<UserAddressResponse> => {
    try {
      const res = await apiClient.get(`/user-addresses/${userAddressId}`);
      return res.data.user_address;
    } catch (e) {
      return throwMsg(e, 'Failed to load address');
    }
  },
};
