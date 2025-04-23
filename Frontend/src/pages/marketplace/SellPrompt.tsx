import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/components/ui/use-toast"
import MainLayout from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import axios from "axios"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Info, PlusCircle, Trash } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SellPrompt = () => {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    category: "",
    subcategory: "", // Add this for subcategory selection
    model: "",
    price: 19.99,
    testPrice: 1.99, // Add separate testPrice field
    systemPrompt: "",
    userPrompt: "",
    sampleInputs: [
      "A minimal and surreal design with a color scheme of dreamy pastels and soft gradients; using woodcut and color processing printing techniques with surreal details; inspired by surrealism and dreamlike art; the focus is lovers; mood is surreal and introspective. --v 6.1",
    ],
    sampleOutputs: [""],
    sampleImages: [
      "https://assets.promptbase.com/DALLE_IMAGES%2FVAXItKojEQXmXUs4prJNIftWE6T2%2Fresized%2F1725762092286a_200x200.webp?alt=media&token=4791f95d-7942-4474-abcc-9068465e906f",
    ],
  })

  const [showAIModel, setShowAiModel] = useState(false)
  const [modelSettings, setModelSettings] = useState({
    temperature: [0.7],
    maxTokens: [1500],
    topP: [0.9],
    frequencyPenalty: [0.5],
    presencePenalty: [0.5],
  })
  const [currentSuiPrice, setCurrentSuiPrice] = useState(0)
  const [activeTab, setActiveTab] = useState("details")
  const [imageSizes, setImageSizes] = useState<Record<number, string>>({})

  useEffect(() => {
    const apiKey = "CG-JwZR5W5Wk65HhZTgD6cUejGt" // Removed trailing tab

    const fetchCoinPriceHistory = async (
      coinId,
      timeDeltaInSeconds = 360,
      pricePrecision = 5
    ) => {
      const nowTimestamp = Math.floor(Date.now() / 1000)
      const fromTimestamp = nowTimestamp - timeDeltaInSeconds

      const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range`

      try {
        const { data } = await axios.get(url, {
          params: {
            vs_currency: "usd",
            from: fromTimestamp,
            to: nowTimestamp,
            precision: pricePrecision,
          },
          headers: {
            accept: "application/json",
            "x-cg-demo-api-key": "CG-JwZR5W5Wk65HhZTgD6cUejGt",
          },
        })

        console.log("response", data)
        const latestprice = data.prices
        console.log("latestprice", latestprice[0][1])

        setCurrentSuiPrice(latestprice[0][1])
        return data
      } catch (error) {
        console.error("Error fetching coin market data:", error)
        return { prices: [], market_caps: [], total_volumes: [] }
      }
    }
    fetchCoinPriceHistory("sui")
  }, [])

  useEffect(() => {
    // Keep test price at 10% of main price or lower
    const maxTestPrice = Math.min(formData.price * 0.1, 9.99)
    if (formData.testPrice > maxTestPrice) {
      setFormData((prev) => ({
        ...prev,
        testPrice: parseFloat(maxTestPrice.toFixed(2)),
      }))
    }
  }, [formData.price, formData.testPrice])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const models = [
    {
      id: 1,
      name: "dall-e-3",
    },
    {
      id: 2,
      name: "dall-e-2",
    },
    {
      id: 3,
      name: "Infermatic/Llama-3.3-70B-Instruct-FP8-Dynamic",
    },
    {
      id: 4,
      name: "Qwen/QwQ-32B",
    },
    {
      id: 5,
      name: "mistralai/Mistral-Nemo-Instruct-2407",
    },
  ]

  const handleSelectChange = (name: string, value: string) => {
    if (name === "category") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        subcategory: "", // Reset subcategory when category changes
      }))
      // Show AI model selection only if prompt is selected
      setShowAiModel(value === "prompt")
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSampleChange = (
    index: number,
    field: "sampleInputs" | "sampleOutputs",
    value: string
  ) => {
    setFormData((prev) => {
      const updated = [...prev[field]]
      updated[index] = value
      return {
        ...prev,
        [field]: updated,
      }
    })
  }

  const getImageSize = async (url: string, index: number) => {
    try {
      const response = await fetch(url, { method: "HEAD" })
      const contentLength = response.headers.get("Content-Length")
      if (contentLength) {
        const sizeInBytes = parseInt(contentLength, 10)
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2)
        setImageSizes((prev) => ({
          ...prev,
          [index]: sizeInMB,
        }))
      }
    } catch (error) {
      console.error("Error getting image size:", error)
      setImageSizes((prev) => ({
        ...prev,
        [index]: "Unknown",
      }))
    }
  }

  const handleImageUpload = (index: number, imageUrl: string) => {
    setFormData((prev) => {
      const updatedImages = [...prev.sampleImages]
      updatedImages[index] = imageUrl

      if (imageUrl) {
        // Get file size for URLs
        if (imageUrl.startsWith("http")) {
          getImageSize(imageUrl, index)
        }
        // For file uploads, we already have the file object
        else if (imageUrl.startsWith("blob:")) {
          // Size will be shown when the file is selected
        }
      } else {
        // Clear size info when image is removed
        setImageSizes((prev) => {
          const updated = { ...prev }
          delete updated[index]
          return updated
        })
      }

      return {
        ...prev,
        sampleImages: updatedImages,
      }
    })
  }

  const addSample = () => {
    setFormData((prev) => ({
      ...prev,
      sampleInputs: [...prev.sampleInputs, ""],
      sampleOutputs: [...prev.sampleOutputs, ""],
      sampleImages: [...prev.sampleImages, ""],
    }))
  }

  const removeSample = (index: number) => {
    setFormData((prev) => {
      const updatedInputs = [...prev.sampleInputs]
      const updatedOutputs = [...prev.sampleOutputs]
      const updatedImages = [...prev.sampleImages]

      updatedInputs.splice(index, 1)
      updatedOutputs.splice(index, 1)
      updatedImages.splice(index, 1)

      return {
        ...prev,
        sampleInputs: updatedInputs,
        sampleOutputs: updatedOutputs,
        sampleImages: updatedImages,
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.category ||
      !formData.model ||
      !formData.systemPrompt
    ) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      })
      return
    }

    // Check sample inputs/outputs
    if (formData.sampleInputs[0] === "" || formData.sampleOutputs[0] === "") {
      toast({
        title: "Sample required",
        description: "Please provide at least one sample input and output.",
        variant: "destructive",
      })
      return
    }

    // Submit form - this would normally call an API
    toast({
      title: "Prompt Submitted",
      description: "Your prompt has been submitted for review.",
    })

    setTimeout(() => {
      navigate("/dashboard/my-prompts")
    }, 2000)
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative mb-12">
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-neon-purple/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-neon-blue/20 rounded-full blur-xl animate-pulse"></div>

          <h1 className="text-3xl font-bold text-foreground mb-2 relative z-10">
            Sell Your Prompt
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-neon-purple to-neon-blue mb-4"></div>
          <p className="text-muted-foreground max-w-3xl relative z-10">
            Share your expertise with the community and earn by selling your AI
            prompts.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
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
                      Choose a clear, descriptive title that explains what your
                      prompt does.
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
                      This appears in search results and cards (100-150
                      characters recommended).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleSelectChange("category", value)
                        }
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prompt">Prompt </SelectItem>
                          <SelectItem value="premium-content">
                            Premium Content
                          </SelectItem>
                          <SelectItem value="dataset">Dataset</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.category === "premium-content" && (
                      <div className="space-y-2">
                        <Label htmlFor="subcategory">Content Type</Label>
                        <Select
                          value={formData.subcategory}
                          onValueChange={(value) =>
                            handleSelectChange("subcategory", value)
                          }
                        >
                          <SelectTrigger id="subcategory">
                            <SelectValue placeholder="Select content type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="books">Books</SelectItem>
                            <SelectItem value="courses">Courses</SelectItem>
                            <SelectItem value="templates">Templates</SelectItem>
                            <SelectItem value="guides">
                              Guides & Tutorials
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {formData.category === "prompt" && (
                      <div className="space-y-2">
                        <Label htmlFor="model">AI Model</Label>
                        <Select
                          value={formData.model}
                          onValueChange={(value) =>
                            handleSelectChange("model", value)
                          }
                        >
                          <SelectTrigger id="model">
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                          <SelectContent>
                            {models.map((item) => {
                              return (
                                <SelectItem value={item.name} key={item.id}>
                                  {item.name}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="price">Price (USD)</Label>
                      <span className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 px-3 py-1 rounded-full">
                        <span className="text-lg font-semibold text-white">
                          ${formData.price.toFixed(2)}
                        </span>
                        {currentSuiPrice > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-gray-400">
                              ≈
                            </span>
                            <span className="text-xs font-medium text-blue-400">
                              {(formData.price / currentSuiPrice).toFixed(2)}{" "}
                              SUI
                            </span>
                          </div>
                        )}
                      </span>
                    </div>
                    <Slider
                      id="price"
                      min={1.99}
                      max={99.99}
                      step={1}
                      value={[formData.price]}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, price: value[0] }))
                      }
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>$1.99</span>
                      <span>$99.99</span>
                    </div>
                    <p className="text-xs text-gray-500 pt-1">
                      Set a competitive price based on the complexity and value
                      of your prompt.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="testPrice">Test Price (USD)</Label>

                      <span className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 px-3 py-1 rounded-full">
                        <span className="text-lg font-semibold text-white">
                          ${formData.testPrice.toFixed(2)}
                        </span>
                        {currentSuiPrice > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-gray-400">
                              ≈
                            </span>
                            <span className="text-xs font-medium text-blue-400">
                              {(formData.testPrice / currentSuiPrice).toFixed(
                                2
                              )}{" "}
                              SUI
                            </span>
                          </div>
                        )}
                      </span>
                    </div>
                    <Slider
                      id="testPrice"
                      min={0.99}
                      max={Math.min(formData.price * 0.1, 9.99)} // Maximum 10% of main price or $9.99
                      step={0.5}
                      value={[formData.testPrice]}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          testPrice: value[0],
                        }))
                      }
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>$0.99</span>
                      <span>
                        ${Math.min(formData.price * 0.1, 9.99).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 pt-1">
                      Test price must be 10% or less than the original price ($
                      {formData.price.toFixed(2)}).
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Info className="h-4 w-4" />
                              <span className="sr-only">Info</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>
                              This is the prompt that buyers will receive after
                              purchase. Make it detailed and comprehensive for
                              best results and the prompt will be encrypted.
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
                      This is the complete prompt that buyers will receive after
                      purchase.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="userPrompt">User Prompt</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Info className="h-4 w-4" />
                              <span className="sr-only">Info</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>
                              This is the user prompt. This part won't be
                              encrypted.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Textarea
                      id="userPrompt"
                      name="userPrompt"
                      placeholder="Enter your user prompt here"
                      value={formData.userPrompt}
                      onChange={handleInputChange}
                      className="min-h-[200px] font-mono text-sm"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      This is the prompt users will see and can customize.
                    </p>
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
                    {formData.sampleInputs.map((input, index) => (
                      <div
                        key={index}
                        className="space-y-4 border rounded-lg p-4 relative"
                      >
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
                          <Label htmlFor={`sampleInput-${index}`}>
                            Sample Input {index + 1}
                          </Label>
                          <Textarea
                            id={`sampleInput-${index}`}
                            placeholder="Enter a sample input"
                            value={formData.sampleInputs[index]}
                            onChange={(e) =>
                              handleSampleChange(
                                index,
                                "sampleInputs",
                                e.target.value
                              )
                            }
                            className="resize-none"
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`sampleOutput-${index}`}>
                            Sample Output {index + 1}
                          </Label>
                          <div className="space-y-4">
                            {formData.category === "prompt" ? (
                              <div className="space-y-3">
                                {formData.sampleImages[index] ? (
                                  // Display existing image with controls
                                  <div className="relative group">
                                    <img
                                      src={formData.sampleImages[index]}
                                      alt={`Sample ${index + 1}`}
                                      className="rounded-md max-h-64 w-auto mx-auto border border-purple-300/30"
                                      onLoad={(e) => {
                                        // For blob URLs or local files, we can get size from the image element
                                        if (
                                          formData.sampleImages[
                                            index
                                          ].startsWith("blob:") &&
                                          !imageSizes[index]
                                        ) {
                                          const img =
                                            e.target as HTMLImageElement
                                          // Estimate file size based on dimensions and bit depth
                                          // This is a rough estimate
                                          const estimatedSize = (
                                            (img.naturalWidth *
                                              img.naturalHeight *
                                              4) /
                                            (1024 * 1024)
                                          ).toFixed(2)
                                          setImageSizes((prev) => ({
                                            ...prev,
                                            [index]: estimatedSize,
                                          }))
                                        }
                                      }}
                                      onError={(e) => {
                                        // Fallback to placeholder on error
                                        e.currentTarget.src =
                                          "https://placehold.co/600x400/252232/e2e8f0?text=Sample+Image"
                                        setImageSizes((prev) => ({
                                          ...prev,
                                          [index]: "N/A",
                                        }))
                                      }}
                                    />
                                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs py-1 px-2 rounded">
                                      {imageSizes[index]
                                        ? `${imageSizes[index]} MB`
                                        : "Calculating size..."}
                                    </div>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                          handleImageUpload(index, "")
                                        }
                                      >
                                        <Trash className="h-3 w-3 mr-1" />
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  // Show upload interface if no image exists
                                  <div className="flex items-center justify-center border border-dashed border-purple-300/30 rounded-md p-8 bg-purple-500/5 hover:bg-purple-500/10 transition-colors">
                                    <div className="text-center">
                                      <label
                                        htmlFor={`imageUpload-${index}`}
                                        className="cursor-pointer"
                                      >
                                        <div className="flex flex-col items-center">
                                          <PlusCircle className="h-8 w-8 text-purple-400 mb-2" />
                                          <span className="text-sm font-medium text-gray-300">
                                            {index === 0
                                              ? "Add required sample image"
                                              : "Add sample image"}
                                          </span>
                                          <span className="text-xs text-gray-500 mt-1">
                                            PNG, JPG or WEBP (max 5MB)
                                          </span>
                                        </div>
                                        <Input
                                          id={`imageUpload-${index}`}
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            if (
                                              e.target.files &&
                                              e.target.files[0]
                                            ) {
                                              // Create a temporary URL for preview
                                              const url = URL.createObjectURL(
                                                e.target.files[0]
                                              )

                                              // Get file size in MB
                                              const fileSizeMB = (
                                                e.target.files[0].size /
                                                (1024 * 1024)
                                              ).toFixed(2)
                                              setImageSizes((prev) => ({
                                                ...prev,
                                                [index]: fileSizeMB,
                                              }))

                                              handleImageUpload(index, url)
                                            }
                                          }}
                                        />
                                      </label>
                                    </div>
                                  </div>
                                )}

                                {/* URL input always available as an alternative */}
                                {/* <div className="flex items-center gap-2">
                                  <Input
                                    type="text"
                                    placeholder="Or paste image URL"
                                    value={formData.sampleImages[index] || ""}
                                    onChange={(e) =>
                                      handleImageUpload(index, e.target.value)
                                    }
                                    className="text-xs bg-background"
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="whitespace-nowrap"
                                    onClick={() => {
                                      if (formData.sampleImages[index]) {
                                        const img = new Image()
                                        img.onload = () => {
                                          toast({
                                            title: "Image loaded successfully",
                                            variant: "default",
                                          })
                                        }
                                        img.onerror = () => {
                                          toast({
                                            title: "Invalid image URL",
                                            description:
                                              "Using a placeholder image instead",
                                            variant: "destructive",
                                          })
                                          handleImageUpload(
                                            index,
                                            "https://placehold.co/600x400/252232/e2e8f0?text=Sample+Image"
                                          )
                                        }
                                        img.src = formData.sampleImages[index]
                                      }
                                    }}
                                  >
                                    Test URL
                                  </Button>
                                </div> */}

                                {/* Text description field */}
                                {/* <Textarea
                                  placeholder="Describe what this image shows (optional)"
                                  value={formData.sampleOutputs[index] || ""}
                                  onChange={(e) =>
                                    handleSampleChange(
                                      index,
                                      "sampleOutputs",
                                      e.target.value
                                    )
                                  }
                                  className="resize-none text-sm"
                                  rows={2}
                                /> */}
                              </div>
                            ) : (
                              // For non-image prompts, show regular text area
                              <Textarea
                                id={`sampleOutput-${index}`}
                                placeholder="Provide the corresponding output"
                                value={formData.sampleOutputs[index]}
                                onChange={(e) =>
                                  handleSampleChange(
                                    index,
                                    "sampleOutputs",
                                    e.target.value
                                  )
                                }
                                className="resize-none"
                                rows={6}
                              />
                            )}
                          </div>
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
                          Provide at least one high-quality example to help
                          buyers understand what your prompt can do.
                        </li>
                        <li>
                          The outputs will be verified by our Marketplace to
                          ensure authenticity.
                        </li>
                        <li>
                          Misleading samples may result in your prompt being
                          removed from the marketplace.
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    type="button"
                    className="px-8 py-6 text-lg border-purple-500 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-all duration-300"
                    onClick={() => setActiveTab("content")}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink hover:from-neon-purple/90 hover:via-neon-blue/90 hover:to-neon-pink/90 px-4 py-4 text-md text-white font-light group transition-all duration-300"
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
  )
}

export default SellPrompt
