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

const throwMsg = (e: unknown, fallback: string): never => {
  if (e instanceof Error) throw new Error(e.message || fallback);
  throw new Error(fallback);
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

  listOngoingAuctions: async (params: AuctionFetchRequest): Promise<PaginatedData<AuctionResponse>> => {
    try {
      const res = await publicApiClient.post('/auctions/on-going/filter', params);
      return res.data;
    } catch (e) {
      return throwMsg(e, 'Failed to load ongoing auctions');
    }
  },

  getAuction: async (auctionId: string): Promise<AuctionResponse> => {
    try {
      const res = await publicApiClient.get(`/auctions/${auctionId}`);
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

  updateSellerAddress: async (auctionId: string, shipmentId: string, address_id: string): Promise<ShipmentResponse> => {
    try {
      const res = await apiClient.patch(`/auctions/${auctionId}/shipments/${shipmentId}/seller-address`, { address_id });
      return res.data.shipment;
    } catch (e) {
      return throwMsg(e, 'Failed to update seller address');
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

  getTracking: async (auctionId: string, shipmentId: string): Promise<ShipmentTrackingResponse> => {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(auctionId) || !uuidPattern.test(shipmentId)) {
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
