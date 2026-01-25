import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import { ProductCondition, ProductStatus } from '../services/product.schema';

export const useProducts = (
  page: number,
  size: number,
  status?: ProductStatus,
  condition?: ProductCondition,
  filter?: string,
) => {
  return useQuery({
    queryKey: ['products', page, size, status, condition, filter],
    queryFn: () => productService.getMyProducts(page, size, status, condition, filter),
    placeholderData: (previousData) => previousData,
  });
};
