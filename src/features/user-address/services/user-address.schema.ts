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
  is_default?: boolean;
}

export interface UserAddressUpdateRequest extends UserAddressCreateRequest {}

export interface UserAddressFetchRequest {
  page?: number;
  limit?: number;
  sorts?: { field: 'label' | 'created_at' | 'updated_at'; direction: 'asc' | 'desc' }[];
}
