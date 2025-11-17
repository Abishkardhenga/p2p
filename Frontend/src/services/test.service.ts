import { apiPost } from "./http.client";

export interface TestPromptRequest {
  query: string;
  content_id: string;
  user_id?: string;
  llm_model?: string;
  llm_settings?: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
  };
}

export interface TestImageRequest {
  query: string;
  content_id: string;
  user_id?: string;
  llm_model?: string;
  llm_settings?: {
    size?: string;
    n?: number;
  };
}

export interface TestResponse {
  response: string | { url: string }[];
}

export const testService = {
  // Test chat completion prompt
  testPrompt: async (request: TestPromptRequest): Promise<TestResponse> => {
    return apiPost("/test/chat_completion", request);
  },

  // Test image generation prompt
  testImage: async (request: TestImageRequest): Promise<TestResponse> => {
    return apiPost("/test/image_generation", request);
  },
};
