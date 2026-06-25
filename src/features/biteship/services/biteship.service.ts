import { apiClient } from '../../../lib/axios';
import type { BiteshipAreaResponse } from '../../auction/services/auction.schema';

const throwMsg = (e: unknown, fallback: string): never => {
  if (e instanceof Error) throw new Error(e.message || fallback);
  throw new Error(fallback);
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
