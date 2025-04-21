import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text, Image, RefreshCw, ChevronDown } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";

interface FilterSidebarProps {
  onFilterChange: (filters: any) => void;
}

const FilterSidebar = ({ onFilterChange }: FilterSidebarProps) => {
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [ratingMin, setRatingMin] = useState(0);
  const [sortBy, setSortBy] = useState("popular");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [outputType, setOutputType] = useState("all");
  const [openAccordion, setOpenAccordion] = useState<string | null>("output-type"); // Only one open at a time

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    updateFilters({ priceRange: value });
  };

  const handleRatingChange = (value: number[]) => {
    setRatingMin(value[0]);
    updateFilters({ ratingMin: value[0] });
  };

  const handleModelToggle = (model: string) => {
    const updatedModels = selectedModels.includes(model)
      ? selectedModels.filter((m) => m !== model)
      : [...selectedModels, model];
    setSelectedModels(updatedModels);
    updateFilters({ models: updatedModels });
  };

  const handleCategoryToggle = (category: string) => {
    const updatedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(updatedCategories);
    updateFilters({ categories: updatedCategories });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    updateFilters({ sortBy: value });
  };

  const handleOutputTypeChange = (value: string) => {
    setOutputType(value);
    updateFilters({ outputType: value });
  };

  const resetFilters = () => {
    setPriceRange([0, 100]);
    setRatingMin(0);
    setSortBy("popular");
    setSelectedModels([]);
    setSelectedCategories([]);
    setOutputType("all");

    onFilterChange({
      priceRange: [0, 100],
      ratingMin: 0,
      models: [],
      categories: [],
      sortBy: "popular",
      outputType: "all",
    });
  };

  const updateFilters = (partialFilters: any) => {
    onFilterChange({
      priceRange,
      ratingMin,
      models: selectedModels,
      categories: selectedCategories,
      sortBy,
      outputType,
      ...partialFilters,
    });
  };

  return (
    <div className="glass-card rounded-xl border border-purple-500/20 p-6 space-y-6 backdrop-blur-md bg-gray-900/80 shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Filters
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={resetFilters}
          className="text-xs text-gray-300 hover:text-white border-cyan-500/30 hover:bg-cyan-500/10 flex items-center transition-all duration-300"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>

      <Accordion.Root
        type="single"
        value={openAccordion || ""}
        onValueChange={(value) => setOpenAccordion(value || null)}
        className="space-y-4"
      >
        {/* Output Type Accordion */}
        <Accordion.Item value="output-type" className="border-b border-purple-500/20">
          <Accordion.Trigger className="w-full flex items-center justify-between py-3 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200">
            <span>Output Type</span>
            <ChevronDown className={`h-4 w-4 transform transition-transform duration-300 ${openAccordion === "output-type" ? "rotate-180" : ""}`} />
          </Accordion.Trigger>
          <Accordion.Content className="pt-2 pb-4">
            <Tabs value={outputType} onValueChange={handleOutputTypeChange} className="w-full">
              <TabsList className="grid grid-cols-3 bg-gray-800/50 border border-purple-500/20 rounded-md">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-gray-300 hover:bg-gray-700/50 transition-all duration-200"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="text"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-gray-300 hover:bg-gray-700/50 transition-all duration-200"
                >
                  <Text className="h-4 w-4 mr-1" />
                  Text
                </TabsTrigger>
                <TabsTrigger
                  value="image"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-gray-300 hover:bg-gray-700/50 transition-all duration-200"
                >
                  <Image className="h-4 w-4 mr-1" />
                  Image
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </Accordion.Content>
        </Accordion.Item>

        {/* Price Range Accordion */}
        <Accordion.Item value="price-range" className="border-b border-purple-500/20">
          <Accordion.Trigger className="w-full flex items-center justify-between py-3 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200">
            <span>Price Range</span>
            <ChevronDown className={`h-4 w-4 transform transition-transform duration-300 ${openAccordion === "price-range" ? "rotate-180" : ""}`} />
          </Accordion.Trigger>
          <Accordion.Content className="pt-2 pb-4">
            <Slider
              defaultValue={priceRange}
              max={100}
              step={1}
              value={priceRange}
              onValueChange={handlePriceChange}
              className="[&>span]:bg-purple-500 [&>div]:bg-cyan-500/30"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* Minimum Rating Accordion */}
        <Accordion.Item value="rating" className="border-b border-purple-500/20">
          <Accordion.Trigger className="w-full flex items-center justify-between py-3 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200">
            <span>Minimum Rating</span>
            <ChevronDown className={`h-4 w-4 transform transition-transform duration-300 ${openAccordion === "rating" ? "rotate-180" : ""}`} />
          </Accordion.Trigger>
          <Accordion.Content className="pt-2 pb-4">
            <Slider
              defaultValue={[ratingMin]}
              max={5}
              step={0.5}
              value={[ratingMin]}
              onValueChange={handleRatingChange}
              className="[&>span]:bg-cyan-500 [&>div]:bg-purple-500/30"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>{ratingMin} stars</span>
              <span>5 stars</span>
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* AI Models Accordion */}
        <Accordion.Item value="models" className="border-b border-purple-500/20">
          <Accordion.Trigger className="w-full flex items-center justify-between py-3 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200">
            <span>AI Models</span>
            <ChevronDown className={`h-4 w-4 transform transition-transform duration-300 ${openAccordion === "models" ? "rotate-180" : ""}`} />
          </Accordion.Trigger>
          <Accordion.Content className="pt-2 pb-4">
            <div className="space-y-3">
              {["GPT-4", "GPT-3.5", "Claude", "Mistral", "Midjourney", "DALL-E", "Stable Diffusion"].map((model) => (
                <div key={model} className="flex items-center">
                  <Checkbox
                    id={`model-${model}`}
                    checked={selectedModels.includes(model)}
                    onCheckedChange={() => handleModelToggle(model)}
                    className="border-purple-500/50 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 transition-colors duration-200"
                  />
                  <Label htmlFor={`model-${model}`} className="ml-2 text-gray-300 hover:text-white transition-colors duration-200">
                    {model}
                  </Label>
                </div>
              ))}
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* Categories Accordion */}
        <Accordion.Item value="categories" className="border-b border-purple-500/20">
          <Accordion.Trigger className="w-full flex items-center justify-between py-3 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200">
            <span>Categories</span>
            <ChevronDown className={`h-4 w-4 transform transition-transform duration-300 ${openAccordion === "categories" ? "rotate-180" : ""}`} />
          </Accordion.Trigger>
          <Accordion.Content className="pt-2 pb-4">
            <div className="space-y-3">
              {["Copywriting", "Content Creation", "SEO", "Marketing", "Creative Writing", "Technical", "Art & Design", "Analytics"].map((category) => (
                <div key={category} className="flex items-center">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryToggle(category)}
                    className="border-cyan-500/50 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500 transition-colors duration-200"
                  />
                  <Label htmlFor={`category-${category}`} className="ml-2 text-gray-300 hover:text-white transition-colors duration-200">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* Sort By Accordion */}
        <Accordion.Item value="sort-by" className="border-b border-purple-500/20">
          <Accordion.Trigger className="w-full flex items-center justify-between py-3 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200">
            <span>Sort By</span>
            <ChevronDown className={`h-4 w-4 transform transition-transform duration-300 ${openAccordion === "sort-by" ? "rotate-180" : ""}`} />
          </Accordion.Trigger>
          <Accordion.Content className="pt-2 pb-4">
            <RadioGroup value={sortBy} onValueChange={handleSortChange} className="space-y-2">
              {["popular", "recent", "price-low", "price-high", "rating"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option}
                    id={`sort-${option}`}
                    className="border-purple-500/50 text-purple-500 data-[state=checked]:border-purple-500 data-[state=checked]:text-purple-500"
                  />
                  <Label htmlFor={`sort-${option}`} className="text-gray-300 hover:text-white transition-colors duration-200">
                    {option === "popular" ? "Most Popular" :
                     option === "recent" ? "Most Recent" :
                     option === "price-low" ? "Price: Low to High" :
                     option === "price-high" ? "Price: High to Low" :
                     "Highest Rated"}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
};

export default FilterSidebar;