
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Info, PlusCircle, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SellPrompt = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    category: "",
    model: "",
    price: 19.99,
    systemPrompt: "",
    sampleInputs: ["", ""],
    sampleOutputs: ["", ""],
  });

  const [modelSettings, setModelSettings] = useState({
    temperature: [0.7],
    maxTokens: [1500],
    topP: [0.9],
    frequencyPenalty: [0.5],
    presencePenalty: [0.5],
  });

  const [activeTab, setActiveTab] = useState("details");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSampleChange = (index: number, field: "sampleInputs" | "sampleOutputs", value: string) => {
    setFormData((prev) => {
      const updated = [...prev[field]];
      updated[index] = value;
      return {
        ...prev,
        [field]: updated,
      };
    });
  };

  const addSample = () => {
    setFormData((prev) => ({
      ...prev,
      sampleInputs: [...prev.sampleInputs, ""],
      sampleOutputs: [...prev.sampleOutputs, ""],
    }));
  };

  const removeSample = (index: number) => {
    setFormData((prev) => {
      const updatedInputs = [...prev.sampleInputs];
      const updatedOutputs = [...prev.sampleOutputs];
      
      updatedInputs.splice(index, 1);
      updatedOutputs.splice(index, 1);
      
      return {
        ...prev,
        sampleInputs: updatedInputs,
        sampleOutputs: updatedOutputs,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.category || !formData.model || !formData.systemPrompt) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    // Check sample inputs/outputs
    if (formData.sampleInputs[0] === "" || formData.sampleOutputs[0] === "") {
      toast({
        title: "Sample required",
        description: "Please provide at least one sample input and output.",
        variant: "destructive",
      });
      return;
    }
    
    // Submit form - this would normally call an API
    toast({
      title: "Prompt Submitted",
      description: "Your prompt has been submitted for review.",
    });
    
    setTimeout(() => {
      navigate("/dashboard/my-prompts");
    }, 2000);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative mb-12">
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-neon-purple/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-neon-blue/20 rounded-full blur-xl animate-pulse"></div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2 relative z-10">Sell Your Prompt</h1>
          <div className="h-1 w-20 bg-gradient-to-r from-neon-purple to-neon-blue mb-4"></div>
          <p className="text-muted-foreground max-w-3xl relative z-10">
          Share your expertise with the community and earn by selling your AI prompts.
          </p>
        </div>
 

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Basic Details</TabsTrigger>
              <TabsTrigger value="content">Prompt Content</TabsTrigger>
              <TabsTrigger value="samples">Samples & Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Provide the key details about your prompt.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="E.g., SEO Blog Post Generator"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Choose a clear, descriptive title that explains what your prompt does.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Brief description of what your prompt does"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      className="resize-none"
                      rows={2}
                    />
                    <p className="text-xs text-gray-500">
                      This appears in search results and cards (100-150 characters recommended).
                    </p>
                  </div>
                  
              
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleSelectChange("category", value)}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="copywriting">Copywriting</SelectItem>
                          <SelectItem value="content">Content Creation</SelectItem>
                          <SelectItem value="seo">SEO</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="creative">Creative Writing</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="chatgpt">ChatGPT</SelectItem>
                          <SelectItem value="midjourney">Midjourney</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="model">AI Model</Label>
                      <Select
                        value={formData.model}
                        onValueChange={(value) => handleSelectChange("model", value)}
                      >
                        <SelectTrigger id="model">
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GPT-4">GPT-4</SelectItem>
                          <SelectItem value="GPT-3.5">GPT-3.5</SelectItem>
                          <SelectItem value="Claude">Claude</SelectItem>
                          <SelectItem value="Midjourney">Midjourney</SelectItem>
                          <SelectItem value="DALL-E">DALL-E</SelectItem>
                          <SelectItem value="Stable Diffusion">Stable Diffusion</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="price">Price (USD)</Label>
                      <span className="text-lg font-medium">${formData.price.toFixed(2)}</span>
                    </div>
                    <Slider
                      id="price"
                      min={1.99}
                      max={99.99}
                      step={1}
                      value={[formData.price]}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, price: value[0] }))}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>$1.99</span>
                      <span>$99.99</span>
                    </div>
                    <p className="text-xs text-gray-500 pt-1">
                      Set a competitive price based on the complexity and value of your prompt.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    type="button"
                    className=" px-8 py-6 text-lg border-purple-500 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-all duration-300"

                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveTab("content")}
                    className="px-8 py-6 text-lg border-purple-500 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-all duration-300"

                  >
                    Next
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Prompt Content</CardTitle>
                  <CardDescription>
                    Enter your prompt and configure model settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="systemPrompt">System Prompt</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Info className="h-4 w-4" />
                              <span className="sr-only">Info</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>
                              This is the prompt that buyers will receive after purchase. 
                              Make it detailed and comprehensive for best results.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Textarea
                      id="systemPrompt"
                      name="systemPrompt"
                      placeholder="Enter your full system prompt here"
                      value={formData.systemPrompt}
                      onChange={handleInputChange}
                      className="min-h-[200px] font-mono text-sm"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      This is the complete prompt that buyers will receive after purchase.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Model Settings</h3>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Info className="h-4 w-4" />
                              <span className="sr-only">Info</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>
                              Adjust these settings to optimize how the AI model processes your prompt.
                              Different values produce different results.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Temperature: {modelSettings.temperature[0]}</Label>
                          </div>
                          <Slider
                            min={0}
                            max={2}
                            step={0.1}
                            value={modelSettings.temperature}
                            onValueChange={(value) => 
                              setModelSettings(prev => ({ ...prev, temperature: value }))
                            }
                          />
                          <p className="text-xs text-gray-500">
                            Controls randomness: Lower is more focused, higher is more creative
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Max Tokens: {modelSettings.maxTokens[0]}</Label>
                          </div>
                          <Slider
                            min={100}
                            max={4000}
                            step={100}
                            value={modelSettings.maxTokens}
                            onValueChange={(value) => 
                              setModelSettings(prev => ({ ...prev, maxTokens: value }))
                            }
                          />
                          <p className="text-xs text-gray-500">
                            Maximum length of the generated text
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Top P: {modelSettings.topP[0]}</Label>
                          </div>
                          <Slider
                            min={0.1}
                            max={1}
                            step={0.05}
                            value={modelSettings.topP}
                            onValueChange={(value) => 
                              setModelSettings(prev => ({ ...prev, topP: value }))
                            }
                          />
                          <p className="text-xs text-gray-500">
                            Controls diversity via nucleus sampling
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Frequency Penalty: {modelSettings.frequencyPenalty[0]}</Label>
                          </div>
                          <Slider
                            min={0}
                            max={2}
                            step={0.1}
                            value={modelSettings.frequencyPenalty}
                            onValueChange={(value) => 
                              setModelSettings(prev => ({ ...prev, frequencyPenalty: value }))
                            }
                          />
                          <p className="text-xs text-gray-500">
                            Reduces repetition of token sequences
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    type="button"
                    className="px-8 py-6 text-lg border-purple-500 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-all duration-300"

                    onClick={() => setActiveTab("details")}
                  >
                    Back
                  </Button>
                  <Button 
                  variant="outline"
                    type="button" 
                    onClick={() => setActiveTab("samples")}
                    className=" px-8 py-6 text-lg border-purple-500 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-all duration-300"
                  >
                    Next
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="samples" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sample Inputs & Outputs</CardTitle>
                  <CardDescription>
                    Provide examples that showcase your prompt's capabilities.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {formData.sampleInputs.map((_, index) => (
                      <div key={index} className="space-y-4 border rounded-lg p-4 relative">
                        <div className="absolute top-4 right-4">
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSample(index)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`sampleInput-${index}`}>Sample Input {index + 1}</Label>
                          <Textarea
                            id={`sampleInput-${index}`}
                            placeholder="Enter a sample input"
                            value={formData.sampleInputs[index]}
                            onChange={(e) => handleSampleChange(index, "sampleInputs", e.target.value)}
                            className="resize-none"
                            rows={2}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`sampleOutput-${index}`}>Sample Output {index + 1}</Label>
                          <Textarea
                            id={`sampleOutput-${index}`}
                            placeholder="Provide the corresponding output"
                            value={formData.sampleOutputs[index]}
                            onChange={(e) => handleSampleChange(index, "sampleOutputs", e.target.value)}
                            className="resize-none"
                            rows={6}
                          />
                        </div>
                      </div>
                    ))}
                    
                    {formData.sampleInputs.length < 5 && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={addSample}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Sample
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
                      <h4 className="font-medium mb-2">Important Notes</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>
                          Provide at least one high-quality example to help buyers understand what your prompt can do.
                        </li>
                        <li>
                          The outputs will be verified by our blockchain verification system to ensure authenticity.
                        </li>
                        <li>
                          Misleading samples may result in your prompt being removed from the marketplace.
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    type="button"
                    className=" px-8 py-6 text-lg border-purple-500 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-all duration-300"

                    onClick={() => setActiveTab("content")}
                  >
                    Back
                  </Button>
                  <Button type="submit" 
                  className=" bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink hover:from-neon-purple/90 hover:via-neon-blue/90 hover:to-neon-pink/90 px-4 py-4 text-md text-white font-light group transition-all duration-300"
                  >
                    Submit Prompt
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </MainLayout>
  );
};

export default SellPrompt;
