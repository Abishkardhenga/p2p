import { apiGet, apiPost } from "./http.client";

export interface User {
  id: string;
  username?: string;
  email?: string;
  wallet_address?: string;
  created_at?: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  content_id: string;
  price: number;
  purchased_at: string;
}

export const userService = {
  // Create or register user
  createUser: async (user: User): Promise<User> => {
    return apiPost("/users/", user);
  },

  // Get user by ID
  getUser: async (userId: string): Promise<User> => {
    return apiGet(`/users/${userId}`);
  },

  // Get user purchases
  getUserPurchases: async (userId: string): Promise<Purchase[]> => {
    return apiGet(`/users/${userId}/purchases`);
  },
};
