import { apiClient } from '../../../lib/axios';
import type { BiteshipAreaResponse } from '../../auction/services/auction.schema';

const throwMsg = (e: any, fallback: string): never => {
  throw new Error(e?.response?.data?.message || e?.message || fallback);
};

export const biteshipService = {
  searchAreas: async (keyword: string): Promise<BiteshipAreaResponse[]> => {
    try {
      const res = await apiClient.post('/biteship/areas/filter', { keyword });
      return res.data.areas;
    } catch (e) {
      return throwMsg(e, 'Failed to search areas');
    }
  },
};
