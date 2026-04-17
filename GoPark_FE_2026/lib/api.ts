/**
 * API Client Configuration
 * Configure your API base URL and common headers here
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

/**
 * Base API client with common configurations
 */
export async function apiClient<T>(
  endpoint: string,
  config: RequestConfig = {},
): Promise<T> {
  const { params, ...restConfig } = config;

  // Build URL with query params
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  let token = null;
  if (typeof window !== "undefined") {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        token = parsed?.state?.accessToken;
      } catch (e) {}
    }
  }

  const defaultHeaders: Record<string, string> = {};

  // Nếu body KHÔNG phải là FormData thì mới set Content-Type là JSON
  if (!(restConfig.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    headers: {
      ...defaultHeaders,
      ...restConfig.headers,
    },
    ...restConfig,
  });

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes("/auth/login")) {
      if (typeof window !== "undefined") {
        // Clear auth storage and redirect to login
        console.error("401 Unauthorized encountered on API:", endpoint);
        // Only trigger session expiration logout if the user isn't actively trying to log in
        localStorage.removeItem("auth-storage");
        window.location.href = "/auth/login";
      }
    }

    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : errorData.message;
      } else if (errorData && errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // ignore JSON parse error
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

/**
 * GET request helper
 */
export function get<T>(
  endpoint: string,
  params?: Record<string, string>,
): Promise<T> {
  return apiClient<T>(endpoint, { method: "GET", params });
}

/**
 * POST request helper
 */
export function post<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiClient<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * PUT request helper
 */
export function put<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiClient<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * PATCH request helper
 */
export function patch<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiClient<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request helper
 */
export function del<T>(endpoint: string): Promise<T> {
  return apiClient<T>(endpoint, { method: "DELETE" });
}
