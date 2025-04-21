import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import MainLayout from "@/components/layout/MainLayout"
import { generateRandomness } from "@mysten/sui/zklogin"
import { ZKLogin, useZKLogin } from "react-sui-zk-login-kit"
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit"

const SUI_PROVER_ENDPOINT = "https://prover-dev.mystenlabs.com/v1"

const providers = {
  google: {
    clientId: import.meta.env.VITE_GOOGLE_OAUTH_KEY,
    redirectURI: "http://localhost:5173/signup",
  },
  twitch: {
    clientId: "YOUR_TWITCH_CLIENT_ID",
    redirectURI: "YOUR_REDIRECT_URI",
  },
}

const Signup = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreeTerms) {
      toast({
        title: "Terms Required",
        description:
          "You must agree to the terms of service to create an account.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      if (name && email && password) {
        toast({
          title: "Account created",
          description: "Welcome to Sui Prompt Marketplace!",
        })
        navigate("/dashboard")
      } else {
        toast({
          title: "Sign up failed",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
      }
    }, 1500)
  }

  const handleGoogleSignup = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Signed up with Google",
        description: "Welcome to Sui Prompt Marketplace!",
      })
      navigate("/marketplace")
    }, 1500)
  }

  const { encodedJwt, userSalt, setUserSalt, address, logout } = useZKLogin()

  useEffect(() => {
    console.log("encodedJwt", encodedJwt) // <--- debug this

    if (encodedJwt) {
      // make you request to your server
      // for recive useSalt by jwt.iss (issuer id)
      const requestMock = new Promise((resolve): void =>
        resolve(localStorage.getItem("userSalt") || generateRandomness())
      )

      requestMock.then((salt) => setUserSalt(String(salt)))
    }
  }, [encodedJwt])

  const account = useCurrentAccount()
  console.log("encodedJwt", encodedJwt)
  console.log("userSalt", userSalt)
  console.log("address", address)

  if (address) {
    navigate("/dashboard")
  }

  useEffect(() => {
    if (account?.address) {
      navigate("/dashboard")
    }
  }, [account?.address, navigate])

  return (
    <MainLayout>
      <div className="container max-w-md mx-auto py-16">
        <Card>
          <CardHeader className="space-y-1">
            {/* <CardTitle className="text-2xl font-bold text-center">
              Sign Up
            </CardTitle> */}
            {/* <CardDescription className="text-center">
              Create an account to start buying and selling prompts
            </CardDescription> */}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked === true)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-lavender-600 hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-lavender-600 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
              <Button
                type="submit"
                className=" w-full bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink hover:from-neon-purple/90 hover:via-neon-blue/90 hover:to-neon-pink/90 px-4 py-4 text-md text-white font-light group transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form> */}
            {/* <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className=" px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              type="button"
              onClick={handleGoogleSignup}
              disabled={isLoading}
            >
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54L20.0303 3.11C17.9903 1.19 15.2403 0 12.0003 0C7.31033 0 3.25033 2.69 1.28033 6.6L5.27033 9.7C6.29033 6.86 8.90033 4.75 12.0003 4.75Z"
                  fill="#EA4335"
                />
                <path
                  d="M23.49 12.27C23.49 11.48 23.42 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.33 17.24 16.07 18.09L19.93 21.19C22.19 19.1 23.49 15.93 23.49 12.27Z"
                  fill="#4285F4"
                />
                <path
                  d="M5.27 14.3C5.02 13.57 4.89 12.8 4.89 12C4.89 11.2 5.03 10.43 5.27 9.7L1.28 6.6C0.47 8.24 0 10.06 0 12C0 13.94 0.47 15.76 1.28 17.4L5.27 14.3Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.0004 24C15.2404 24 17.9804 22.92 19.9304 21.19L16.0704 18.09C15.0004 18.8 13.6204 19.25 12.0004 19.25C8.9004 19.25 6.2904 17.14 5.2704 14.3L1.2804 17.4C3.2504 21.31 7.3104 24 12.0004 24Z"
                  fill="#34A853"
                />
              </svg>
              Google ZK Login
            </Button> */}
            <ZKLogin
              providers={providers}
              onSuccess={() => {
                console.log("ok")
              }}
              proverProvider={SUI_PROVER_ENDPOINT}
            />
            {address && (
              <div className="text-green-600 font-semibold text-center">
                Connected Address: {address}
              </div>
            )}
          </CardContent>

          <CardContent className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 text-white">Or connect with Sui</span>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <ConnectButton
                connectText="Connect with Sui Wallet"
                {...{
                  className:
                    "w-full bg-gradient-to-r from-[#6fbcf0] to-[#4a67e3] hover:opacity-90 text-white font-medium py-2.5 px-4 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2",
                }}
              />

              <section className="text-sm mt-2 text-center">
                {account?.address ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 font-medium break-all">
                    Connected: {account?.address}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    No wallet connected
                  </div>
                )}
              </section>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center">
            {/* <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-lavender-600 hover:underline"
              >
                Sign in
              </Link>
            </p> */}
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  )
}

export default Signup
