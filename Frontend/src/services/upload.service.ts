import axios from "axios";
import { VITE_BASE_URL } from "../configs/env";

export const uploadService = {
  // Upload a single image
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${VITE_BASE_URL}/upload/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Return full URL
      return `${VITE_BASE_URL.replace('/api/v1', '')}${response.data.url}`;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      throw new Error(error.response?.data?.detail || "Failed to upload image");
    }
  },

  // Upload multiple images
  uploadImages: async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await axios.post(`${VITE_BASE_URL}/upload/images`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Return full URLs
      const baseUrl = VITE_BASE_URL.replace('/api/v1', '');
      return response.data.images.map((img: any) => `${baseUrl}${img.url}`);
    } catch (error: any) {
      console.error("Error uploading images:", error);
      throw new Error(error.response?.data?.detail || "Failed to upload images");
    }
  },

  // Convert blob URL to File object (for uploaded files)
  blobUrlToFile: async (blobUrl: string, filename: string = "image.jpg"): Promise<File | null> => {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error("Error converting blob URL to file:", error);
      return null;
    }
  },
};

