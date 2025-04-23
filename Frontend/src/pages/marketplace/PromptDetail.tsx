import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useToast } from "@/components/ui/use-toast"
import MainLayout from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Star,
  Zap,
  CheckCircle,
  MessageSquare,
  Shield,
  ArrowRight,
  ThumbsUp,
  User,
  Clock,
  Wallet,
  Copy,
  Info,
  Sparkles,
  ImageIcon,
  Code,
  Lock,
  Loader,
} from "lucide-react"
import { useZKLogin } from "react-sui-zk-login-kit"
import { useCurrentAccount } from "@mysten/dapp-kit"

const PromptDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [prompt, setPrompt] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userInput, setUserInput] = useState("")
  const [output, setOutput] = useState("")
  const [outputImage, setOutputImage] = useState("")
  const [testLoading, setTestLoading] = useState(false)
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [purchased, setPurchased] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState("")
  const [remainingCredits, setRemainingCredits] = useState(5)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [connectingWallet, setConnectingWallet] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { encodedJwt, userSalt, setUserSalt, address, logout } = useZKLogin()
  const account = useCurrentAccount()

  // Sample prompt data - would come from an API in a real application
  useEffect(() => {
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      const samplePrompt = {
        id: id,
        title: "AI Art Style Creator",
        description:
          "Generate beautiful images in various artistic styles with perfectly crafted prompts for Midjourney, DALL-E, or Stable Diffusion.",
        longDescription:
          "This prompt is designed to help artists and designers create beautiful AI-generated images in any style they desire. The prompt guides the AI to create detailed, coherent images with consistent style elements, lighting, and composition. It works with all major image generation models including Midjourney, DALL-E, and Stable Diffusion. The prompt structure has been tested and refined through thousands of generations to produce the highest quality outputs with minimal prompt tweaking required.",
        price: 29.99,
        rating: 4.9,
        reviews: 187,
        model: "Universal",
        supportedModels: ["Midjourney", "DALL-E 3", "Stable Diffusion"],
        modelSettings: {
          temperature: 0.7,
          maxTokens: 1500,
          topP: 0.9,
          frequencyPenalty: 0.5,
          presencePenalty: 0.5,
        },
        category: "Art",
        tags: [
          "art",
          "design",
          "image generation",
          "creative",
          "visual",
          "midjourney",
          "stable diffusion",
          "dalle",
        ],
        author: {
          id: "author7",
          name: "Art Whisperer",
          avatar:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuFzAIR675Zc4LuhA3P2bVCgE6zKcgJIu50Q&s",
          rating: 4.9,
          sales: 319,
          memberSince: "Mar 2023",
        },
        sampleInputs: [
          "Create a cyberpunk cityscape at night with neon lights",
          "Generate a serene watercolor landscape of mountains at sunset",
          "Create a portrait in the style of Van Gogh",
        ],
        sampleOutputImages: [
          "https://images.unsplash.com/photo-1573455494060-c5595004fb6c?q=80&w=2080&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1618331833071-ce81bd50d300?q=80&w=2080&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1614583225154-5fcdda07019e?q=80&w=2080&auto=format&fit=crop",
        ],
        sampleOutputs: [
          "/imagine prompt: cyberpunk cityscape, night scene, neon signs illuminating wet streets, futuristic skyscrapers, flying cars, highly detailed, cinematic lighting, 8k resolution, trending on artstation, by Syd Mead and Blade Runner concept art --ar 16:9 --v 5 --s 750 --q 2",
          "/imagine prompt: serene watercolor landscape, mountains at sunset, soft pastel colors, mist rising from valleys, delicate brushstrokes, impressionistic style, peaceful atmosphere, inspired by traditional Chinese painting --ar 16:9 --v 5",
          "/imagine prompt: portrait in the style of Vincent Van Gogh, thick brushstrokes, vibrant colors, swirling patterns, emotional intensity, starry night background, oil on canvas texture, post-impressionist technique, museum quality --ar 1:1 --v 5 --s 750",
        ],
        systemPrompt:
          "You are an expert AI art prompt engineer with deep knowledge of visual aesthetics, composition, lighting, and the technical parameters of image generation AI models. Your specialty is crafting detailed prompts that produce consistent, high-quality results across different AI image generators. For each request, create a detailed prompt using this structure: [Subject description], [setting/environment], [lighting], [atmosphere], [style reference], [artistic medium], [composition], [color palette], [quality indicators], [negative prompts]. Add model-specific parameters at the end (--ar for aspect ratio, --v for version, etc). Analyze the user's request and expand it with relevant artistic details that will enhance the final image without changing the core concept. Always provide a complete, ready-to-use prompt that can be directly copied to an image generation AI.",
        createdAt: "2023-10-12T11:27:39.822Z",
        updatedAt: "2024-03-20T09:15:21.437Z",
        heroImage:
          "https://nftnow.com/wp-content/uploads/2021/11/RTFKT-Clone-X-Header-1200x400.jpg",
      }

      setPrompt(samplePrompt)
      setLoading(false)
    }, 800)
  }, [id])

  const connectWallet = () => {
    setConnectingWallet(true)
    setTimeout(() => {
      setIsWalletConnected(true)
      setConnectingWallet(false)
      toast({
        title: "Wallet connected successfully",
        description: "Your SUI wallet is now connected to your account.",
      })
    }, 1500)
  }

  const handleTestPrompt = () => {
    if (!userInput.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some text to test this prompt.",
        variant: "destructive",
      })
      return
    }

    if (remainingCredits <= 0) {
      toast({
        title: "No credits remaining",
        description:
          "Purchase more credits or buy this prompt to continue testing.",
        variant: "destructive",
      })
      return
    }

    setTestLoading(true)

    // Simulate API call to test the prompt
    setTimeout(() => {
      // For this prompt, generate an image output
      setOutputImage(
        "https://p.potaufeu.asahi.com/1831-p/picture/27695628/89644a996fdd0cfc9e06398c64320fbe.jpg"
      )

      // Generate appropriate prompt based on user input
      const sampleOutput = `/imagine prompt: ${userInput}, detailed art style, vibrant colors, professional lighting, cinematic composition, 8k resolution, trending on artstation --ar 16:9 --v 5 --s 750 --q 2`

      setOutput(sampleOutput)
      setTestLoading(false)

      // Decrease remaining credits
      setRemainingCredits((prev) => prev - 1)

      toast({
        title: "Prompt tested successfully",
        description: `You have ${remainingCredits - 1} test credits remaining.`,
      })
    }, 2000)
  }

  const handlePurchase = () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your SUI wallet first.",
        variant: "destructive",
      })
      return
    }

    setPurchaseLoading(true)

    // Simulate API call to purchase the prompt
    setTimeout(() => {
      setPurchaseLoading(false)
      setPurchased(true)
      setSystemPrompt(prompt.systemPrompt)

      toast({
        title: "Purchase successful!",
        description: "You now have full access to this prompt.",
      })
    }, 1500)
  }

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.floor(rating)
              ? "text-yellow-400 fill-yellow-400"
              : i < rating
              ? "text-yellow-400 fill-yellow-400 opacity-50"
              : "text-gray-300"
          }`}
        />
      ))
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The prompt has been copied to your clipboard.",
    })
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-lavender-500/20 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-lavender-500/20 rounded w-1/2 mb-8"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <div className="h-40 bg-lavender-500/20 rounded mb-4"></div>
                <div className="h-6 bg-lavender-500/20 rounded mb-2 w-1/3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-lavender-500/20 rounded w-full"></div>
                  <div className="h-4 bg-lavender-500/20 rounded w-full"></div>
                  <div className="h-4 bg-lavender-500/20 rounded w-3/4"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-40 bg-lavender-500/20 rounded"></div>
                <div className="h-10 bg-lavender-500/20 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!prompt) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Prompt Not Found
          </h2>
          <p className="text-muted-foreground mb-8">
            The prompt you're looking for doesn't exist or may have been
            removed.
          </p>
          <Button asChild>
            <Link to="/marketplace" className="text-white">
              Back to Marketplace
            </Link>
          </Button>
        </div>
      </MainLayout>
    )
  }

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(prompt.price)

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/marketplace"
            className="text-white  hover:text-lavender-400 flex items-center"
          >
            <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
            Back to Marketplace
          </Link>
        </div>

        {/* Hero section */}
        <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden mb-8">
          <img
            src={prompt.heroImage}
            alt={prompt.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <div className="flex items-center mb-2"></div>
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              {prompt.title}
            </h1>
          </div>
          <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
            {prompt.supportedModels.map((model: string, index: number) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-black/50 backdrop-blur-md text-white border-white/20"
              >
                {model}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="details" className="">
              <TabsList className="grid w-full grid-cols-4 bg-muted/30">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
                <TabsTrigger value="settings">Model Settings</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="py-6">
                <div className="prose max-w-none text-foreground">
                  <div className="bg-card border border-border rounded-lg p-6 mb-8">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Info className="h-5 w-5 text-neon-blue mr-2" />
                      About this prompt
                    </h3>
                    <p className="mb-6 text-muted-foreground">
                      {prompt.longDescription}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-medium mb-3">Use cases</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <Sparkles className="h-5 w-5 text-neon-yellow mr-2 flex-shrink-0 mt-0.5" />
                            <span>Create stunning AI art in any style</span>
                          </li>
                          <li className="flex items-start">
                            <Sparkles className="h-5 w-5 text-neon-yellow mr-2 flex-shrink-0 mt-0.5" />
                            <span>Generate consistent visual identities</span>
                          </li>
                          <li className="flex items-start">
                            <Sparkles className="h-5 w-5 text-neon-yellow mr-2 flex-shrink-0 mt-0.5" />
                            <span>Produce high-quality concept art</span>
                          </li>
                          <li className="flex items-start">
                            <Sparkles className="h-5 w-5 text-neon-yellow mr-2 flex-shrink-0 mt-0.5" />
                            <span>Save time on prompt engineering</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-medium mb-3">
                          What you'll get
                        </h4>
                        <ul className="space-y-2">
                          {purchased ? (
                            <li className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-neon-green mr-2 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium">
                                  Complete system prompt
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Full access to the optimized AI art prompt
                                  formula
                                </p>
                              </div>
                            </li>
                          ) : (
                            <li className="flex items-start">
                              <Lock className="h-5 w-5 text-neon-purple mr-2 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium">
                                  System prompt (after purchase)
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  The complete prompt formula will be revealed
                                  after purchase
                                </p>
                              </div>
                            </li>
                          )}
                          <li className="flex items-start">
                            <ImageIcon className="h-5 w-5 text-neon-blue mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium">
                                Works with multiple AI models
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Compatible with Midjourney, DALL-E 3, and Stable
                                Diffusion
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-neon-green mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium">
                                Test runs with instant previews
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Try before you buy with real-time results
                              </p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="examples" className="py-6">
                <div className="space-y-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <ImageIcon className="h-5 w-5 text-neon-blue mr-2" />
                    Sample Outputs
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {prompt.sampleOutputImages.map(
                      (image: string, index: number) => (
                        <div key={index} className="space-y-3">
                          <div className="aspect-video rounded-lg overflow-hidden border border-border">
                            <img
                              src={image}
                              alt={`Sample output ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="space-y-2">
                            <p className="font-medium text-sm">
                              {prompt.sampleInputs[index]}
                            </p>
                            <div className="bg-card border border-border rounded-md p-3 text-xs text-muted-foreground font-mono relative group">
                              <p className="overflow-x-auto max-h-24 scrollbar-none">
                                {prompt.sampleOutputs[index]}
                              </p>
                              <button
                                onClick={() =>
                                  handleCopyToClipboard(
                                    prompt.sampleOutputs[index]
                                  )
                                }
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-card p-1 rounded"
                              >
                                <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="py-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Code className="h-5 w-5 text-neon-blue mr-2" />
                    Model Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border border-border bg-card/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Models</CardTitle>
                        <CardDescription>Compatible AI models</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {prompt.supportedModels.map(
                            (model: string, index: number) => (
                              <Badge
                                key={index}
                                className="bg-neon-purple/5 text-white border-neon-purple/7"
                              >
                                {model}
                              </Badge>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-border bg-card/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Temperature</CardTitle>
                        <CardDescription>
                          Controls randomness: lower is more deterministic
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-grow bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-neon-blue to-neon-purple"
                              style={{
                                width: `${
                                  prompt.modelSettings.temperature * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="font-mono text-sm">
                            {prompt.modelSettings.temperature}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-border bg-card/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Max Tokens</CardTitle>
                        <CardDescription>
                          Maximum length of the generated text
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="font-medium">
                          {prompt.modelSettings.maxTokens}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border border-border bg-card/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Top P</CardTitle>
                        <CardDescription>
                          Controls diversity via nucleus sampling
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="font-medium">
                          {prompt.modelSettings.topP}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border border-border bg-card/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          Frequency Penalty
                        </CardTitle>
                        <CardDescription>
                          Reduces repetition of token sequences
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="font-medium">
                          {prompt.modelSettings.frequencyPenalty}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border border-border bg-card/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          Presence Penalty
                        </CardTitle>
                        <CardDescription>
                          Reduces repetition of topics
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="font-medium">
                          {prompt.modelSettings.presencePenalty}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="py-6">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold flex items-center">
                      <MessageSquare className="h-5 w-5 text-neon-blue mr-2" />
                      Customer Reviews
                    </h3>
                    <div className="flex items-center">
                      <div className="flex mr-2">
                        {renderStars(prompt.rating)}
                      </div>
                      <span className="text-muted-foreground">
                        {prompt.rating.toFixed(1)} out of 5 ({prompt.reviews}{" "}
                        reviews)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Sample reviews */}
                    {[
                      {
                        name: "Alex W.",
                        rating: 5,
                        date: "2024-02-28",
                        content:
                          "This prompt has transformed my AI art creation process. The outputs are consistently stunning, and I love how it works equally well with Midjourney and DALL-E. Best money I've spent on prompts!",
                        avatar:
                          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbgbxLOuQhRKRgQD3jXqd4g0Smn5b5x1A-LA&s",
                      },
                      {
                        name: "Sarah J.",
                        rating: 4,
                        date: "2024-02-15",
                        content:
                          "Almost perfect - works amazingly with Midjourney but needs a bit of tweaking for Stable Diffusion. Still worth every penny for the quality of outputs I'm getting.",
                        avatar:
                          "data:image/png;base64,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",
                      },
                      {
                        name: "Michael T.",
                        rating: 5,
                        date: "2024-01-30",
                        content:
                          "I've tried dozens of prompt structures but nothing comes close to the quality and consistency of this one. The seller is super responsive to questions too!",
                        avatar:
                          "data:image/jpeg;base64,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",
                      },
                    ].map((review, index) => (
                      <div
                        key={index}
                        className="border-b border-border pb-6 last:border-0"
                      >
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center">
                            <img
                              src={review.avatar}
                              alt={review.name}
                              className="w-10 h-10 rounded-full mr-3"
                            />
                            <div>
                              <p className="font-medium">{review.name}</p>
                              <div className="flex items-center">
                                <div className="flex mr-2">
                                  {Array(5)
                                    .fill(0)
                                    .map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i < review.rating
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(review.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Helpful
                          </Button>
                        </div>
                        <p className="text-muted-foreground mt-2">
                          {review.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Test Prompt Section */}
            <div className="border border-border bg-card/50 backdrop-blur-sm neo-glow bg-muted/10 rounded-xl border border-muted/30 p-6 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

              <h3 className="text-xl font-semibold mb-4 flex items-center relative z-10">
                <Zap className="h-5 w-5 text-neon-yellow mr-2" />
                Test This Prompt (Powered by Atoma network)
              </h3>
              <p className="text-muted-foreground mb-4 relative z-10">
                Try this prompt with your own input before purchasing.
                <span className="font-medium text-neon-purple">
                  {" "}
                  You have {remainingCredits} test credits remaining.
                </span>
              </p>

              <div className="space-y-4 relative z-10">
                <div>
                  <label
                    htmlFor="user-input"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Your Input
                  </label>
                  <Textarea
                    id="user-input"
                    placeholder="Describe the image you want to create..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="min-h-[100px] bg-background border-muted"
                  />
                </div>

                <Button
                  onClick={handleTestPrompt}
                  disabled={testLoading || remainingCredits <= 0}
                  className=" bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink hover:from-neon-purple/90 hover:via-neon-blue/90 hover:to-neon-pink/90 px-4 py-4 text-md text-white font-light group transition-all duration-300"
                >
                  {testLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Test Prompt
                    </>
                  )}
                </Button>

                {(output || outputImage) && (
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="p-3 bg-muted/20 border-b border-border">
                      <h4 className="font-medium">Generated Output</h4>
                    </div>

                    {outputImage && (
                      <div className="p-4 border-b border-border">
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Generated Image
                        </label>
                        <div className="aspect-video rounded-lg overflow-hidden border border-border">
                          <img
                            src={outputImage}
                            alt="Generated output"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {remainingCredits <= 2 && (
                  <div className="bg-neon-purple/10 border border-neon-purple/30 rounded-md p-3 flex items-center justify-between">
                    <span className="text-sm">
                      Running low on test credits?
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/buy-credits")}
                      className="text-xs border-neon-purple text-neon-purple hover:bg-neon-purple/20"
                    >
                      Buy Credits
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* About the Creator */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <User className="h-5 w-5 text-neon-blue mr-2" />
                About the Creator
              </h3>
              <div className="flex items-start">
                <img
                  src={prompt.author.avatar}
                  alt={prompt.author.name}
                  className="w-16 h-16 rounded-full mr-4 border-2 border-neon-purple"
                />
                <div>
                  <div className="flex items-center mb-2 gap-2">
                    <h4 className="text-lg font-medium mb-1">
                      {prompt.author.name}
                    </h4>
                    <Badge
                      variant="outline"
                      className="bg-neon-green/10 text-neon-green border-neon-green/30 text-xs"
                    >
                      Verified Creator
                    </Badge>
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="flex mr-1">
                      {renderStars(prompt.author.rating)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {prompt.author.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1.5" />
                      <span>{prompt.author.sales} prompts sold</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1.5" />
                      <span>Member since {prompt.author.memberSince}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card className="border border-border bg-card/50 backdrop-blur-sm neo-glow">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold ">
                    {formattedPrice}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    One-time purchase, lifetime access
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {purchased ? (
                    <div className="bg-neon-green/10 border border-neon-green/30 rounded-md p-4 text-foreground">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="h-5 w-5 mr-2 text-neon-green" />
                        <span className="font-medium">
                          Purchased Successfully
                        </span>
                      </div>
                      <p className="text-sm">
                        You now have full access to this prompt.
                      </p>
                    </div>
                  ) : (
                    <>
                      {isWalletConnected ? (
                        <Button
                          onClick={handlePurchase}
                          disabled={purchaseLoading}
                          className="w-full bg-neon-purple hover:bg-neon-purple/90 text-white py-6"
                        >
                          {purchaseLoading ? (
                            <>
                              <Loader className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Buy Now
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={connectWallet}
                          disabled={connectingWallet}
                          className="w-full bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink hover:from-neon-purple/90 hover:via-neon-blue/90 hover:to-neon-pink/90 px-8 py-6 text-md text-white font-light group transition-all duration-300"
                        >
                          {connectingWallet ? (
                            <>
                              <Loader className="mr-2 h-4 w-4 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Wallet className="mr-2 h-4 w-4" />
                              {account?.address || address ? (
                                <span>Buy Now</span>
                              ) : (
                                <span>Connect SUI Wallet</span>
                              )}
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-neon-purple mr-2 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        Secure blockchain payment via SUI
                      </span>
                    </div>
                    <div className="flex items-start">
                      <Zap className="h-5 w-5 text-neon-yellow mr-2 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        Test before purchasing
                      </span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-neon-green mr-2 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        30-day satisfaction guarantee
                      </span>
                    </div>
                  </div>
                </CardContent>
                {purchased && (
                  <CardFooter className="bg-muted/10 border-t border-border flex flex-col items-start">
                    <div className="flex items-center justify-between w-full mb-2">
                      <h4 className="font-medium">System Prompt</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => handleCopyToClipboard(systemPrompt)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="bg-background rounded-md border border-border p-3 w-full">
                      <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-60 font-mono text-muted-foreground">
                        {systemPrompt}
                      </pre>
                    </div>
                  </CardFooter>
                )}
              </Card>

              {!purchased && (
                <div className="mt-4 bg-muted/10 rounded-lg border border-muted p-4">
                  <h4 className="font-medium text-foreground mb-3">
                    Why buy this prompt?
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-neon-green mr-2 mt-0.5" />
                      <span>Generate professional AI art instantly</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-neon-green mr-2 mt-0.5" />
                      <span>Works with all major image generators</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-neon-green mr-2 mt-0.5" />
                      <span>Verified results with blockchain proof</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-neon-green mr-2 mt-0.5" />
                      <span>Created by an experienced AI artist</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default PromptDetail
