import { apiGet, apiPost } from "./http.client";

export interface Purchase {
  id: string;
  user_id: string;
  content_id: string;
  price: number;
  purchased_at: string;
}

export interface PurchaseWithContent extends Purchase {
  content?: {
    id: string;
    title: string;
    description: string;
    price: number;
    preview_url?: string;
    metadata?: Record<string, any>;
  };
}

export const purchaseService = {
  // Create a purchase
  createPurchase: async (purchaseData: {
    user_id: string;
    content_id: string;
  }): Promise<Purchase> => {
    return apiPost("/purchase/", purchaseData);
  },

  // Get purchase by ID
  getPurchase: async (purchaseId: string): Promise<Purchase> => {
    return apiGet(`/purchase/${purchaseId}`);
  },

  // Get user's purchases
  getUserPurchases: async (userId: string): Promise<Purchase[]> => {
    return apiGet(`/users/${userId}/purchases`);
  },
};
