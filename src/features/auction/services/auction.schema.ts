export const AuctionStatus = {
  SCHEDULED: 'SCHEDULED',
  ON_GOING: 'ON_GOING',
  WAITING_FOR_PAYMENT: 'WAITING_FOR_PAYMENT',
  WAITING_FOR_SELLER_DECISION: 'WAITING_FOR_SELLER_DECISION',
  WAITING_FOR_BUYER_ADDRESS: 'WAITING_FOR_BUYER_ADDRESS',
  WAITING_FOR_SHIPMENT: 'WAITING_FOR_SHIPMENT',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;
export type AuctionStatus = (typeof AuctionStatus)[keyof typeof AuctionStatus];

export const ProductStatus = {
  DRAFT: 'DRAFT',
  REQUEST: 'REQUEST',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  ON_BIDS: 'ON_BIDS',
  COMPLETED: 'COMPLETED',
} as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const ProductCondition = {
  NEW: 'NEW',
  PRELOVED: 'PRELOVED',
} as const;
export type ProductCondition = (typeof ProductCondition)[keyof typeof ProductCondition];

export interface UserResponse {
  id: string;
  fullname: string;
  phone: string;
  birth: string;
  gender: string;
  nik?: string;
  bank_account_number?: string;
  is_verified: boolean;
  is_deleted: boolean;
  identity_image_link?: string;
  selfie_identity_image_link?: string;
  roles?: UserRoleResponse[];
  balance?: number;
  created_at: string;
  updated_at: string;
}

export interface UserRoleResponse {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface ProductStatusHistoryResponse {
  id: string;
  product_id: number;
  status: string;
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductResponse {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  condition: ProductCondition;
  status: ProductStatus;
  weight_gram?: number;
  cover_image_link?: string;
  image_links?: string[];
  status_histories?: ProductStatusHistoryResponse[];
  user?: UserResponse;
  created_at: string;
  updated_at: string;
}

export interface AuctionResponse {
  id: string;
  product_id: number;
  product?: ProductResponse;
  starting_price: number;
  fee: number;
  start_time: string;
  end_time: string;
  status: AuctionStatus;
  winner?: AuctionWinnerResponse;
  payment?: PaymentResponse;
  bids?: AuctionBidResponse[];
  created_at: string;
  updated_at: string;
}

export interface AuctionBidResponse {
  id: string;
  auction_id: number;
  user_id: string;
  amount: number;
  is_winner?: boolean;
  user?: UserResponse;
  auction?: AuctionResponse;
  payment?: PaymentResponse;
  created_at: string;
  updated_at: string;
}

export interface AuctionWinnerResponse {
  id: string;
  auction_id: number;
  auction_bid_id: string;
  status: string;
  auction?: AuctionResponse;
  auction_bid?: AuctionBidResponse;
  created_at: string;
  updated_at: string;
}

export interface PaymentResponse {
  id: string;
  auction_id: number;
  user_id: string;
  amount: number;
  status: string;
  snap_token?: string;
  snap_url?: string;
  payment_method_id?: string;
  expired_at?: string;
  auction?: AuctionResponse;
  created_at: string;
  updated_at: string;
}

export interface ShipmentAddressSnapshot {
  recipient_name: string;
  phone: string;
  address: string;
  city_id: string;
  city_name: string;
  province_name: string;
  postal_code: string;
  biteship_area_id: string;
  latitude?: number;
  longitude?: number;
}

export interface ShipmentCostEstimate {
  courier_code: string;
  courier_name: string;
  courier_service_code: string;
  courier_service_name: string;
  duration: string;
  price: number;
  shipping_fee: number;
}

export interface ShipmentResponse {
  id: string;
  auction_bid_id: string;
  user_id: string;
  buyer_address_id?: string;
  seller_address_id?: string;
  buyer_address_snapshot?: ShipmentAddressSnapshot;
  seller_address_snapshot?: ShipmentAddressSnapshot;
  courier_code?: string;
  service_code?: string;
  shipping_cost?: number;
  biteship_order_id?: string;
  tracking_number?: string;
  delivery_proof_image_path?: string;
  estimated_costs: ShipmentCostEstimate[];
  shipped_at?: string;
  received_at?: string;
  auction_bid?: AuctionBidResponse;
  created_at: string;
  updated_at: string;
}

export interface ShipmentTrackingCourier {
  company: string;
  driver_name: string;
  driver_phone: string;
  name: string;
  phone: string;
}

export interface ShipmentTrackingLocation {
  address: string;
  contact_name: string;
}

export interface ShipmentTrackingHistory {
  note: string;
  service_type: string;
  status: string;
  updated_at: string;
}

export interface ShipmentTrackingResponse {
  courier: ShipmentTrackingCourier;
  destination: ShipmentTrackingLocation;
  history: ShipmentTrackingHistory[];
  id: string;
  link: string;
  message: string;
  object: string;
  order_id: string;
  origin: ShipmentTrackingLocation;
  status: string;
  success: boolean;
  waybill_id: string;
}

export interface UserAddressResponse {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  city_id: string;
  city_name: string;
  province_name: string;
  address: string;
  postal_code: string;
  biteship_area_id: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAddressCreateRequest {
  label: string;
  recipient_name: string;
  phone: string;
  city_id: string;
  city_name: string;
  province_name: string;
  address: string;
  postal_code: string;
  biteship_area_id: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
}

export type UserAddressUpdateRequest = UserAddressCreateRequest;

export interface UserAddressFetchRequest {
  page?: number;
  limit?: number;
  sorts?: { field: string; direction: 'asc' | 'desc' }[];
}

export interface BiteshipAreaResponse {
  id: string;
  name: string;
  province: string;
  city: string;
  district: string;
  postal_code: number;
}

export interface PaginatedData<T> {
  page: number;
  limit: number;
  total: number;
  nodes: T[];
}

export interface ApiResponse<T> {
  data: T;
}

export interface AuctionFetchRequest {
  page?: number;
  limit?: number;
  status?: AuctionStatus;
  sorts?: { field: string; direction: 'asc' | 'desc' }[];
}

export interface AuctionBidCreateRequest {
  amount: number;
}
