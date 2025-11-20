import { apiGet, apiPost, apiPut } from "./http.client";

export interface ContentCreate {
  content_id?: string;
  owner_id: string;
  title: string;
  description: string;
  llm_model: string;
  llm_settings: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
  };
  price: number;
  metadata?: Record<string, any>;
  prompt: string;
  preview_url?: string;
  encrypted_message?: string;
}

export interface Content extends ContentCreate {
  id: string;
  created_at?: string;
  updated_at?: string;
  has_purchased?: boolean;
}

export interface SearchQuery {
  query: string;
}

export interface SearchResult {
  results: Content[];
}

export const contentService = {
  // Add new content
  addContent: async (contentData: ContentCreate): Promise<Content> => {
    return apiPost("/content/add", contentData);
  },

  // Update existing content
  updateContent: async (contentId: string, contentData: ContentCreate): Promise<Content> => {
    return apiPut(`/content/${contentId}`, contentData);
  },

  // Search content
  searchContent: async (query: string): Promise<SearchResult> => {
    return apiPost("/content/search", { query });
  },

  // Get content by ID
  getContent: async (contentId: string, userId?: string): Promise<Content> => {
    const url = userId ? `/content/${contentId}?user_id=${userId}` : `/content/${contentId}`;
    return apiGet(url);
  },

  // Get content by owner
  getContentByOwner: async (ownerId: string): Promise<Content[]> => {
    return apiGet(`/content/owner/${ownerId}`);
  },

  // Get n items
  getNItems: async (n: number): Promise<Content[]> => {
    return apiGet(`/content/list/${n}`);
  },

  // Get available models
  getModels: async (): Promise<any> => {
    return apiGet("/content/models");
  },
};
