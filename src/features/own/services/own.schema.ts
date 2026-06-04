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
  product_id: string;
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
  auction_id?: string;
  sorts?: { field: string; direction: 'asc' | 'desc' }[];
}

export interface OwnPaymentFetchRequest {
  page?: number;
  limit?: number;
  auction_id?: string;
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
  identity_image_path?: string;
  selfie_identity_image_path?: string;
}

export interface RoleRequestResponse {
  id: string;
  user_id: string;
  role: string;
  status: string;
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalRequestCreateRequest {
  amount: number;
}

export interface WithdrawalRequestResponse {
  id: string;
  user_id: string;
  validator_user_id?: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}
