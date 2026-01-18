import axios from 'axios';
import {
  ProductSchema,
  CreateProductPayloadSchema, // Use the schema for validation
  type CreateProductPayload,
  type ProductFormData,
  type Product,
} from './product.schema';
import { auctionClient } from '../../../lib/axios';
import { withDataEnvelope, withPaginationEnvelope, type PaginatedResponse } from '../../../api/utils';
import z from 'zod';

export const productService = {
  createProductRequest: async (productData: ProductFormData): Promise<Product> => {
    const payload: CreateProductPayload = {
      name: productData.name,
      description: productData.description,
      condition: productData.condition,
      image_count: productData.imageUrls.length,
    };

    CreateProductPayloadSchema.parse(payload);

    const res = await auctionClient.post('/v1/products', payload);

    const createProductResponse = withDataEnvelope(ProductSchema).parse(res).data;

    const uploads: Promise<any>[] = [];

    if (createProductResponse.coverImageUrl && productData.coverImageUrl) {
      uploads.push(
        axios.put(createProductResponse.coverImageUrl, productData.coverImageUrl, {
          headers: { 'Content-Type': productData.coverImageUrl.type },
        }),
      );
    }

    if (createProductResponse.imageUrls && productData.imageUrls.length > 0) {
      createProductResponse.imageUrls.forEach((url, index) => {
        const file = productData.imageUrls[index];
        if (file) {
          uploads.push(axios.put(url, file, { headers: { 'Content-Type': file.type } }));
        }
      });
    }

    await Promise.all(uploads);
    return createProductResponse;
  },

  getProducts: async (page = 0, size = 10): Promise<PaginatedResponse<Product>> => {
    const res = await auctionClient.get('/v1/products/me');
    const validatedResponse = withPaginationEnvelope(z.array(ProductSchema)).parse(res);
    return validatedResponse;
  },

  getProductById: async (id: number): Promise<Product> => {
    const res = await auctionClient.get(`/v1/products/${id}`);
    const validatedResponse = withDataEnvelope(ProductSchema).parse(res);
    return validatedResponse.data;
  },
};
