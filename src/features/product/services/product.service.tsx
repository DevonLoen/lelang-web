import axios from "axios";
import {
  ProductSchema,
  CreateProductPayloadSchema, // Use the schema for validation
  type CreateProductPayload,
  type ProductFormData,
  type Product,
} from "./product.schema";
import { auctionClient } from "../../../lib/axios";
import { withDataEnvelope } from "../../../api/utils";

export const productService = {
  createProductRequest: async (
    productData: ProductFormData
  ): Promise<Product> => {
    const payload: CreateProductPayload = {
      name: productData.name,
      description: productData.description,
      condition: productData.condition,
      image_count: productData.imageUrls.length,
    };

    CreateProductPayloadSchema.parse(payload);

    const res = await auctionClient.post("/v1/products", payload);

    const createProductResponse =
      withDataEnvelope(ProductSchema).parse(res).data;

    const uploads: Promise<any>[] = [];

    if (createProductResponse.coverImageUrl && productData.coverImageUrl) {
      uploads.push(
        axios.put(
          createProductResponse.coverImageUrl,
          productData.coverImageUrl,
          {
            headers: { "Content-Type": productData.coverImageUrl.type },
          }
        )
      );
    }

    if (createProductResponse.imageUrls && productData.imageUrls.length > 0) {
      createProductResponse.imageUrls.forEach((url, index) => {
        const file = productData.imageUrls[index];
        if (file) {
          uploads.push(
            axios.put(url, file, { headers: { "Content-Type": file.type } })
          );
        }
      });
    }

    await Promise.all(uploads);
    return createProductResponse;
  },
};
