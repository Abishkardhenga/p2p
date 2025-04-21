
import { useState, useEffect, useRef, useCallback } from "react";
import PromptCard, { PromptCardProps } from "./PromptCard";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "lucide-react";

// Sample data - would come from an API in a real application
const samplePrompts: PromptCardProps[] = [
  {
    id: "1",
    title: "SEO Blog Post Generator",
    description: "Generate SEO-optimized blog posts with perfect keyword density and engaging content.",
    price: 19.99,
    rating: 4.8,
    reviews: 142,
    model: "GPT-4",
    category: "SEO",
    author: {
      name: "Digital Marketer Pro",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    imageUrl: "https://www.tributemedia.com/hs-fs/hubfs/Images/Blog%20Images/SEO-s.jpg?width=1240&name=SEO-s.jpg" // blogging workspace
  },
  {
    id: "2",
    title: "Professional Email Composer",
    description: "Create professional, persuasive emails for any business situation.",
    price: 9.99,
    rating: 4.6,
    reviews: 87,
    model: "GPT-3.5",
    category: "Copywriting",
    author: {
      name: "Email Wizard",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    imageUrl: "https://dl-file.cyberlink.com/web/upload-file/learning-center/enu/2024/11/Thumbnail_20241127235012315.jpg" // laptop + email
  },
  {
    id: "4",
    title: "Fantasy Story Creator",
    description: "Create rich fantasy worlds and characters with detailed backstories.",
    price: 24.99,
    rating: 4.7,
    reviews: 118,
    model: "GPT-4",
    category: "Creative Writing",
    author: {
      name: "Story Crafter",
      avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    },
    imageUrl: "https://t3.ftcdn.net/jpg/02/81/42/82/360_F_281428216_YWRTOqeBWBmtuWxBci02ClnEnI22Fh7e.jpg" // fantasy artwork
  },
  {
    id: "5",
    title: "Technical Documentation Writer",
    description: "Generate clear, precise technical documentation for software products.",
    price: 29.99,
    rating: 4.5,
    reviews: 76,
    model: "GPT-4",
    category: "Technical",
    author: {
      name: "Dev Docs Pro",
      avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    },
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1080&auto=format&fit=crop" // technical docs
  },
  {
    id: "6",
    title: "Social Media Caption Generator",
    description: "Create engaging captions for Instagram, Twitter, and Facebook posts.",
    price: 12.99,
    rating: 4.4,
    reviews: 192,
    model: "GPT-3.5",
    category: "Marketing",
    author: {
      name: "Social Media Maven",
      avatar: "https://randomuser.me/api/portraits/women/6.jpg",
    },
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1080&auto=format&fit=crop" // social media concept
  },
  {
    id: "3",
    title: "Product Description Expert",
    description: "Generate compelling product descriptions that convert browsers into buyers.",
    price: 14.99,
    rating: 4.9,
    reviews: 203,
    model: "Claude",
    category: "Marketing",
    author: {
      name: "Conversion King",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    imageUrl: "https://d2v5dzhdg4zhx3.cloudfront.net/web-assets/images/storypages/primary/ProductShowcasesampleimages/JPEG/Product+Showcase-1.jpg" // e-commerce product page
  },
  {
    id: "7",
    title: "Art Prompt for Midjourney",
    description: "Generate detailed art prompts that create stunning images in Midjourney.",
    price: 19.99,
    rating: 4.9,
    reviews: 253,
    model: "Midjourney",
    category: "Creative",
    author: {
      name: "Art Whisperer",
      avatar: "https://randomuser.me/api/portraits/men/7.jpg",
    },
    imageUrl: "https://www.adobe.com/products/firefly/discover/media_13eed11d1546b482a26656f0d9aebdda1b4db4e55.jpeg?width=750&format=jpeg&optimize=medium" // dreamy AI art
  },
  {
    id: "8",
    title: "Resume Enhancer",
    description: "Transform your basic resume into a professional, ATS-friendly document.",
    price: 17.99,
    rating: 4.7,
    reviews: 116,
    model: "GPT-4",
    category: "Copywriting",
    author: {
      name: "Career Catalyst",
      avatar: "https://randomuser.me/api/portraits/women/8.jpg",
    },
    imageUrl: "https://marketplace.canva.com/EAFzfwx_Qik/4/0/1131w/canva-blue-simple-professional-cv-resume-T9RPR4DPdiw.jpg" // resume paper
  },
  {
    id: "9",
    title: "Sci-Fi Art Generator",
    description: "Create fascinating sci-fi artworks and illustrations for your projects.",
    price: 24.99,
    rating: 4.8,
    reviews: 187,
    model: "Stable Diffusion",
    category: "Art",
    author: {
      name: "Future Artist",
      avatar: "https://randomuser.me/api/portraits/men/9.jpg",
    },
    imageUrl: "https://assets-us-01.kc-usercontent.com/5cb25086-82d2-4c89-94f0-8450813a0fd3/d8fb4620-25e4-4052-9e3f-e7f7580c1c13/Sci-Fi%20and%20the%20Future.jpg?fm=jpg&auto=format" // sci-fi city
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
    imageUrl: "https://content-management-files.canva.com/cdn-cgi/image/f=auto,q=70/df60084f-bd4d-430e-aadc-40cfc734266b/portrait-of-a-woman-in-a-professional-setting-photo2x.png" // artistic portrait
  },
  {
    id: "11",
    title: "Sales Copy Expert",
    description: "Generate persuasive sales copy that converts visitors into customers.",
    price: 29.99,
    rating: 4.9,
    reviews: 221,
    model: "GPT-4",
    category: "Copywriting",
    author: {
      name: "Sales Guru",
      avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    },
    imageUrl: "https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs/72045471/original/478051831830f34fbf82e2dd62ca3aeb8e087229/craft-an-awesome-html-product-description.jpg" // business conversion
  },
  {
    id: "12",
    title: "AI Character Creator",
    description: "Create detailed AI characters with unique personalities and backstories.",
    price: 14.99,
    rating: 4.5,
    reviews: 98,
    model: "Claude",
    category: "Creative",
    author: {
      name: "Character Designer",
      avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    },
    imageUrl: "https://d1odn9376gg444.cloudfront.net/www.artguru.ai/sites/37/2025/02/08102714/ai-character-3.png" // illustrated character
  }
];



// Generate more sample prompts by duplicating and modifying the existing ones
const generateMorePrompts = (page: number): PromptCardProps[] => {
  return samplePrompts.map(prompt => ({
    ...prompt,
    id: `${prompt.id}-page-${page}`,
    title: `${prompt.title} ${page > 1 ? page : ''}`,
    price: Math.round(prompt.price * (1 + (page * 0.1)) * 100) / 100,
  }));
};

interface InfinitePromptListProps {
  filters: any;
  searchQuery: string;
}

const InfinitePromptList = ({ filters, searchQuery }: InfinitePromptListProps) => {
  const [prompts, setPrompts] = useState<PromptCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const { toast } = useToast();

  const lastPromptElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    }, { threshold: 0.5 });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchPrompts = useCallback(() => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      let newPrompts = generateMorePrompts(page);
      
      // Apply search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        newPrompts = newPrompts.filter(
          prompt => 
            prompt.title.toLowerCase().includes(query) || 
            prompt.description.toLowerCase().includes(query)
        );
      }
      
      // Apply price range filter
      if (filters.priceRange) {
        newPrompts = newPrompts.filter(
          prompt => 
            prompt.price >= filters.priceRange[0] && 
            prompt.price <= filters.priceRange[1]
        );
      }
      
      // Apply rating filter
      if (filters.ratingMin !== undefined) {
        newPrompts = newPrompts.filter(
          prompt => prompt.rating >= filters.ratingMin
        );
      }
      
      // Apply model filter
      if (filters.models && filters.models.length > 0) {
        newPrompts = newPrompts.filter(prompt => 
          filters.models.some((model: string) => 
            prompt.model.toLowerCase().includes(model.toLowerCase())
          )
        );
      }
      
      // Apply category filter
      if (filters.categories && filters.categories.length > 0) {
        newPrompts = newPrompts.filter(prompt => 
          filters.categories.some((category: string) => 
            prompt.category.toLowerCase().includes(category.toLowerCase())
          )
        );
      }
      
      // Apply sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case "newest":
            newPrompts = [...newPrompts].reverse();
            break;
          case "price-low":
            newPrompts = [...newPrompts].sort((a, b) => a.price - b.price);
            break;
          case "price-high":
            newPrompts = [...newPrompts].sort((a, b) => b.price - a.price);
            break;
          case "rating":
            newPrompts = [...newPrompts].sort((a, b) => b.rating - a.rating);
            break;
          case "popular":
          default:
            newPrompts = [...newPrompts].sort((a, b) => b.reviews - a.reviews);
        }
      }
      
      if (page === 1) {
        setPrompts(newPrompts);
      } else {
        setPrompts(prevPrompts => [...prevPrompts, ...newPrompts]);
      }
      
      // Simulate running out of data after a few pages
      if (page >= 5) {
        setHasMore(false);
      }
      
      setLoading(false);
      
      if (newPrompts.length === 0 && page === 1) {
        toast({
          title: "No results found",
          description: "Try adjusting your filters or search query.",
        });
      }
    }, 800);
  }, [page, filters, searchQuery, toast]);

  // Reset page and fetch when filters or search query changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setPrompts([]);
  }, [filters, searchQuery]);

  // Fetch prompts when page changes or on initial load
  useEffect(() => {
    fetchPrompts();
  }, [page, fetchPrompts]);

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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prompts.map((prompt, index) => {
          if (prompts.length === index + 1) {
            return (
              <div ref={lastPromptElementRef} key={prompt.id}>
                <PromptCard {...prompt} />
              </div>
            );
          } else {
            return <PromptCard key={prompt.id} {...prompt} />;
          }
        })}
      </div>
      
      {loading && (
        <div className="flex justify-center py-8">
          <div className="flex flex-col items-center">
            <Loader className="h-8 w-8 text-lavender-400 animate-spin" />
            <p className="mt-2 text-muted-foreground">Loading more prompts...</p>
          </div>
        </div>
      )}
      
      {!hasMore && prompts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">You've reached the end of the results.</p>
        </div>
      )}
    </div>
  );
};

export default InfinitePromptList;
