import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MdContentCopy } from "react-icons/md"
import { truncateAddress } from "@/utils/formatAddress"

import {
  ShoppingCart,
  MessageSquare,
  PlusCircle,
  DollarSign,
  Users,
  TrendingUp,
  Star,
  Bell,
  ChevronRight,
  Eye,
  ThumbsUp,
  Clock,
  PenTool,
  Heart,
  Image,
  LogOut,
  Wallet,
  User,
  CreditCard,
} from "lucide-react"
import StatCard from "@/components/dashboard/stats/StatCard"
import ActivityItem from "@/components/dashboard/ActivityItem"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import Footer from "@/components/layout/Footer"
import Navbar from "@/components/layout/Navbar"
import { useZKLogin } from "react-sui-zk-login-kit"
import { useCurrentAccount } from "@mysten/dapp-kit"

const Dashboard = () => {
  const [tab, setTab] = useState("overview")
  const { encodedJwt, userSalt, setUserSalt, address, logout } = useZKLogin()
  const account = useCurrentAccount()

  // Mock function for purchasing credits
  const handlePurchaseCredits = () => {
    toast({
      title: "Connecting to Sui Wallet",
      description:
        "Please confirm transaction in your wallet to purchase credits.",
    })

    // Simulate a wallet transaction
    setTimeout(() => {
      toast({
        title: "Credits Purchased Successfully",
        description: "25 new credits have been added to your account.",
        variant: "default", // Changed from "success" to "default"
      })
    }, 2000)
  }

  // Mock data for purchased prompts
  const purchasedPrompts = [
    {
      id: "1",
      title: "SEO Blog Post Generator",
      category: "Content Creation",
      author: "Alex Chen",
      price: "$19.99",
      date: "2025-03-15",
      image:
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    },
    {
      id: "2",
      title: "Social Media Campaign Planner",
      category: "Marketing",
      author: "Sarah Johnson",
      price: "$14.99",
      date: "2025-03-10",
      image:
        "https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    },
    {
      id: "3",
      title: "Product Description Writer",
      category: "Copywriting",
      author: "Michael Lee",
      price: "$9.99",
      date: "2025-03-05",
      image:
        "https://images.unsplash.com/photo-1586892477838-2b96e85e0f96?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    },
  ]

  // Mock data for uploaded prompts
  const uploadedPrompts = [
    {
      id: "1",
      title: "Technical Documentation Writer",
      category: "Technical",
      sales: 2,
      revenue: "$59.98",
      status: "Active",
      image:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    },
    {
      id: "2",
      title: "Email Composer Professional",
      category: "Copywriting",
      sales: 1,
      revenue: "$9.99",
      status: "Active",
      image:
        "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    },
    {
      id: "3",
      title: "Social Media Caption Generator",
      category: "Marketing",
      sales: 0,
      revenue: "$0.00",
      status: "Draft",
      image:
        "https://images.unsplash.com/photo-1611605698335-8b1569810432?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="fixed inset-0 bg-cyber-grid opacity-10 pointer-events-none"></div>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="fixed inset-0 bg-cyber-grid opacity-5 pointer-events-none z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          {/* Profile Card */}
          <div className="glass-card p-6 mb-6 rounded-xl border border-neon-purple/30 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbgbxLOuQhRKRgQD3jXqd4g0Smn5b5x1A-LA&s"
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-white">John Doe</h2>
                </div>
                <div className="flex items-center mt-1"></div>
                {address && (
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-green-500">
                      ZK Address: {truncateAddress(address)}
                    </p>
                    <MdContentCopy
                      className="text-white cursor-pointer hover:text-white transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(address)
                        toast({
                          title: "Address Copied",
                          description: "ZK Address copied to clipboard",
                          variant: "default",
                        })
                      }}
                      size={16}
                    />
                  </div>
                )}
                {account && (
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-blue-400">
                      Wallet Address: {truncateAddress(account.address)}
                    </p>
                    <MdContentCopy
                      className="text-blue-400 cursor-pointer hover:text-white transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(account.address)
                        toast({
                          title: "Address Copied",
                          description: "Wallet Address copied to clipboard",
                          variant: "default",
                        })
                      }}
                      size={16}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="px-4 bg-transparent border py-5 text-lg border-purple-500 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-all duration-300"
                onClick={handlePurchaseCredits}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Add Credits
              </Button>
              <Button
                asChild
                className=" bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink hover:from-neon-purple/90 hover:via-neon-blue/90 hover:to-neon-pink/90 px-4 py-4 text-md text-white font-light group transition-all duration-300"
              >
                <Link to="/sell-prompt">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Sell a Prompt
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-red-900/30"
                asChild
              >
                <Link to="/login">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Dashboard
              </h1>
              <p className="text-gray-400">
                Welcome back, John! Here's what's happening with your account.
              </p>
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="purchased">Purchased</TabsTrigger>
              <TabsTrigger value="uploaded">My Uploads</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Section */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Purchases"
                  value={purchasedPrompts.length}
                  description="Prompts you've bought"
                  icon={<ShoppingCart className="h-4 w-4" />}
                  trend={{ value: "2", positive: true }}
                />
                <StatCard
                  title="Total Credits"
                  value={25}
                  description="Available to use"
                  icon={<DollarSign className="h-4 w-4" />}
                />
                <StatCard
                  title="Prompts Sold"
                  value={3}
                  description="Across 2 listings"
                  icon={<PenTool className="h-4 w-4" />}
                  trend={{ value: "1", positive: true }}
                />
                <StatCard
                  title="Revenue"
                  value="$59.97"
                  description="Total earnings"
                  icon={<TrendingUp className="h-4 w-4" />}
                  trend={{ value: "$19.99", positive: true }}
                />
              </div>
            </TabsContent>

            <TabsContent value="purchased" className="space-y-6">
              <Card className="shadow-sm bg-card/30 border-border backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">
                    Purchased Prompts
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-300 hover:text-white"
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {purchasedPrompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        className="bg-card/50 border border-neon-blue/30 rounded-lg overflow-hidden hover:shadow-md hover:shadow-neon-blue/20 transition-shadow"
                      >
                        <div className="h-40 overflow-hidden relative">
                          <img
                            src={prompt.image}
                            alt={prompt.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-neon-purple text-white text-xs px-2 py-1 rounded-full">
                            {prompt.category}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-white mb-1">
                            {prompt.title}
                          </h3>
                          <div className="flex justify-between text-sm text-gray-300 mb-3">
                            <span>By {prompt.author}</span>
                            <span>{prompt.price}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              Purchased:{" "}
                              {new Date(prompt.date).toLocaleDateString()}
                            </span>
                            <Button
                              asChild
                              size="sm"
                              variant="ghost"
                              className="text-neon-blue hover:text-white hover:bg-neon-blue/20"
                            >
                              <Link to={`/prompt/${prompt.id}`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="uploaded" className="space-y-6">
              <Card className="shadow-sm bg-card/30 border-border backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">
                    My Uploaded Prompts
                  </CardTitle>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="text-gray-300 hover:text-white"
                  >
                    <Link to="/sell-prompt">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      New Prompt
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {uploadedPrompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        className="bg-card/50 border border-neon-pink/30 rounded-lg overflow-hidden hover:shadow-md hover:shadow-neon-pink/20 transition-shadow"
                      >
                        <div className="h-40 overflow-hidden relative">
                          <img
                            src={prompt.image}
                            alt={prompt.title}
                            className="w-full h-full object-cover"
                          />
                          <div
                            className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-full ${
                              prompt.status === "Active"
                                ? "bg-green-500"
                                : "bg-gray-500"
                            }`}
                          >
                            {prompt.status}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-white mb-1">
                            {prompt.title}
                          </h3>
                          <div className="flex justify-between text-sm text-gray-300 mb-3">
                            <span>{prompt.category}</span>
                            <span>{prompt.sales} sales</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">
                              {prompt.revenue}
                            </span>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-neon-pink hover:text-white hover:bg-neon-pink/20"
                              >
                                <PenTool className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                asChild
                                size="sm"
                                variant="ghost"
                                className="text-neon-blue hover:text-white hover:bg-neon-blue/20"
                              >
                                <Link to={`/prompt/${prompt.id}`}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm bg-card/30 border-border backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Sales Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border border-dashed border-neon-purple/50 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-neon-purple mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        Sales Dashboard
                      </h3>
                      <p className="text-gray-300 max-w-md mb-4">
                        Track your prompt sales, revenue, and user engagement
                        with detailed analytics
                      </p>
                      <Button className="bg-neon-purple hover:bg-neon-purple/80">
                        View Full Analytics
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Dashboard
