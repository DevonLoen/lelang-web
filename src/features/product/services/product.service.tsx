import { apiClient } from '../../../lib/axios';
import {
  type ProductFormData,
  type Product,
  ProductStatus,
  ProductCondition,
} from './product.schema';
import type { PaginatedResponse } from '../../../api/utils';
import type { ProductResponse } from '../../auction/services/auction.schema';

const BASE_URL = import.meta.env.VITE_API_URL as string;

const throwMsg = (e: unknown, fallback: string): never => {
  if (e instanceof Error) throw new Error(e.message || fallback);
  throw new Error(fallback);
};

async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post('/own/files/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.path as string;
}

function toImageUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BASE_URL}/storage/public/${path}`;
}

const mapProduct = (p: ProductResponse): Product => ({
  id: p.id,
  userId: p.user_id,
  name: p.name,
  description: p.description,
  condition: p.condition as ProductCondition,
  coverImageUrl: toImageUrl(p.cover_image_link),
  imageUrls: (p.image_links ?? []).map(toImageUrl),
  status: p.status as ProductStatus,
  createdAt: p.created_at ? new Date(p.created_at) : undefined,
  updatedAt: p.updated_at ? new Date(p.updated_at) : undefined,
});

export const productService = {
  createProductRequest: async (productData: ProductFormData): Promise<Product> => {
    try {
      let coverImagePath: string | undefined;
      if (productData.coverImageUrl instanceof File) {
        coverImagePath = await uploadFile(productData.coverImageUrl);
      }

      const imagePaths: string[] = [];
      if (productData.imageUrls && productData.imageUrls.length > 0) {
        for (const file of productData.imageUrls) {
          if (file instanceof File) {
            imagePaths.push(await uploadFile(file));
          }
        }
      }

      const res = await apiClient.post('/own/products', {
        name: productData.name,
        description: productData.description ?? undefined,
        condition: productData.condition,
        weight_gram: productData.weight_gram,
        cover_image_path: coverImagePath,
        image_paths: imagePaths,
      });

      return mapProduct(res.data.product as ProductResponse);
    } catch (e) {
      return throwMsg(e, 'Failed to create product');
    }
  },

  getMyProducts: async (
    page = 1,
    size = 9,
    status?: ProductStatus,
    condition?: ProductCondition,
    filter?: string,
  ): Promise<PaginatedResponse<Product>> => {
    try {
      const res = await apiClient.post('/own/products/filter', {
        page,
        limit: size,
        status,
        condition,
        search: filter?.trim() || undefined,
        sorts: [{ field: 'created_at', direction: 'desc' }],
      });

      const { total, page: currentPage, limit, nodes } = res.data;
      const totalPage = Math.ceil(total / limit);

      return {
        meta: {
          page: currentPage,
          size: limit,
          totalPage,
          totalData: total,
        },
        data: (nodes as ProductResponse[]).map(mapProduct),
      };
    } catch (e) {
      return throwMsg(e, 'Failed to load products');
    }
  },

  getProductById: async (id: string | number): Promise<Product> => {
    try {
      const res = await apiClient.get(`/products/${id}`);
      return mapProduct(res.data.product as ProductResponse);
    } catch (e) {
      return throwMsg(e, 'Failed to load product');
    }
  },
};
