/**
 * ComradeOS — Centralized API Client
 * All backend requests flow through this module.
 * Automatically attaches JWT bearer token from localStorage.
 */

import { SyncQueue } from "./sync_queue";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface RequestOptions {
  method?: string;
  body?: unknown;
  requiresAuth?: boolean;
  allowOfflineQueue?: boolean;
}

class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, requiresAuth = true, allowOfflineQueue = true } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requiresAuth) {
    const token = typeof window !== "undefined" ? localStorage.getItem("comradeos_token") : null;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ detail: "Network error" }));
      throw new ApiError(response.status, errorBody.detail || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // Check if it's a "Failed to fetch" TypeError, meaning network is down
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      // If it's a mutating action and we allow queuing, send it to the sync queue
      if (allowOfflineQueue && ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase())) {
        SyncQueue.enqueue({
          url: endpoint,
          method,
          headers,
          payload: body,
        });
        
        // We throw a specific offline error so the UI can gracefully show an optimistic state
        // rather than a fatal crash.
        throw new ApiError(0, "OFFLINE_QUEUED");
      }
    }
    
    // Re-throw if it's an actual ApiError or we don't allow queuing
    throw error;
  }
}

// --- Auth ---
export const authApi = {
  register: (data: { username: string; phone_number: string; password: string }) =>
    request<{ access_token: string; username: string; message: string }>("/auth/register", {
      method: "POST",
      body: data,
      requiresAuth: false,
      allowOfflineQueue: false,
    }),

  login: (data: { phone_number: string; password: string }) =>
    request<{ access_token: string; username: string; message: string }>("/auth/login", {
      method: "POST",
      body: data,
      requiresAuth: false,
      allowOfflineQueue: false,
    }),
};

// --- Finance ---
export interface BurnRateData {
  current_balance: number;
  daily_survival_budget: number;
  days_to_helb: number;
  status_message: string;
}

export interface TransactionData {
  id: string;
  amount: number;
  type: string;
  category: string;
  mpesa_receipt: string;
  timestamp: string;
}

export interface MpesaTransaction {
  amount: number;
  type: string;
  category: string;
  mpesa_receipt: string;
  timestamp: string;
}

export interface AnalyticsData {
  total_in: number;
  total_out: number;
  current_balance: number;
  category_breakdown: Record<string, number>;
  daily_average_spend: number;
  ml_prediction: {
    predicted_date: string;
    days_remaining: number;
    avg_daily_spend: number;
    predicted_daily_spend: number;
    confidence: string;
  };
  spending_streak: {
    streak_days: number;
    streak_total: number;
    warning: string | null;
  };
}

export const financeApi = {
  getBurnRate: (daysToHelb: number = 14) =>
    request<BurnRateData>(`/finance/burn-rate?days_to_helb=${daysToHelb}`),

  syncTransactions: (transactions: MpesaTransaction[]) =>
    request<{ synced: number; skipped_duplicates: number; message: string }>("/finance/mpesa/sync", {
      method: "POST",
      body: transactions,
    }),

  getAnalytics: () =>
    request<AnalyticsData>("/finance/analytics"),

  getTransactions: (limit: number = 20) =>
    request<{ transactions: TransactionData[]; total: number }>(`/finance/transactions?limit=${limit}`),
};

// --- Vybe Map ---
export interface PitstopData {
  id: string;
  name: string;
  category: string;
  average_cost: number;
  latitude: number | null;
  longitude: number | null;
  is_safe_verified: boolean;
}

export const vybeApi = {
  getSpots: (budget?: number) => {
    const url = budget !== undefined ? `/vybe/spots?budget=${budget}` : "/vybe/spots";
    return request<{ spots: PitstopData[]; total: number }>(url);
  },
};

// --- Marketplace ---
export interface ListingData {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  status: string;
  created_at: string;
}

export const marketplaceApi = {
  getListings: () => request<{ listings: ListingData[]; total: number }>("/vybe/marketplace/listings"),
};
