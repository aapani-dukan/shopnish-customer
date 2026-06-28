1// src/hooks/useCartMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

export const useCartMutation = (onSuccessCallback: (productName: string) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { productId: any, variantId: any, quantity: number }) => {
      // 🎯 Debug Point 1: Backend bhejne se pehle payload dekho
      console.log("🚀 SENDING PAYLOAD TO BACKEND:", JSON.stringify(payload, null, 2));
      
      const response = await apiRequest("POST", "/api/cart/add", payload);
      
      // 🎯 Debug Point 2: Backend ka response check karo
      console.log("✅ BACKEND RESPONSE:", JSON.stringify(response, null, 2));
      
      return response;
    },
   // mutation ke onSuccess mein
onSuccess: async () => {
  console.log("🔄 Invalidating and Refetching Cart...");
  await queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
  await queryClient.refetchQueries({ queryKey: ['/api/cart'] }); // 👈 Force fetch backend!
    },
    onError: (error) => {
      // 🎯 Debug Point 4: Agar request fail hui toh error batao
      console.error("❌ MUTATION ERROR:", error);
    }
  });
};