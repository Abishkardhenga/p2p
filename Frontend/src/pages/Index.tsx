import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import { CheckCircle, ArrowRight, Search, Shield, Zap, Sparkles, Code, ImageIcon, Bot, Wallet, BrainCircuit, Atom, Lock, ScanFace, RefreshCw, FileText, ArrowDown, BarChart2, Award, ThumbsUp, Target, DollarSign, Users, TrendingUp, Clock, Lightbulb } from "lucide-react";

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      title: "Test Before Buying",
      description: "Try prompts with your own inputs before purchasing to ensure they meet your needs.",
      icon: <Search className="h-6 w-6 text-purple-400" />,
    },
    {
      title: "Verified Results",
      description: "Our decentralized protocol verifies that prompt outputs are authentic and not manipulated.",
      icon: <Shield className="h-6 w-6 text-cyan-400" />,
    },
    {
      title: "Secure Transactions",
      description: "Built on Sui blockchain with ZK login for maximum security and privacy.",
      icon: <Wallet className="h-6 w-6 text-pink-400" />,
    },
  ];

  const advancedFeatures = [
    {
      title: "AI-Powered Recommendations",
      description: "Our system learns what prompts work best for your specific use cases and recommends new ones.",
      icon: <BrainCircuit className="h-10 w-10 text-cyan-400" />,
    },
    {
      title: "Multi-modal Support",
      description: "Support for text and image generations across all major AI models in one marketplace.",
      icon: <ImageIcon className="h-10 w-10 text-pink-400" />,
    },
    {
      title: "Creator Analytics",
      description: "Comprehensive analytics for prompt creators to optimize their offerings and maximize revenue.",
      icon: <BarChart2 className="h-10 w-10 text-purple-400" />,
    },
    {
      title: "Auto-verification Protocol",
      description: "Our automated system tests and verifies prompt quality through multiple validation methods.",
      icon: <RefreshCw className="h-10 w-10 text-green-400" />,
    },
  ];

  const howItWorksSteps = [
    {
      number: "01",
      title: "Browse the Marketplace",
      description: "Explore thousands of prompts across various categories and AI models to find what you need.",
      icon: <Search className="h-8 w-8 text-purple-400" />,
    },
    {
      number: "02",
      title: "Test Before Purchase",
      description: "Try prompts with sample inputs and see real outputs before making a purchase decision.",
      icon: <FileText className="h-8 w-8 text-cyan-400" />,
    },
    {
      number: "03",
      title: "Secure Payment with Sui",
      description: "Use Sui blockchain for fast, secure transactions with minimal fees and maximum privacy.",
      icon: <Wallet className="h-8 w-8 text-pink-400" />,
    },
    {
      number: "04",
      title: "Access Anytime",
      description: "Your purchased prompts are stored in your account, accessible whenever you need them.",
      icon: <Bot className="h-8 w-8 text-green-400" />,
    },
  ];

  const categories = [
    { name: "Copywriting", count: 120, icon: <Code className="h-5 w-5 text-purple-400" /> },
    { name: "Content Creation", count: 85, icon: <Bot className="h-5 w-5 text-cyan-400" /> },
    { name: "SEO", count: 63, icon: <Search className="h-5 w-5 text-green-400" /> },
    { name: "Marketing", count: 74, icon: <Zap className="h-5 w-5 text-pink-400" /> },
    { name: "Creative Writing", count: 92, icon: <Sparkles className="h-5 w-5 text-purple-400" /> },
    { name: "Technical", count: 58, icon: <Code className="h-5 w-5 text-cyan-400" /> },
    { name: "ChatGPT", count: 145, icon: <Bot className="h-5 w-5 text-pink-400" /> },
    { name: "Midjourney", count: 67, icon: <ImageIcon className="h-5 w-5 text-green-400" /> },
  ];

  const testimonials = [
    {
      quote: "I've been able to generate consistent, high-quality content that my clients love, all thanks to prompts I purchased on Sui Prompt.",
      author: "Sarah Johnson",
      role: "Content Creator",
    },
    {
      quote: "As a prompt engineer, Sui Prompt has given me a platform to monetize my expertise while ensuring my work isn't stolen or misrepresented.",
      author: "Michael Chen",
      role: "Prompt Engineer",
    },
    {
      quote: "The verification system gives me confidence that what I'm buying actually works as advertised. Game changer!",
      author: "Alex Rodriguez",
      role: "Marketing Specialist",
    },
  ];

  const useCases = [
    {
      title: "Content Creation",
      description: "Perfect for marketers and bloggers who need to generate high-quality content quickly and consistently.",
      icon: <FileText className="h-10 w-10 text-cyan-400" />,
    },
    {
      title: "Creative Projects",
      description: "Artists and designers can find prompts that spark imagination and generate unique visual concepts.",
      icon: <Sparkles className="h-10 w-10 text-pink-400" />,
    },
    {
      title: "Marketing Campaigns",
      description: "Develop persuasive copy and engaging visuals for ads, social media, and email campaigns.",
      icon: <TrendingUp className="h-10 w-10 text-purple-400" />,
    },
    {
      title: "Technical Documentation",
      description: "Engineers and technical writers can create clear, accurate documentation with specialized prompts.",
      icon: <Code className="h-10 w-10 text-green-400" />,
    },
  ];

  const benefits = [
    {
      title: "Save Time",
      description: "Reduce hours spent crafting perfect prompts—use pre-tested formulas that work consistently.",
      icon: <Clock className="h-8 w-8 text-cyan-400" />,
    },
    {
      title: "Increase ROI",
      description: "Get more value from your AI tools with prompts that generate higher quality outputs.",
      icon: <DollarSign className="h-8 w-8 text-green-400" />,
    },
    {
      title: "Verified Quality",
      description: "Every prompt is verified by our protocol to ensure consistent, high-quality results.",
      icon: <Award className="h-8 w-8 text-purple-400" />,
    },
    {
      title: "Community Knowledge",
      description: "Tap into the collective expertise of thousands of prompt engineers worldwide.",
      icon: <Users className="h-8 w-8 text-pink-400" />,
    },
  ];

  const pricingComparison = [
    { feature: "Access to verified prompts", sui: true, others: "Limited" },
    { feature: "Test before purchase", sui: true, others: false },
    { feature: "Secure blockchain transactions", sui: true, others: false },
    { feature: "Creator royalties tracking", sui: true, others: "Manual" },
    { feature: "Prompt verification protocol", sui: true, others: false },
    { feature: "Multi-AI model support", sui: true, others: "Limited" },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center ">
        <div
          className="absolute inset-0 bg-cyber-grid opacity-70 pointer-events-none"
          style={{ backgroundSize: "30px 30px" }}
        ></div>
        <div className="absolute top-20 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 -right-20 w-96 h-96 bg-cyan-900/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div
          ref={heroRef}
          className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} transition-all duration-1000 ease-out`}
        >
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl text-white">
                <span className="block mb-2 cyber-text">The Marketplace for</span>
                <div className="cyber-border neo-glow inline-block p-4 px-6 rounded-md bg-gradient-to-r from-purple-600/5 to-cyan-600/5">
                  <span className="block cyber-text text-white">Verified AI Prompts</span>
                </div>
              </h1>
              <p className="mt-6 text-base  sm:text-lg md:text-xl">
                Buy and sell AI prompts with confidence. Our decentralized protocol ensures authenticity, allowing buyers to test prompts before purchasing and verify the true output quality.
              </p>
              <div className="mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 px-8 py-6 text-lg text-white font-semibold group transition-all duration-300 shadow-lg"
                  >
                    <Link to="/marketplace">
                      <span className="relative inline-block">
                        Browse Marketplace
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                      </span>
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full px-8 py-6 text-lg border-purple-500 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-all duration-300"
                  >
                    <Link to="/sell-prompt">Sell Your Prompt</Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:col-span-6">
              <div className="relative mx-auto w-full">
                <div className="relative animate-float">
                  <div className="relative block w-7/6 rounded-lg overflow-hidden">
                    <img
                      className="w-full rounded-lg"
                      src="/robot.png"
                      alt="AI Prompt visualization"
                    />
                  </div>
                </div>
                <div
                  className="absolute -top-10 -left-10 w-20 h-20 bg-purple-400/20 rounded-full animate-float"
                  style={{ animationDelay: "0.5s", animationDuration: "8s" }}
                ></div>
                <div
                  className="absolute top-1/2 -right-8 w-16 h-16 bg-cyan-400/20 rounded-full animate-float"
                  style={{ animationDelay: "1.5s", animationDuration: "6s" }}
                ></div>
                <div
                  className="absolute -bottom-8 left-1/4 w-12 h-12 bg-pink-400/20 rounded-full animate-float"
                  style={{ animationDelay: "1s", animationDuration: "7s" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="h-8 w-8 text-purple-400" />
        </div>
      </section>

      {/* Features Section */}
      <section className=" relative py-16">
        <div className="absolute inset-0 bg-cyber-grid opacity-100 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative ">
          <div className="max-w-5xl mx-auto text-center animate-on-scroll opacity-100">
            <h2 className="text-2xl font-medium cyber-text text-white sm:text-4xl mb-2">
              A better way to buy and sell AI prompts
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto mb-4"></div>
            <p className="mt-4 text-lg ">
              Our platform bridges the gap between prompt engineers and AI users, with built-in verification to ensure quality and authenticity.
            </p>
          </div>
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="neo-glow p-8 animate-on-scroll opacity-100  rounded-lg shadow-md"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="h-12 w-12 rounded-md bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Powered By Section */}
      <section className=" relative py-16">
        <div className="absolute inset-0 bg-cyber-grid opacity-100 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-on-scroll opacity-0">
            <h2 className="text-3xl font-medium cyber-text text-white sm:text-4xl mb-2">
              Powered By Leading Technology
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto mb-4"></div>
            <p className="mt-4 text-lg ">
              Built on cutting-edge blockchain and AI verification technology
            </p>
          </div>
          <div className="mt-12 neo-glow p-8 border-cyan-500/30 rounded-xl ">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
              <div className="text-center p-6 animate-on-scroll opacity-0">
                <div className="h-24 w-24 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="h-20 w-20 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Sui Blockchain</h3>
                <p className="">
                  Leveraging Sui's Atoma Walrus technology for secure, fast, and cost-effective transactions with maximum scalability.
                </p>
              </div>
              <div
                className="text-center p-6 border-t md:border-t-0 md:border-x border-purple-500/20 animate-on-scroll opacity-0"
                style={{ animationDelay: "150ms" }}
              >
                <div className="h-24 w-24 mx-auto mb-4 flex items-center justify-center">
                  <BrainCircuit className="h-20 w-20 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Atoma Network</h3>
                <p className="">
                  Integration with MYstem's advanced AI systems for superior prompt verification and quality assurance.
                </p>
              </div>
              <div
                className="text-center p-6 border-t md:border-t-0 animate-on-scroll opacity-0"
                style={{ animationDelay: "300ms" }}
              >
                <div className="h-24 w-24 mx-auto mb-4 flex items-center justify-center">
                  <Lock className="h-20 w-20 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Seal Technology</h3>
                <p className="">
                  Secured by SEAL encryption protocols to protect intellectual property and ensure prompt authenticity.
                </p>
              </div>
              <div
                className="text-center p-6 border-t md:border-t-0 md:border-x border-purple-500/20 animate-on-scroll opacity-0"
                style={{ animationDelay: "300ms" }}
              >
                <div className="h-24 w-24 mx-auto mb-4 flex items-center justify-center">
                  <Atom className="h-20 w-20 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Walrus Storage</h3>
                <p className="">
                Walrus allows store large prompts in decentralized storage. Prompts are encrypted before storing.
                </p>
              </div>
            </div>
            <div className="mt-10 p-6 border-t border-cyan-500/20 text-center">
              <div
                className="flex items-center justify-center space-x-4 animate-on-scroll opacity-0"
                style={{ animationDelay: "450ms" }}
              >
                <ScanFace className="h-8 w-8 text-pink-400" />
                <p className="text-lg font-medium text-white">
                  Verification, security, and decentralized at every step of the prompt marketplace journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-16 ">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-pink-500/10"></div>
        <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="animate-on-scroll opacity-0">
              <h2 className="text-3xl font-medium cyber-text text-white sm:text-4xl mb-2">
                Ready to get started?
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-cyan-500 mb-4"></div>
              <p className="mt-3 max-w-md text-lg ">
                Join our community of prompt engineers and AI enthusiasts. Buy, sell, and trade verified AI prompts with confidence.
              </p>
              <div className="mt-8 flex space-x-4">
                <Button
                  asChild
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 px-8 py-6 text-lg text-white font-semibold group transition-all duration-300 shadow-lg"
                >
                  <Link to="/signup">Sign Up Today</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="px-8 py-6 text-lg border-purple-500 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-all duration-300"
                >
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
            <div
              className="mt-10 lg:mt-0 animate-on-scroll opacity-0"
              style={{ animationDelay: "200ms" }}
            >
              <ul className="space-y-4">
                {[
                  "Join in minutes with Google ZK Login",
                  "Test prompts before purchase",
                  "Access a growing library of verified prompts",
                  "Sell your expertise to a global audience",
                  "Protected by blockchain verification",
                ].map((item, index) => (
                  <li key={index} className="flex items-center p-3 neo-glow /50 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                    <span className="ml-3 text-white">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;