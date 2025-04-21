
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
import { useToast } from "@/components/ui/use-toast"
import MainLayout from "@/components/layout/MainLayout"
import { useZKLogin, ZKLogin } from "react-sui-zk-login-kit"
import { generateRandomness } from "@mysten/sui/zklogin"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { encodedJwt, userSalt, setUserSalt, address, logout } = useZKLogin()

  const SUI_PROVER_ENDPOINT = "https://prover-dev.mystenlabs.com/v1"

  const providers = {
    google: {
      clientId: import.meta.env.VITE_GOOGLE_OAUTH_KEY,
      redirectURI: "http://localhost:5173/login",
    },
    twitch: {
      clientId: "YOUR_TWITCH_CLIENT_ID",
      redirectURI: "http://localhost:5173/login",
    },
  }

  useEffect(() => {
    if (encodedJwt) {
      const requestMock = new Promise((resolve): void =>
        resolve(localStorage.getItem("userSalt") || generateRandomness())
      )

      requestMock.then(
        (salt) => setUserSalt(String(salt))
        // Only navigate if we have both the JWT and salt
        // if (userSalt) {
        //   navigate("/dashboard")
        // }
      )
    }
  }, [encodedJwt])

  if (address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <span className="text-xl mb-4">Connected Address: {address}</span>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    )
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      if (email && password) {
        toast({
          title: "Logged in successfully",
          description: "Welcome back to Sui Prompt Marketplace!",
        })
        navigate("/dashboard")
      } else {
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        })
      }
    }, 1500)
  }

  const handleGoogleLogin = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Logged in with Google",
        description: "Welcome to Sui Prompt Marketplace!",
      })
      navigate("/dashboard")
    }, 1500)
  }

  return (
    <MainLayout>
      <div className="container max-w-md mx-auto py-16">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Login
            </CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to sign in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-lavender-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className=" w-full bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink hover:from-neon-purple/90 hover:via-neon-blue/90 hover:to-neon-pink/90 px-4 py-4 text-md text-white font-light group transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <div className="relative">
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
              onClick={handleGoogleLogin}
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
            </Button>
            <ZKLogin
              onSuccess={() => {
                // The navigation is now handled in the useEffect
                console.log("Login successful")
              }}
              loadingText="Loading..."
              providers={providers}
              proverProvider={SUI_PROVER_ENDPOINT}
            />
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-lavender-600 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  )
}

export default Login;
