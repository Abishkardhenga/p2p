import { useState, useEffect } from "react";
import PromptCard, { PromptCardProps } from "./PromptCard";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "lucide-react";
import { contentService } from "@/services/content.service";

// Sample data - would come from an API in a real application
const samplePrompts: PromptCardProps[] = [
  {
    id: "1",
    title: "SEO Blog Post Generator",
    description:
      "Generate SEO-optimized blog posts with perfect keyword density and engaging content.",
    price: 19.99,
    rating: 4.8,
    reviews: 142,
    model: "GPT-4",
    category: "SEO",
    author: {
      name: "Digital Marketer Pro",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    imageUrl:
      "https://www.tributemedia.com/hs-fs/hubfs/Images/Blog%20Images/SEO-s.jpg?width=1240&name=SEO-s.jpg", // blogging workspace
  },
  {
    id: "2",
    title: "Professional Email Composer",
    description:
      "Create professional, persuasive emails for any business situation.",
    price: 9.99,
    rating: 4.6,
    reviews: 87,
    model: "GPT-3.5",
    category: "Copywriting",
    author: {
      name: "Email Wizard",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    imageUrl:
      "https://dl-file.cyberlink.com/web/upload-file/learning-center/enu/2024/11/Thumbnail_20241127235012315.jpg", // laptop + email
  },
  {
    id: "4",
    title: "Fantasy Story Creator",
    description:
      "Create rich fantasy worlds and characters with detailed backstories.",
    price: 24.99,
    rating: 4.7,
    reviews: 118,
    model: "GPT-4",
    category: "Creative Writing",
    author: {
      name: "Story Crafter",
      avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    },
    imageUrl:
      "https://t3.ftcdn.net/jpg/02/81/42/82/360_F_281428216_YWRTOqeBWBmtuWxBci02ClnEnI22Fh7e.jpg", // fantasy artwork
  },
  {
    id: "5",
    title: "Technical Documentation Writer",
    description:
      "Generate clear, precise technical documentation for software products.",
    price: 29.99,
    rating: 4.5,
    reviews: 76,
    model: "GPT-4",
    category: "Technical",
    author: {
      name: "Dev Docs Pro",
      avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1080&auto=format&fit=crop", // technical docs
  },
  {
    id: "6",
    title: "Social Media Caption Generator",
    description:
      "Create engaging captions for Instagram, Twitter, and Facebook posts.",
    price: 12.99,
    rating: 4.4,
    reviews: 192,
    model: "GPT-3.5",
    category: "Marketing",
    author: {
      name: "Social Media Maven",
      avatar: "https://randomuser.me/api/portraits/women/6.jpg",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1080&auto=format&fit=crop", // social media concept
  },
  {
    id: "3",
    title: "Product Description Expert",
    description:
      "Generate compelling product descriptions that convert browsers into buyers.",
    price: 14.99,
    rating: 4.9,
    reviews: 203,
    model: "Claude",
    category: "Marketing",
    author: {
      name: "Conversion King",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    imageUrl:
      "https://d2v5dzhdg4zhx3.cloudfront.net/web-assets/images/storypages/primary/ProductShowcasesampleimages/JPEG/Product+Showcase-1.jpg", // e-commerce product page
  },
  {
    id: "7",
    title: "Art Prompt for Midjourney",
    description:
      "Generate detailed art prompts that create stunning images in Midjourney.",
    price: 19.99,
    rating: 4.9,
    reviews: 253,
    model: "Midjourney",
    category: "Creative",
    author: {
      name: "Art Whisperer",
      avatar: "https://randomuser.me/api/portraits/men/7.jpg",
    },
    imageUrl:
      "https://www.adobe.com/products/firefly/discover/media_13eed11d1546b482a26656f0d9aebdda1b4db4e55.jpeg?width=750&format=jpeg&optimize=medium", // dreamy AI art
  },
  {
    id: "8",
    title: "Resume Enhancer",
    description:
      "Transform your basic resume into a professional, ATS-friendly document.",
    price: 17.99,
    rating: 4.7,
    reviews: 116,
    model: "GPT-4",
    category: "Copywriting",
    author: {
      name: "Career Catalyst",
      avatar: "https://randomuser.me/api/portraits/women/8.jpg",
    },
    imageUrl:
      "https://marketplace.canva.com/EAFzfwx_Qik/4/0/1131w/canva-blue-simple-professional-cv-resume-T9RPR4DPdiw.jpg", // resume paper
  },
  {
    id: "9",
    title: "Sci-Fi Art Generator",
    description:
      "Create fascinating sci-fi artworks and illustrations for your projects.",
    price: 24.99,
    rating: 4.8,
    reviews: 187,
    model: "Stable Diffusion",
    category: "Art",
    author: {
      name: "Future Artist",
      avatar: "https://randomuser.me/api/portraits/men/9.jpg",
    },
    imageUrl:
      "https://assets-us-01.kc-usercontent.com/5cb25086-82d2-4c89-94f0-8450813a0fd3/d8fb4620-25e4-4052-9e3f-e7f7580c1c13/Sci-Fi%20and%20the%20Future.jpg?fm=jpg&auto=format", // sci-fi city
  },
  {
    id: "10",
    title: "Portrait Generator",
    description: "Create stunning portrait images in various artistic styles.",
    price: 19.99,
    rating: 4.6,
    reviews: 142,
    model: "DALL-E 3",
    category: "Art",
    author: {
      name: "Portrait Pro",
      avatar: "https://randomuser.me/api/portraits/women/10.jpg",
    },
    imageUrl:
      "https://content-management-files.canva.com/cdn-cgi/image/f=auto,q=70/df60084f-bd4d-430e-aadc-40cfc734266b/portrait-of-a-woman-in-a-professional-setting-photo2x.png", // artistic portrait
  },
  {
    id: "11",
    title: "Sales Copy Expert",
    description:
      "Generate persuasive sales copy that converts visitors into customers.",
    price: 29.99,
    rating: 4.9,
    reviews: 221,
    model: "GPT-4",
    category: "Copywriting",
    author: {
      name: "Sales Guru",
      avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    },
    imageUrl:
      "https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs/72045471/original/478051831830f34fbf82e2dd62ca3aeb8e087229/craft-an-awesome-html-product-description.jpg", // business conversion
  },
  {
    id: "12",
    title: "AI Character Creator",
    description:
      "Create detailed AI characters with unique personalities and backstories.",
    price: 14.99,
    rating: 4.5,
    reviews: 98,
    model: "Claude",
    category: "Creative",
    author: {
      name: "Character Designer",
      avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    },
    imageUrl:
      "https://d1odn9376gg444.cloudfront.net/www.artguru.ai/sites/37/2025/02/08102714/ai-character-3.png", // illustrated character
  },
];

// Generate more sample prompts by duplicating and modifying the existing ones
const generateMorePrompts = (page: number): PromptCardProps[] => {
  return samplePrompts.map((prompt) => ({
    ...prompt,
    id: `${prompt.id}-page-${page}`,
    title: `${prompt.title} ${page > 1 ? page : ""}`,
    price: Math.round(prompt.price * (1 + page * 0.1) * 100) / 100,
  }));
};

interface InfinitePromptListProps {
  filters: any;
  searchQuery: string;
}

const InfinitePromptList = ({
  filters,
  searchQuery,
}: InfinitePromptListProps) => {
  const [prompts, setPrompts] = useState<PromptCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendCount, setBackendCount] = useState(0);
  const { toast } = useToast();

  const fetchPrompts = async () => {
    setLoading(true);

    try {
      let displayPrompts: PromptCardProps[] = [];

      // If there's a search query, search backend only
      if (searchQuery && searchQuery.trim()) {
        const searchResults = await contentService.searchContent(searchQuery);

        // Transform backend search results
        displayPrompts = searchResults.results.map((content: any) => ({
          id: content.id,
          title: content.title,
          description: content.description,
          price: content.price,
          rating: 4.5,
          reviews: 0,
          model: content.llm_model,
          category: content.metadata?.category || "General",
          author: {
            name: content.owner_id.substring(0, 8) + "...",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${content.owner_id}`,
          },
          imageUrl:
            content.preview_url ||
            content.metadata?.sample_images?.[0] ||
            "https://placehold.co/600x400/252232/e2e8f0?text=Prompt",
        }));
      } else {
        // No search query - show sample prompts + all backend prompts
        // Start with the 9 nice sample prompts
        displayPrompts = [...samplePrompts.slice(0, 9)];
        setBackendCount(0);

        // Fetch ALL prompts from backend (no limit)
        try {
          const backendPrompts = await contentService.getNItems(1000); // Large number to get all

          // Transform and add backend prompts
          const transformedBackendPrompts = backendPrompts.map(
            (content: any) => ({
              id: content.id,
              title: content.title,
              description: content.description,
              price: content.price,
              rating: 4.5,
              reviews: 0,
              model: content.llm_model,
              category: content.metadata?.category || "General",
              author: {
                name: content.owner_id.substring(0, 8) + "...",
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${content.owner_id}`,
              },
              imageUrl:
                content.preview_url ||
                content.metadata?.sample_images?.[0] ||
                "https://placehold.co/600x400/252232/e2e8f0?text=Prompt",
            })
          );

          // Add backend prompts after sample prompts
          displayPrompts = [...displayPrompts, ...transformedBackendPrompts];
          setBackendCount(transformedBackendPrompts.length);
        } catch (backendError) {
          console.log("No backend prompts or error fetching:", backendError);
          setBackendCount(0);
          // Continue with just sample prompts if backend fails
        }
      }

      // Apply filters
      let filteredPrompts = displayPrompts;

      // Apply price range filter
      if (filters.priceRange) {
        filteredPrompts = filteredPrompts.filter(
          (prompt) =>
            prompt.price >= filters.priceRange[0] &&
            prompt.price <= filters.priceRange[1]
        );
      }

      // Apply rating filter
      if (filters.ratingMin !== undefined) {
        filteredPrompts = filteredPrompts.filter(
          (prompt) => prompt.rating >= filters.ratingMin
        );
      }

      // Apply model filter
      if (filters.models && filters.models.length > 0) {
        filteredPrompts = filteredPrompts.filter((prompt) =>
          filters.models.some((model: string) =>
            prompt.model.toLowerCase().includes(model.toLowerCase())
          )
        );
      }

      // Apply category filter
      if (filters.categories && filters.categories.length > 0) {
        filteredPrompts = filteredPrompts.filter((prompt) =>
          filters.categories.some((category: string) =>
            prompt.category.toLowerCase().includes(category.toLowerCase())
          )
        );
      }

      // Apply sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case "newest":
            filteredPrompts = [...filteredPrompts].reverse();
            break;
          case "price-low":
            filteredPrompts = [...filteredPrompts].sort(
              (a, b) => a.price - b.price
            );
            break;
          case "price-high":
            filteredPrompts = [...filteredPrompts].sort(
              (a, b) => b.price - a.price
            );
            break;
          case "rating":
            filteredPrompts = [...filteredPrompts].sort(
              (a, b) => b.rating - a.rating
            );
            break;
          case "popular":
          default:
            filteredPrompts = [...filteredPrompts].sort(
              (a, b) => b.reviews - a.reviews
            );
        }
      }

      setPrompts(filteredPrompts);

      if (filteredPrompts.length === 0 && searchQuery) {
        toast({
          title: "No results found",
          description: "Try a different search query.",
        });
      }
    } catch (error: any) {
      console.error("Error fetching prompts:", error);

      // On error, show sample prompts if not searching
      if (!searchQuery) {
        setPrompts(samplePrompts.slice(0, 9));
      } else {
        toast({
          title: "Search failed",
          description: "Could not search prompts. Please try again.",
          variant: "destructive",
        });
        setPrompts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch prompts when filters or search query changes
  useEffect(() => {
    fetchPrompts();
  }, [filters, searchQuery]);

  if (prompts.length === 0 && !loading) {
    return (
      <div className="bg-muted/30 rounded-lg border border-muted p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">No prompts found</h3>
        <p className="text-muted-foreground mb-4">
          We couldn't find any prompts matching your criteria.
        </p>
        <p className="text-muted-foreground">
          Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 text-lavender-400 animate-spin" />
          <p className="mt-2 text-muted-foreground">Loading prompts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} {...prompt} />
        ))}
      </div>

      {prompts.length > 0 && !searchQuery && (
        <div className="text-center py-4 text-muted-foreground">
          Showing {prompts.length} prompt{prompts.length !== 1 ? "s" : ""}
          {backendCount > 0 && (
            <span className="ml-2 text-purple-400">
              ({backendCount} from your marketplace)
            </span>
          )}
        </div>
      )}

      {prompts.length > 0 && searchQuery && (
        <div className="text-center py-4 text-muted-foreground">
          Found {prompts.length} result{prompts.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};

export default InfinitePromptList;
