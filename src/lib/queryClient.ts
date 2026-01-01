import { QueryClient, QueryFunction } from "@tanstack/react-query";
import api from "../services/api"; 
import { logout } from "./firebase"; 

export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  path: string,
  data?: any // unknown ki jagah any taaki params handle ho sakein
): Promise<any> {
  try {
    const config: any = {
      method,
      url: path,
    };

    // ✅ GET ke liye params use karein, baaki ke liye data (body)
    if (method === "GET" && data) {
      config.params = data;
    } else if (data) {
      config.data = data;
    }

    const res = await api(config);
    return res.data;
  } catch (error: any) {
    if (error.response) {
      const customError: any = new Error(
        error.response.data.message || error.response.data.error || "API request failed"
      );
      customError.status = error.response.status;

      if (error.response.status === 401) {
        console.error("401 Unauthorized: Logging out...");
        await logout(); 
      }
      throw customError;
    }
    throw new Error("Network error or server unreachable.");
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn = <T,>({ on401: unauthorizedBehavior }: { 
  on401: UnauthorizedBehavior 
}): QueryFunction<T | null> =>
  async ({ queryKey }) => {
    const path = queryKey[0] as string;
    // ✅ Agara queryKey mein extra data hai (jaise filter/location), toh usey as Params bhejein
    const params = queryKey.length > 1 ? queryKey[1] : undefined; 

    try {
      const res = await apiRequest("GET", path, params);
      return res as T;
    } catch (error: any) {
      if (error.status === 401 && unauthorizedBehavior === "returnNull") {
        return null;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      staleTime: 1000 * 60 * 5, 
      retry: (failureCount, error: any) => {
        if (error?.status === 401 && failureCount < 1) return true;
        return false;
      },
    },
  },
});