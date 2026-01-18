import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';

export const useProducts = (page: number, size: number) => {
  return useQuery({
    queryKey: ['products', page, size], // Include page/size in cache key
    queryFn: () => productService.getProducts(page, size),
    placeholderData: (previousData) => previousData,
  });
};
