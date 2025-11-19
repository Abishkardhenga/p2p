import { useState, useEffect } from "react";
import { contentService, Content } from "@/services/content.service";
import { purchaseService, Purchase } from "@/services/purchase.service";
import { useToast } from "@/components/ui/use-toast";

// Default prompts that everyone gets for free
const DEFAULT_PURCHASED_PROMPTS = [
  {
    id: "default-1",
    title: "SEO Blog Post Generator",
    category: "Content Creation",
    author: "Alex Chen",
    price: "$19.99",
    date: "2025-03-15",
    image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    isDefault: true,
  },
  {
    id: "default-2",
    title: "Social Media Campaign Planner",
    category: "Marketing",
    author: "Sarah Johnson",
    price: "$14.99",
    date: "2025-03-10",
    image:
      "https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    isDefault: true,
  },
  {
    id: "default-3",
    title: "Product Description Writer",
    category: "Copywriting",
    author: "Michael Lee",
    price: "$9.99",
    date: "2025-03-05",
    image:
      "https://images.unsplash.com/photo-1586892477838-2b96e85e0f96?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    isDefault: true,
  },
];

const DEFAULT_UPLOADED_PROMPTS = [
  {
    id: "default-upload-1",
    title: "Technical Documentation Writer",
    category: "Technical",
    sales: 2,
    revenue: "$59.98",
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    isDefault: true,
  },
  {
    id: "default-upload-2",
    title: "Email Composer Professional",
    category: "Copywriting",
    sales: 1,
    revenue: "$9.99",
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    isDefault: true,
  },
];

interface DashboardData {
  uploadedPrompts: any[];
  purchasedPrompts: any[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch dashboard data
 * Combines default prompts with user's actual data from backend
 */
export const useDashboardData = (userId: string | undefined): DashboardData => {
  const [uploadedPrompts, setUploadedPrompts] = useState<any[]>(DEFAULT_UPLOADED_PROMPTS);
  const [purchasedPrompts, setPurchasedPrompts] = useState<any[]>(DEFAULT_PURCHASED_PROMPTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    if (!userId) {
      // If no user, just show defaults
      setUploadedPrompts(DEFAULT_UPLOADED_PROMPTS);
      setPurchasedPrompts(DEFAULT_PURCHASED_PROMPTS);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch user's uploaded content
      const userContent = await contentService.getContentByOwner(userId);
      
      // Transform backend data to match UI format
      const transformedUploads = userContent.map((content) => ({
        id: content.id,
        title: content.title,
        category: content.metadata?.category || "Uncategorized",
        sales: content.metadata?.sales_count || 0,
        revenue: `$${(content.metadata?.revenue || 0).toFixed(2)}`,
        status: "Active",
        image: content.preview_url || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
        price: content.price,
        description: content.description,
        isDefault: false,
      }));

      // Combine defaults with user's uploads
      setUploadedPrompts([...DEFAULT_UPLOADED_PROMPTS, ...transformedUploads]);

      // Fetch user's purchases
      try {
        const purchases = await purchaseService.getUserPurchases(userId);
        
        // Fetch content details for each purchase
        const purchasedContent = await Promise.all(
          purchases.map(async (purchase) => {
            try {
              const content = await contentService.getContent(purchase.content_id);
              return {
                id: content.id,
                title: content.title,
                category: content.metadata?.category || "Uncategorized",
                author: "Unknown", // TODO: Fetch owner name
                price: `$${content.price.toFixed(2)}`,
                date: purchase.purchased_at,
                image: content.preview_url || "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
                isDefault: false,
              };
            } catch (err) {
              console.error(`Failed to fetch content ${purchase.content_id}:`, err);
              return null;
            }
          })
        );

        // Filter out failed fetches and combine with defaults
        const validPurchases = purchasedContent.filter((p) => p !== null);
        setPurchasedPrompts([...DEFAULT_PURCHASED_PROMPTS, ...validPurchases]);
      } catch (purchaseError) {
        console.log("No purchases found or error fetching purchases:", purchaseError);
        // Keep defaults if no purchases
        setPurchasedPrompts(DEFAULT_PURCHASED_PROMPTS);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch dashboard data";
      setError(errorMessage);
      console.error("Dashboard data fetch error:", err);
      
      // Don't show error toast for empty results, just log it
      if (!err.message?.includes("404")) {
        toast({
          title: "Error loading data",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      // Keep defaults on error
      setUploadedPrompts(DEFAULT_UPLOADED_PROMPTS);
      setPurchasedPrompts(DEFAULT_PURCHASED_PROMPTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  return {
    uploadedPrompts,
    purchasedPrompts,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};
