import { useState, useEffect } from "react";
import { contentService, Content } from "@/services/content.service";
import { useToast } from "@/components/ui/use-toast";

/**
 * Custom hook to fetch and manage user's content
 * @param ownerId - The owner's wallet address from ZK Login
 */
export const useUserContent = (ownerId: string | undefined) => {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUserContent = async () => {
    if (!ownerId) {
      setContent([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userContent = await contentService.getContentByOwner(ownerId);
      setContent(userContent);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch your content";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserContent();
  }, [ownerId]);

  return {
    content,
    loading,
    error,
    refetch: fetchUserContent,
  };
};
