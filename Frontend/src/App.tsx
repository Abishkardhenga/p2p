import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import "@mysten/dapp-kit/dist/index.css"
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit"

import Login from "./pages/auth/Login"
import Signup from "./pages/auth/Signup"
import Marketplace from "./pages/marketplace/Marketplace"
import PromptDetail from "./pages/marketplace/PromptDetail"
import SellPrompt from "./pages/marketplace/SellPrompt"
import Dashboard from "./pages/dashboard/Dashboard"
import { ZKLoginProvider } from "react-sui-zk-login-kit"
import { SuiClient } from "@mysten/sui/client"
import { getFullnodeUrl } from "@mysten/sui.js/client"

import Test from "./pages/test"

const queryClient = new QueryClient()
const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") })

const networks = {
  localnet: { url: getFullnodeUrl("localnet") },
  devnet: { url: getFullnodeUrl("devnet") },
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
}

const App = () => (
  <ZKLoginProvider client={suiClient}>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
      <WalletProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/prompt/:id" element={<PromptDetail />} />
                <Route path="/sell-prompt" element={<SellPrompt />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/*" element={<Dashboard />} />
                <Route path="/test" element={<Test />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </ZKLoginProvider>
)

export default App;
