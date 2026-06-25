export interface OwnProductCreateRequest {
  name: string;
  description?: string;
  condition: 'NEW' | 'PRELOVED';
  weight_gram: number;
  image_paths: string[];
  cover_image_path?: string;
}

export interface OwnProductUpdateRequest {
  name: string;
  description?: string;
  condition: 'NEW' | 'PRELOVED';
  weight_gram: number;
  image_paths: string[];
  cover_image_path?: string;
}

export interface OwnProductFetchRequest {
  page?: number;
  limit?: number;
  status?: string;
  condition?: string;
  search?: string;
  sorts?: { field: string; direction: 'asc' | 'desc' }[];
}

export interface OwnAuctionCreateRequest {
  product_id: number;
  starting_price: number;
  start_time: string;
  end_time: string;
}

export interface OwnAuctionUpdateRequest {
  starting_price: number;
  start_time: string;
  end_time: string;
}

export interface OwnAuctionFetchRequest {
  page?: number;
  limit?: number;
  status?: string;
  sorts?: { field: string; direction: 'asc' | 'desc' }[];
}

export interface OwnBidFetchRequest {
  page?: number;
  limit?: number;
  auction_id?: number;
  sorts?: { field: string; direction: 'asc' | 'desc' }[];
}

export interface OwnPaymentFetchRequest {
  page?: number;
  limit?: number;
  auction_id?: number;
  status?: string;
  sorts?: { field: string; direction: 'asc' | 'desc' }[];
}

export interface OwnProfileUpdateRequest {
  fullname: string;
  birth: string;
  gender?: string;
}

export interface OwnRoleRequestCreateRequest {
  role: 'BIDDER' | 'SELLER';
  nik?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  bank_name?: string;
  identity_image_path?: string;
  selfie_identity_image_path?: string;
}

export interface RoleRequestResponse {
  id: number;
  user_id: number;
  role: string;
  status: string;
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalRequestCreateRequest {
  amount: number;
}

export type WithdrawalRequestStatus = 'REQUESTED' | 'COMPLETED';

export interface WithdrawalRequestFetchRequest {
  page?: number;
  limit?: number;
  status?: WithdrawalRequestStatus;
  sorts?: { field: string; direction: 'asc' | 'desc' }[];
}

export interface WithdrawalRequestResponse {
  id: number;
  user_id: number;
  validator_user_id?: number;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationFetchRequest {
  page?: number;
  limit?: number;
  is_read?: boolean;
  sorts?: { field: string; direction: 'asc' | 'desc' }[];
}

export interface NotificationResponse {
  id: number;
  user_id: number;
  title: string;
  body: string;
  type: string;
  reference_id?: number;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}
