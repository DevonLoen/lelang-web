import { apiClient } from '../../../lib/axios';
import type {
  AuctionResponse,
  AuctionBidResponse,
  AuctionBidCreateRequest,
  AuctionFetchRequest,
  AuctionWinnerResponse,
  PaymentResponse,
  ShipmentResponse,
  PaginatedData,
} from './auction.schema';

const throwMsg = (e: any, fallback: string): never => {
  throw new Error(e?.response?.data?.error?.message || e?.message || fallback);
};

export const auctionService = {
  listAuctions: async (params: AuctionFetchRequest): Promise<PaginatedData<AuctionResponse>> => {
    try {
      const res = await apiClient.post('/auctions/filter', params);
      return res.data;
    } catch (e) {
      return throwMsg(e, 'Failed to load auctions');
    }
  },

  getAuction: async (auctionId: string): Promise<AuctionResponse> => {
    try {
      const res = await apiClient.get(`/auctions/${auctionId}`);
      return res.data.auction;
    } catch (e) {
      return throwMsg(e, 'Failed to load auction');
    }
  },

  listBids: async (auctionId: string, page = 1, limit = 50): Promise<PaginatedData<AuctionBidResponse>> => {
    try {
      const res = await apiClient.post(`/auctions/${auctionId}/bids/filter`, {
        page, limit, sorts: [{ field: 'amount', direction: 'desc' }],
      });
      return res.data;
    } catch (e) {
      return throwMsg(e, 'Failed to load bids');
    }
  },

  placeBid: async (auctionId: string, payload: AuctionBidCreateRequest): Promise<AuctionBidResponse> => {
    try {
      const res = await apiClient.post(`/auctions/${auctionId}/bids`, payload);
      return res.data.bid;
    } catch (e) {
      return throwMsg(e, 'Failed to place bid');
    }
  },

  listWinners: async (auctionId: string, page = 1, limit = 10): Promise<PaginatedData<AuctionWinnerResponse>> => {
    try {
      const res = await apiClient.post(`/auctions/${auctionId}/winners/filter`, { page, limit });
      return res.data;
    } catch (e) {
      return throwMsg(e, 'Failed to load winners');
    }
  },

  getWinner: async (auctionId: string, winnerId: string): Promise<AuctionWinnerResponse> => {
    try {
      const res = await apiClient.get(`/auctions/${auctionId}/winners/${winnerId}`);
      return res.data.winner;
    } catch (e) {
      return throwMsg(e, 'Failed to load winner');
    }
  },

  listPayments: async (auctionId: string): Promise<PaymentResponse[]> => {
    try {
      const res = await apiClient.post(`/auctions/${auctionId}/payments/filter`, {});
      return res.data.payments ?? [];
    } catch (e) {
      return throwMsg(e, 'Failed to load payments');
    }
  },

  getPayment: async (auctionId: string, paymentId: string): Promise<PaymentResponse> => {
    try {
      const res = await apiClient.get(`/auctions/${auctionId}/payments/${paymentId}`);
      return res.data.payment;
    } catch (e) {
      return throwMsg(e, 'Failed to load payment');
    }
  },

  listShipments: async (auctionId: string): Promise<ShipmentResponse[]> => {
    try {
      const res = await apiClient.post(`/auctions/${auctionId}/shipments/filter`, {});
      return res.data.shipments;
    } catch (e) {
      return throwMsg(e, 'Failed to load shipments');
    }
  },

  getShipment: async (auctionId: string, shipmentId: string): Promise<ShipmentResponse> => {
    try {
      const res = await apiClient.get(`/auctions/${auctionId}/shipments/${shipmentId}`);
      return res.data.shipment;
    } catch (e) {
      return throwMsg(e, 'Failed to load shipment');
    }
  },

  updateBuyerAddress: async (auctionId: string, shipmentId: string, address_id: string): Promise<ShipmentResponse> => {
    try {
      const res = await apiClient.patch(`/auctions/${auctionId}/shipments/${shipmentId}/buyer-address`, { address_id });
      return res.data.shipment;
    } catch (e) {
      return throwMsg(e, 'Failed to update buyer address');
    }
  },

  shipItem: async (auctionId: string, shipmentId: string, payload: { courier_code: string; service_code: string }): Promise<ShipmentResponse> => {
    try {
      const res = await apiClient.post(`/auctions/${auctionId}/shipments/${shipmentId}/ship`, payload);
      return res.data.shipment;
    } catch (e) {
      return throwMsg(e, 'Failed to ship item');
    }
  },

  receiveItem: async (auctionId: string, shipmentId: string, delivery_proof_image_path: string): Promise<ShipmentResponse> => {
    try {
      const res = await apiClient.post(`/auctions/${auctionId}/shipments/${shipmentId}/receive`, { delivery_proof_image_path });
      return res.data.shipment;
    } catch (e) {
      return throwMsg(e, 'Failed to mark as received');
    }
  },

  getTracking: async (auctionId: string, shipmentId: string): Promise<unknown> => {
    try {
      const res = await apiClient.get(`/auctions/${auctionId}/shipments/${shipmentId}/tracking`);
      return res.data.tracking;
    } catch (e) {
      return throwMsg(e, 'Failed to load tracking');
    }
  },
};
