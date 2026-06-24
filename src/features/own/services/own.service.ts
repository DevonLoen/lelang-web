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
  NotificationFetchRequest,
  NotificationResponse,
  RoleRequestResponse,
  WithdrawalRequestCreateRequest,
  WithdrawalRequestFetchRequest,
  WithdrawalRequestResponse,
} from './own.schema';
import type {
  ProductResponse,
  ProductStatusHistoryResponse,
  AuctionResponse,
  AuctionBidResponse,
  PaymentResponse,
  UserResponse,
  UserAddressResponse,
  PaginatedData,
} from '../../auction/services/auction.schema';
import type {
  UserAddressCreateRequest,
  UserAddressUpdateRequest,
  UserAddressFetchRequest,
} from '../../user-address/services/user-address.schema';

type ApiResult<T> = {
  data: T;
  message?: string;
};

const throwMsg = (e: unknown, fallback: string): never => {
  if (e instanceof Error) throw new Error(e.message || fallback);
  throw new Error(fallback);
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
      const res = await apiClient.put('/own/profiles', payload) as ApiResult<{ user: UserResponse }>;
      return { data: res.data.user, message: res.message ?? '' };
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
      const res = await apiClient.post('/own/products', payload) as ApiResult<{ product: ProductResponse }>;
      return { data: res.data.product, message: res.message ?? '' };
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
      const res = await apiClient.put(`/own/products/${productId}`, payload) as ApiResult<{ product: ProductResponse }>;
      return { data: res.data.product, message: res.message ?? '' };
    } catch (e) {
      return throwMsg(e, 'Failed to update product');
    }
  },

  requestProductReview: async (productId: string): Promise<{ data: ProductResponse; message: string }> => {
    try {
      const res = await apiClient.patch(`/own/products/${productId}/request`) as ApiResult<{ product: ProductResponse }>;
      return { data: res.data.product, message: res.message ?? '' };
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
      const res = await apiClient.post('/own/auctions', payload) as ApiResult<{ auction: AuctionResponse }>;
      return { data: res.data.auction, message: res.message ?? '' };
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
      const res = await apiClient.put(`/own/auctions/${auctionId}`, payload) as ApiResult<{ auction: AuctionResponse }>;
      return { data: res.data.auction, message: res.message ?? '' };
    } catch (e) {
      return throwMsg(e, 'Failed to update auction');
    }
  },

  relistAuction: async (auctionId: string): Promise<{ data: AuctionResponse; message: string }> => {
    try {
      const res = await apiClient.patch(`/own/auctions/${auctionId}/relist`) as ApiResult<{ auction: AuctionResponse }>;
      return { data: res.data.auction, message: res.message ?? '' };
    } catch (e) {
      return throwMsg(e, 'Failed to relist auction');
    }
  },

  secondChanceAuction: async (auctionId: string): Promise<{ data: AuctionResponse; message: string }> => {
    try {
      const res = await apiClient.patch(`/own/auctions/${auctionId}/second-chance`) as ApiResult<{ auction: AuctionResponse }>;
      return { data: res.data.auction, message: res.message ?? '' };
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

  // ─── User Addresses (owner) ─────────────────────────────────────
  listUserAddresses: async (params: UserAddressFetchRequest = {}): Promise<PaginatedData<UserAddressResponse>> => {
    try {
      const res = await apiClient.post('/own/user-addresses/filter', params);
      return res.data;
    } catch (e) {
      return throwMsg(e, 'Failed to load addresses');
    }
  },

  getUserAddress: async (userAddressId: string): Promise<UserAddressResponse> => {
    try {
      const res = await apiClient.get(`/own/user-addresses/${userAddressId}`);
      return res.data.user_address;
    } catch (e) {
      return throwMsg(e, 'Failed to load address');
    }
  },

  createUserAddress: async (payload: UserAddressCreateRequest): Promise<UserAddressResponse> => {
    try {
      const res = await apiClient.post('/own/user-addresses', payload);
      return res.data.user_address;
    } catch (e) {
      return throwMsg(e, 'Failed to create address');
    }
  },

  updateUserAddress: async (userAddressId: string, payload: UserAddressUpdateRequest): Promise<UserAddressResponse> => {
    try {
      const res = await apiClient.put(`/own/user-addresses/${userAddressId}`, payload);
      return res.data.user_address;
    } catch (e) {
      return throwMsg(e, 'Failed to update address');
    }
  },

  deleteUserAddress: async (userAddressId: string): Promise<void> => {
    try {
      await apiClient.delete(`/own/user-addresses/${userAddressId}`);
    } catch (e) {
      return throwMsg(e, 'Failed to delete address');
    }
  },

  // ─── Role Requests ─────────────────────────────────────────────
  createRoleRequest: async (payload: OwnRoleRequestCreateRequest): Promise<{ data: RoleRequestResponse; message: string }> => {
    try {
      const res = await apiClient.post('/own/role-requests', payload) as ApiResult<{ role_request: RoleRequestResponse }>;
      return { data: res.data.role_request, message: res.message ?? '' };
    } catch (e) {
      return throwMsg(e, 'Failed to submit role request');
    }
  },

  // ─── Withdrawal ────────────────────────────────────────────────
  createWithdrawalRequest: async (payload: WithdrawalRequestCreateRequest): Promise<{ data: WithdrawalRequestResponse; message: string }> => {
    try {
      const res = await apiClient.post('/own/withdrawal-requests', payload) as ApiResult<{ withdrawal_request: WithdrawalRequestResponse }>;
      return { data: res.data.withdrawal_request, message: res.message ?? '' };
    } catch (e) {
      return throwMsg(e, 'Failed to submit withdrawal request');
    }
  },

  listWithdrawalRequests: async (params: WithdrawalRequestFetchRequest): Promise<PaginatedData<WithdrawalRequestResponse>> => {
    try {
      const res = await apiClient.post('/own/withdrawal-requests/filter', params);
      return res.data;
    } catch (e) {
      return throwMsg(e, 'Failed to load withdrawal requests');
    }
  },

  listNotifications: async (params: NotificationFetchRequest): Promise<PaginatedData<NotificationResponse>> => {
    try {
      const res = await apiClient.post('/own/notifications/filter', params);
      return res.data;
    } catch (e) {
      return throwMsg(e, 'Failed to load notifications');
    }
  },

  getNotification: async (notificationId: string): Promise<NotificationResponse> => {
    try {
      const res = await apiClient.get(`/own/notifications/${notificationId}`);
      return res.data.notification;
    } catch (e) {
      return throwMsg(e, 'Failed to load notification');
    }
  },

  markNotificationRead: async (notificationId: string): Promise<NotificationResponse> => {
    try {
      const res = await apiClient.patch(`/own/notifications/${notificationId}/read`);
      return res.data.notification;
    } catch (e) {
      return throwMsg(e, 'Failed to mark notification as read');
    }
  },
};
