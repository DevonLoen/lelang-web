import { apiClient } from '../../../lib/axios';
import type { UserAddressResponse } from '../../auction/services/auction.schema';

const throwMsg = (e: unknown, fallback: string): never => {
  if (e instanceof Error) throw new Error(e.message || fallback);
  throw new Error(fallback);
};

export const userAddressService = {
  get: async (userAddressId: string | number): Promise<UserAddressResponse> => {
    try {
      const res = await apiClient.get(`/user-addresses/${userAddressId}`);
      return res.data.user_address;
    } catch (e) {
      return throwMsg(e, 'Failed to load address');
    }
  },
};
