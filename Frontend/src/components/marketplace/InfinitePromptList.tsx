import React, { useState, useEffect } from "react";
import PromptCard, { PromptCardProps } from "./PromptCard";
import { Loader } from "lucide-react";
import { walrusServices } from "@/services/EncryptAndUpload";

interface InfinitePromptListProps {
  filters: any;
  searchQuery: string;
  prompts: any[]; // raw on-chain prompt objects
}

const InfinitePromptList = ({ filters, searchQuery, prompts }: InfinitePromptListProps) => {
  const [cards, setCards] = useState<PromptCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!prompts || prompts.length === 0) return;
    const service = walrusServices.find(s => s.id === 'service1');
    const fetchMeta = async () => {
      setLoading(true);
      const data = await Promise.all(prompts.map(async p => {
        let meta = {} as any;
        try {
          const res = await fetch(`${service?.aggregatorUrl}/v1/blobs/${p.metadataUri}`);
          if (res.ok) meta = await res.json();
        } catch {}
        return {
          id: p.id,
          title: meta.title ?? p.title ?? '',
          description: meta.description ?? p.description ?? '',
          price: p.price ?? p.testPrice ?? 0,
          rating: p.rating ?? 4.5,
          reviews: p.reviews ?? 20,
          model: meta.model ?? p.model ?? '',
          category: meta.category ?? p.category ?? '',
          author: p.author ?? { name: '', avatar: '' },
          imageUrl: meta.sampleImages?.[0] ?? p.sampleImages?.[0] ?? p.imageUrl,
        };
      }));
      setCards(data);
      setLoading(false);
    };
    fetchMeta();
  }, [prompts]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="h-8 w-8 text-lavender-400 animate-spin" />
      </div>
    );
  }

  const filteredPrompts = cards.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      (!q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) &&
      (!filters.priceRange || (p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1])) &&
      (filters.ratingMin == null || p.rating >= filters.ratingMin)
    );
  });

  // empty state
  if (!filteredPrompts.length && !loading) {
    return (
      <div className="bg-muted/30 rounded-lg border border-muted p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">No prompts found</h3>
        <p className="text-muted-foreground mb-4">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  // loader
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="h-8 w-8 text-lavender-400 animate-spin" />
      </div>
    );
  }

  // grid display
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPrompts.map(prompt => (
        <PromptCard key={prompt.id} {...prompt} />
      ))}
    </div>
  );
};

export default InfinitePromptList;
