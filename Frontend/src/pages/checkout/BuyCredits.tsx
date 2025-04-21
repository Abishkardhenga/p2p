
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, Wallet, Coins, CheckCircle2, ArrowRight } from "lucide-react";

const creditPackages = [
  { id: "basic", name: "Basic", credits: 50, price: 9.99, popular: false },
  { id: "standard", name: "Standard", credits: 200, price: 29.99, popular: true },
  { id: "premium", name: "Premium", credits: 500, price: 59.99, popular: false },
  { id: "enterprise", name: "Enterprise", credits: 2000, price: 199.99, popular: false },
];

const BuyCredits = () => {
  const [selectedPackage, setSelectedPackage] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("sui");
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const selectedPack = creditPackages.find(pkg => pkg.id === selectedPackage);

  const connectWallet = () => {
    setLoading(true);
    setTimeout(() => {
      setWalletConnected(true);
      setLoading(false);
      toast({
        title: "Wallet connected successfully",
        description: "Your SUI wallet is now connected to your account.",
      });
    }, 1500);
  };

  const handlePurchase = () => {
    if (!walletConnected && paymentMethod === "sui") {
      toast({
        title: "Wallet not connected",
        description: "Please connect your SUI wallet first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Credits purchased successfully!",
        description: `${selectedPack?.credits} credits have been added to your account.`,
      });
      navigate("/dashboard");
    }, 2000);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold cyber-text mb-2">Buy Credits</h1>
          <p className="text-muted-foreground">Purchase credits to test prompts and access premium features</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {creditPackages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative overflow-hidden ${
                selectedPackage === pkg.id ? 'neo-glow' : ''
              } cursor-pointer transition-all duration-300`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-neon-green text-black text-xs font-bold px-3 py-1 transform rotate-0 translate-x-2 -translate-y-0">
                    POPULAR
                  </div>
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <CardDescription>
                  {pkg.credits} Credits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">${pkg.price}</div>
                <p className="text-sm text-muted-foreground">
                  ${(pkg.price / pkg.credits).toFixed(3)} per credit
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant={selectedPackage === pkg.id ? "default" : "outline"} 
                  className={`w-full ${selectedPackage === pkg.id ? 'bg-neon-purple hover:bg-neon-purple/90' : ''}`}
                >
                  {selectedPackage === pkg.id ? 'Selected' : 'Select Package'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Select your preferred payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sui" onValueChange={setPaymentMethod}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sui" className="flex items-center justify-center">
                  <Wallet className="h-4 w-4 mr-2" />
                  SUI Blockchain
                </TabsTrigger>
                <TabsTrigger value="card" className="flex items-center justify-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Credit Card
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="sui" className="space-y-4 mt-4">
                <div className="bg-muted/20 rounded-lg p-4 border border-border">
                  <div className="flex items-start mb-4">
                    <div className="mr-4 mt-1">
                      <Coins className="h-6 w-6 text-neon-purple" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Pay with SUI Tokens</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect your SUI wallet to make a secure blockchain payment. Transactions are verified on-chain and credits are instantly added to your account.
                      </p>
                    </div>
                  </div>
                  
                  {walletConnected ? (
                    <div className="flex items-center text-neon-green border border-neon-green/20 bg-neon-green/5 rounded-md p-3">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      <span>Wallet Connected</span>
                    </div>
                  ) : (
                    <Button 
                      onClick={connectWallet} 
                      disabled={loading} 
                      className="w-full bg-neon-purple hover:bg-neon-purple/90"
                    >
                      {loading ? "Connecting..." : "Connect SUI Wallet"}
                    </Button>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="card" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Cardholder Name</Label>
                      <Input id="name" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="number">Card Number</Label>
                      <Input id="number" placeholder="4242 4242 4242 4242" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expMonth">Exp. Month</Label>
                      <Input id="expMonth" placeholder="MM" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expYear">Exp. Year</Label>
                      <Input id="expYear" placeholder="YY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>{selectedPack?.name} Package ({selectedPack?.credits} Credits)</span>
              <span>${selectedPack?.price}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Tax</span>
              <span>$0.00</span>
            </div>
            <div className="border-t border-border pt-4 flex justify-between font-bold">
              <span>Total</span>
              <span>${selectedPack?.price}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handlePurchase} 
              disabled={loading} 
              className="w-full bg-neon-purple hover:bg-neon-purple/90 text-white"
            >
              {loading ? "Processing..." : (
                <>
                  Complete Purchase
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default BuyCredits;
