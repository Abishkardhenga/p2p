import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import FilterSidebar from "@/components/marketplace/FilterSidebar";
import { fetchPrompts, OnChainPrompt } from "@/services/MarketplaceService";
import { useSuiClient } from "@mysten/dapp-kit";
import InfinitePromptList from "@/components/marketplace/InfinitePromptList";
import { walrusServices } from "@/services/EncryptAndUpload";
import { TESTNET_MARKETPLACE_ID } from "@/constants";
const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [inputQuery, setInputQuery] = useState("");
  const suiClient = useSuiClient();
      const [prompts, setPrompts] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    priceRange: [0, 100],
    ratingMin: 0,
    models: [],
    categories: [],
    sortBy: "popular",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputQuery);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };
      useEffect(() => {
        if (!suiClient) return;
        const fetchAndSet = async () => {
          try {
            console.log('PromptList: starting fetch');
            const onChainPrompts = await fetchPrompts(suiClient, TESTNET_MARKETPLACE_ID);
            console.log('PromptList: onChainPrompts:', onChainPrompts);
            const service = walrusServices.find((s) => s.id === 'service1');
            const combined = await Promise.all(
              onChainPrompts.map(async (prompt) => {
                try {
                  const res = await fetch(`${service?.aggregatorUrl}/v1/blobs/${prompt.metadataUri}`);
                  if (!res.ok) throw new Error(`HTTP ${res.status}`);
                  const meta = await res.json();
                  console.log('PromptList: metadata for', prompt.metadataUri, meta);
                  return { ...prompt, title: meta.title, description: meta.description };
                } catch (metaErr) {
                  console.error('PromptList: metadata error', prompt.metadataUri, metaErr);
                  return { ...prompt, title: '', description: '' };
                }
              })
            );
            console.log('PromptList: combined:', combined);
            setPrompts(combined);
          } catch (err) {
            console.error('PromptList: fetch error', err);
          }
        };
        fetchAndSet();
      }, [suiClient]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="relative mb-12">
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-neon-purple/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-neon-blue/20 rounded-full blur-xl animate-pulse"></div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2 relative z-10">AI Prompt Marketplace</h1>
          <div className="h-1 w-20 bg-gradient-to-r from-neon-purple to-neon-blue mb-4"></div>
          <p className="text-muted-foreground max-w-3xl relative z-10">
            Browse our selection of verified AI prompts from top prompt engineers. Test before you buy and get proven results for your projects.
          </p>
        </div>

        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex items-center max-w-2xl">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for prompts..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-card border-border"
              />
            </div>
            <Button type="submit" className="ml-2 bg-lavender-500 hover:bg-lavender-600 text-white">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-64 flex-shrink-0">
            <div className="sticky top-20">
              <FilterSidebar onFilterChange={handleFilterChange} />
            </div>
          </div>
          <div className="flex-grow">
        
            <InfinitePromptList prompts={prompts} filters={filters} searchQuery={searchQuery} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Marketplace;