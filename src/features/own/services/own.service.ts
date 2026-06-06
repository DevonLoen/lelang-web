import { apiClient } from '../../../lib/axios';
import type {
  OwnProductCreateRequest,
  OwnProductUpdateRequest,
  OwnProductFetchRequest,
  OwnAuctionCreateRequest,
  OwnAuctionUpdateRequest,
  OwnAuctionFetchRequest,
  OwnBidFetchRequest,
  OwnPaymentFetchRequest,
  OwnProfileUpdateRequest,
  OwnRoleRequestCreateRequest,
  RoleRequestResponse,
  WithdrawalRequestCreateRequest,
  WithdrawalRequestResponse,
} from './own.schema';
import type {
  ProductResponse,
  ProductStatusHistoryResponse,
  AuctionResponse,
  AuctionBidResponse,
  PaymentResponse,
  UserResponse,
  PaginatedData,
} from '../../auction/services/auction.schema';

const throwMsg = (e: any, fallback: string): never => {
  throw new Error(e?.response?.data?.message || e?.message || fallback);
};

export const ownService = {
  // ─── Profile ───────────────────────────────────────────────────
  getProfile: async (): Promise<UserResponse> => {
    try {
      const res = await apiClient.get('/own/profiles');
      return res.data.user;
    } catch (e) {
      return throwMsg(e, 'Failed to load profile');
    }
  },

  updateProfile: async (payload: OwnProfileUpdateRequest): Promise<{ data: UserResponse; message: string }> => {
    try {
      const res = await apiClient.put('/own/profiles', payload);
      return { data: res.data.user, message: (res as any).message };
    } catch (e) {
      return throwMsg(e, 'Failed to update profile');
    }
  },

  // ─── File Upload ───────────────────────────────────────────────
  uploadFile: async (file: File): Promise<string> => {
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await apiClient.post('/own/files/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.path;
    } catch (e) {
      return throwMsg(e, 'Failed to upload file');
    }
  },

  // ─── Products ──────────────────────────────────────────────────
  listProducts: async (params: OwnProductFetchRequest): Promise<PaginatedData<ProductResponse>> => {
    try {
      const res = await apiClient.post('/own/products/filter', params);
      return res.data;
    } catch (e) {
      return throwMsg(e, 'Failed to load products');
    }
  },

  createProduct: async (payload: OwnProductCreateRequest): Promise<{ data: ProductResponse; message: string }> => {
    try {
      const res = await apiClient.post('/own/products', payload);
      return { data: res.data.product, message: (res as any).message };
    } catch (e) {
      return throwMsg(e, 'Failed to create product');
    }
  },

  getProduct: async (productId: string): Promise<ProductResponse> => {
    try {
      const res = await apiClient.get(`/own/products/${productId}`);
      return res.data.product;
    } catch (e) {
      return throwMsg(e, 'Failed to load product');
    }
  },

  updateProduct: async (productId: string, payload: OwnProductUpdateRequest): Promise<{ data: ProductResponse; message: string }> => {
    try {
      const res = await apiClient.put(`/own/products/${productId}`, payload);
      return { data: res.data.product, message: (res as any).message };
    } catch (e) {
      return throwMsg(e, 'Failed to update product');
    }
  },

  requestProductReview: async (productId: string): Promise<{ data: ProductResponse; message: string }> => {
    try {
      const res = await apiClient.patch(`/own/products/${productId}/request`);
      return { data: res.data.product, message: (res as any).message };
    } catch (e) {
      return throwMsg(e, 'Failed to request review');
    }
  },

  getProductHistories: async (productId: string): Promise<ProductStatusHistoryResponse[]> => {
    try {
      const res = await apiClient.post(`/own/products/${productId}/histories`);
      return res.data.histories;
    } catch (e) {
      return throwMsg(e, 'Failed to load product histories');
    }
  },

  // ─── Auctions ──────────────────────────────────────────────────
  listAuctions: async (params: OwnAuctionFetchRequest): Promise<PaginatedData<AuctionResponse>> => {
    try {
      const res = await apiClient.post('/own/auctions/filter', params);
      return res.data;
    } catch (e) {
      return throwMsg(e, 'Failed to load auctions');
    }
  },

  createAuction: async (payload: OwnAuctionCreateRequest): Promise<{ data: AuctionResponse; message: string }> => {
    try {
      const res = await apiClient.post('/own/auctions', payload);
      return { data: res.data.auction, message: (res as any).message };
    } catch (e) {
      return throwMsg(e, 'Failed to create auction');
    }
  },

  getAuction: async (auctionId: string): Promise<AuctionResponse> => {
    try {
      const res = await apiClient.get(`/own/auctions/${auctionId}`);
      return res.data.auction;
    } catch (e) {
      return throwMsg(e, 'Failed to load auction');
    }
  },

  updateAuction: async (auctionId: string, payload: OwnAuctionUpdateRequest): Promise<{ data: AuctionResponse; message: string }> => {
    try {
      const res = await apiClient.put(`/own/auctions/${auctionId}`, payload);
      return { data: res.data.auction, message: (res as any).message };
    } catch (e) {
      return throwMsg(e, 'Failed to update auction');
    }
  },

  relistAuction: async (auctionId: string): Promise<{ data: AuctionResponse; message: string }> => {
    try {
      const res = await apiClient.patch(`/own/auctions/${auctionId}/relist`);
      return { data: res.data.auction, message: (res as any).message };
    } catch (e) {
      return throwMsg(e, 'Failed to relist auction');
    }
  },

  secondChanceAuction: async (auctionId: string): Promise<{ data: AuctionResponse; message: string }> => {
    try {
      const res = await apiClient.patch(`/own/auctions/${auctionId}/second-chance`);
      return { data: res.data.auction, message: (res as any).message };
    } catch (e) {
      return throwMsg(e, 'Failed to offer second chance');
    }
  },

  // ─── Bids ──────────────────────────────────────────────────────
  listBids: async (params: OwnBidFetchRequest): Promise<PaginatedData<AuctionBidResponse>> => {
    try {
      const res = await apiClient.post('/own/bids/filter', params);
      return res.data;
    } catch (e) {
      return throwMsg(e, 'Failed to load bids');
    }
  },

  getBid: async (bidId: string): Promise<AuctionBidResponse> => {
    try {
      const res = await apiClient.get(`/own/bids/${bidId}`);
      return res.data.bid;
    } catch (e) {
      return throwMsg(e, 'Failed to load bid');
    }
  },

  // ─── Payments ──────────────────────────────────────────────────
  listPayments: async (params: OwnPaymentFetchRequest): Promise<PaginatedData<PaymentResponse>> => {
    try {
      const res = await apiClient.post('/own/payments/filter', params);
      return res.data;
    } catch (e) {
      return throwMsg(e, 'Failed to load payments');
    }
  },

  getPayment: async (paymentId: string): Promise<PaymentResponse> => {
    try {
      const res = await apiClient.get(`/own/payments/${paymentId}`);
      return res.data.payment;
    } catch (e) {
      return throwMsg(e, 'Failed to load payment');
    }
  },

  // ─── Role Requests ─────────────────────────────────────────────
  createRoleRequest: async (payload: OwnRoleRequestCreateRequest): Promise<{ data: RoleRequestResponse; message: string }> => {
    try {
      const res: any = await apiClient.post('/own/role-requests', payload);
      return { data: res.data.role_request, message: (res as any).message };
    } catch (e) {
      return throwMsg(e, 'Failed to submit role request');
    }
  },

  // ─── Withdrawal ────────────────────────────────────────────────
  createWithdrawalRequest: async (payload: WithdrawalRequestCreateRequest): Promise<{ data: WithdrawalRequestResponse; message: string }> => {
    try {
      const res: any = await apiClient.post('/own/withdrawal-requests', payload);
      return { data: res.data.withdrawal_request, message: (res as any).message };
    } catch (e) {
      return throwMsg(e, 'Failed to submit withdrawal request');
    }
  },
};
