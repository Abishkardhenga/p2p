
import { useState, useEffect } from "react";
import PromptCard, { PromptCardProps } from "./PromptCard";
import { useToast } from "@/components/ui/use-toast";

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
  },
  // Add more sample prompts as needed
];

interface PromptListProps {
  filters: any;
  searchQuery: string;
}

const PromptList = ({ filters, searchQuery }: PromptListProps) => {
  const [prompts, setPrompts] = useState<PromptCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading data from an API
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      let filteredPrompts = [...samplePrompts];
      
      // Apply search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredPrompts = filteredPrompts.filter(
          prompt => 
            prompt.title.toLowerCase().includes(query) || 
            prompt.description.toLowerCase().includes(query)
        );
      }
      
      // Apply price range filter
      if (filters.priceRange) {
        filteredPrompts = filteredPrompts.filter(
          prompt => 
            prompt.price >= filters.priceRange[0] && 
            prompt.price <= filters.priceRange[1]
        );
      }
      
      // Apply rating filter
      if (filters.ratingMin !== undefined) {
        filteredPrompts = filteredPrompts.filter(
          prompt => prompt.rating >= filters.ratingMin
        );
      }
      
      // Apply model filter
      if (filters.models && filters.models.length > 0) {
        filteredPrompts = filteredPrompts.filter(prompt => 
          filters.models.some((model: string) => 
            prompt.model.toLowerCase().includes(model.toLowerCase())
          )
        );
      }
      
      // Apply category filter
      if (filters.categories && filters.categories.length > 0) {
        filteredPrompts = filteredPrompts.filter(prompt => 
          filters.categories.some((category: string) => 
            prompt.category.toLowerCase().includes(category.toLowerCase())
          )
        );
      }
      
      // Apply sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case "newest":
            // In a real app, we would sort by date
            filteredPrompts = [...filteredPrompts].reverse();
            break;
          case "price-low":
            filteredPrompts = [...filteredPrompts].sort((a, b) => a.price - b.price);
            break;
          case "price-high":
            filteredPrompts = [...filteredPrompts].sort((a, b) => b.price - a.price);
            break;
          case "rating":
            filteredPrompts = [...filteredPrompts].sort((a, b) => b.rating - a.rating);
            break;
          case "popular":
          default:
            filteredPrompts = [...filteredPrompts].sort((a, b) => b.reviews - a.reviews);
        }
      }
      
      setPrompts(filteredPrompts);
      setLoading(false);
      
      if (filteredPrompts.length === 0) {
        toast({
          title: "No results found",
          description: "Try adjusting your filters or search query.",
        });
      }
    }, 500);
  }, [filters, searchQuery, toast]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-lavender-100 h-6 w-24 rounded"></div>
              <div className="bg-lavender-100 h-6 w-16 rounded"></div>
            </div>
            <div className="bg-lavender-100 h-8 w-full rounded mb-2"></div>
            <div className="bg-lavender-100 h-4 w-full rounded mb-1"></div>
            <div className="bg-lavender-100 h-4 w-3/4 rounded mb-4"></div>
            <div className="flex items-center justify-between">
              <div className="bg-lavender-100 h-4 w-20 rounded"></div>
              <div className="bg-lavender-100 h-4 w-16 rounded"></div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-lavender-100 h-6 w-6 rounded-full"></div>
                <div className="bg-lavender-100 h-3 w-24 rounded ml-2"></div>
              </div>
              <div className="bg-lavender-100 h-3 w-16 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">No prompts found</h3>
        <p className="text-gray-500 mb-4">
          We couldn't find any prompts matching your criteria.
        </p>
        <p className="text-gray-500">
          Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} {...prompt} />
      ))}
    </div>
  );
};

export default PromptList;
