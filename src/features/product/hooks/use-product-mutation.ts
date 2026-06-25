import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "../services/product.service";
import { useToast } from "../../../contexts/toast-context";
import { ToastType } from "../../../enums/toast-type";

export const useCreateProduct = (onSuccessCallback: () => void) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: productService.createProductRequest,
    onSuccess: () => {
      showToast("Product Successfully Created!", ToastType.SUCCESS);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccessCallback();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Creation failed";
      showToast(message, ToastType.ERROR);
    },
  });
};
