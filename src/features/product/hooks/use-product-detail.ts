import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';

export const useProductDetail = (id: string | number) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });
};
