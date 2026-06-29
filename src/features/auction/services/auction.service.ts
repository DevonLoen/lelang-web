import { apiClient, publicApiClient } from '../../../lib/axios';
import type {
  AuctionResponse,
  AuctionBidResponse,
  AuctionBidCreateRequest,
  AuctionFetchRequest,
  AuctionWinnerResponse,
  PaymentResponse,
  ShipmentResponse,
  ShipmentTrackingResponse,
  PaginatedData,
} from './auction.schema';
import { toIntegerId } from '../../../utils/id';

const throwMsg = (e: unknown, fallback: string): never => {
  if (e instanceof Error) throw new Error(e.message || fallback);
  throw new Error(fallback);
};

export const auctionService = {
  listAuctions: async (params: AuctionFetchRequest): Promise<PaginatedData<AuctionResponse>> => {
    try {
      const res = await publicApiClient.post('/auctions/filter', params);
      return res.data;
    } catch (e) {
      return throwMsg(e, 'Failed to load auctions');
    }
  },

  listOngoingAuctions: async (params: AuctionFetchRequest): Promise<PaginatedData<AuctionResponse>> => {
    try {
      const res = await publicApiClient.post('/auctions/on-going/filter', params);
      return res.data;
    } catch (e) {
      return throwMsg(e, 'Failed to load ongoing auctions');
    }
  },

  getAuction: async (auctionId: string | number): Promise<AuctionResponse> => {
    try {
      const res = await publicApiClient.get(`/auctions/${auctionId}`);
      return res.data.auction;
    } catch (e) {
      return throwMsg(e, 'Failed to load auction');
    }
  },

  listBids: async (auctionId: string | number, page = 1, limit = 50): Promise<PaginatedData<AuctionBidResponse>> => {
    try {
      const res = await apiClient.post(`/auctions/${auctionId}/bids/filter`, {
        page, limit, sorts: [{ field: 'amount', direction: 'desc' }],
      });
      return res.data;
    } catch (e) {
      return throwMsg(e, 'Failed to load bids');
    }
  },

  placeBid: async (auctionId: string | number, payload: AuctionBidCreateRequest): Promise<AuctionBidResponse> => {
    try {
      const res = await apiClient.post(`/auctions/${auctionId}/bids`, payload);
      return res.data.bid;
    } catch (e) {
      return throwMsg(e, 'Failed to place bid');
    }
  },

  listWinners: async (auctionId: string | number, page = 1, limit = 10): Promise<PaginatedData<AuctionWinnerResponse>> => {
    try {
      const res = await apiClient.post(`/auctions/${auctionId}/winners/filter`, { page, limit });
      return res.data;
    } catch (e) {
      return throwMsg(e, 'Failed to load winners');
    }
  },

  getWinner: async (auctionId: string | number, winnerId: string | number): Promise<AuctionWinnerResponse> => {
    try {
      const res = await apiClient.get(`/auctions/${auctionId}/winners/${winnerId}`);
      return res.data.winner;
    } catch (e) {
      return throwMsg(e, 'Failed to load winner');
    }
  },

  listPayments: async (auctionId: string | number): Promise<PaymentResponse[]> => {
    try {
      const res = await apiClient.post(`/auctions/${auctionId}/payments/filter`, {});
      return res.data.payments ?? [];
    } catch (e) {
      return throwMsg(e, 'Failed to load payments');
    }
  },

  getPayment: async (auctionId: string | number, paymentId: string | number): Promise<PaymentResponse> => {
    try {
      const res = await apiClient.get(`/auctions/${auctionId}/payments/${paymentId}`);
      return res.data.payment;
    } catch (e) {
      return throwMsg(e, 'Failed to load payment');
    }
  },

  listShipments: async (auctionId: string | number): Promise<ShipmentResponse[]> => {
    try {
      const res = await apiClient.post(`/auctions/${auctionId}/shipments/filter`, {});
      return res.data.shipments;
    } catch (e) {
      return throwMsg(e, 'Failed to load shipments');
    }
  },

  getShipment: async (auctionId: string | number, shipmentId: string | number): Promise<ShipmentResponse> => {
    try {
      const res = await apiClient.get(`/auctions/${auctionId}/shipments/${shipmentId}`);
      return res.data.shipment;
    } catch (e) {
      return throwMsg(e, 'Failed to load shipment');
    }
  },

  updateBuyerAddress: async (auctionId: string | number, shipmentId: string | number, address_id: number): Promise<ShipmentResponse> => {
    try {
      const res = await apiClient.patch(`/auctions/${auctionId}/shipments/${shipmentId}/buyer-address`, {
        address_id: toIntegerId(address_id, 'address_id'),
      });
      return res.data.shipment;
    } catch (e) {
      return throwMsg(e, 'Failed to update buyer address');
    }
  },

  updateSellerAddress: async (auctionId: string | number, shipmentId: string | number, address_id: number): Promise<ShipmentResponse> => {
    try {
      const res = await apiClient.patch(`/auctions/${auctionId}/shipments/${shipmentId}/seller-address`, {
        address_id: toIntegerId(address_id, 'address_id'),
      });
      return res.data.shipment;
    } catch (e) {
      return throwMsg(e, 'Failed to update seller address');
    }
  },

  shipItem: async (auctionId: string | number, shipmentId: string | number, payload: { courier_code: string; service_code: string }): Promise<ShipmentResponse> => {
    try {
      const res = await apiClient.post(`/auctions/${auctionId}/shipments/${shipmentId}/ship`, payload);
      return res.data.shipment;
    } catch (e) {
      return throwMsg(e, 'Failed to ship item');
    }
  },

  receiveItem: async (auctionId: string | number, shipmentId: string | number, delivery_proof_image_path: string): Promise<ShipmentResponse> => {
    try {
      const res = await apiClient.post(`/auctions/${auctionId}/shipments/${shipmentId}/receive`, { delivery_proof_image_path });
      return res.data.shipment;
    } catch (e) {
      return throwMsg(e, 'Failed to mark as received');
    }
  },

  getTracking: async (auctionId: string | number, shipmentId: string | number): Promise<ShipmentTrackingResponse> => {
    if (!auctionId || !shipmentId) {
      throw new Error('Invalid auction or shipment identifier');
    }

    try {
      const res = await apiClient.get(`/auctions/${auctionId}/shipments/${shipmentId}/tracking`);
      return res.data.tracking;
    } catch (e) {
      return throwMsg(e, 'Failed to load tracking');
    }
  },
};
