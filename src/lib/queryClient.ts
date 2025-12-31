import { QueryClient, QueryFunction } from "@tanstack/react-query";
import api from "../services/api"; // ✅ Aapka Axios instance (Jisme BaseURL aur Interceptors honge)
import { logout } from "./firebase"; // ✅ Path check karlein (Mobile path)

/**
 * Mobile API Request Function
 * Axios automatic Firebase token headers mein add karega (Interceptors ke through)
 */
export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  path: string,
  data?: unknown | FormData
): Promise<any> {
  try {
    const config = {
      method,
      url: path,
      
    };
    const res = await api(config);
    return res.data;
  } catch (error: any) {
    if (error.response) {
      // Custom error logic for Mobile
      const customError: any = new Error(
        error.response.data.message ||
          error.response.data.error ||
          "API request failed"
      );
      customError.status = error.response.status;

      if (error.response.status === 401) {
        console.error("401 Unauthorized: Logging out user from Mobile.");
        await logout(); 
        throw customError;
      }

      throw customError;
    }
    const customError: any = new Error("Network error or server unreachable.");
    customError.status = 500;
    throw customError;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

// Is syntax ko dhyan se copy karein
export const getQueryFn = <T,>({ on401: unauthorizedBehavior }: { 
  on401: UnauthorizedBehavior 
}): QueryFunction<T | null> =>
  async ({ queryKey }) => {
    const path = queryKey[0] as string;

    try {
      const res = await apiRequest("GET", path);
      return res as T;
    } catch (error: any) {
      if (error.status === 401 && unauthorizedBehavior === "returnNull") {
        return null;
      }
      throw error;
    }
  };

// React Query Client Configuration for Mobile
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      // React Native mein Window focus nahi hota, isliye ise false hi rakhein
      staleTime: 1000 * 60 * 5, 
      retry: (failureCount, error: any) => {
        if (error?.status === 401 && failureCount < 1) {
          return true;
        }
        return false;
      },
    },
    mutations: {
      retry: false,
    },
  },
});