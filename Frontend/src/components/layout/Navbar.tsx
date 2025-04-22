import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Search,
  Menu,
  X,
  LogIn,
  User,
  LayoutDashboard,
  PlusCircle,
  ShoppingBag,
  LogOut,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useZKLogin } from "react-sui-zk-login-kit"
import { useCurrentAccount } from "@mysten/dapp-kit"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const [isLoggedIn, setIsLoggedIn] = useState(false) // In reality, this would come from auth state

  const { encodedJwt, userSalt, setUserSalt, address, logout } = useZKLogin()
  const account = useCurrentAccount()
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-background/80 backdrop-blur-md shadow-md border-b border-neon-purple/20 sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="inline-flex items-center px-2 py-1">
                <span className="text-3xl tracking-wide font-semibold tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500">
                    Prompt Sui
                  </span>
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full border border-neon-purple/30"
                  >
                    <User className="h-5 w-5 text-neon-purple" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-background/95 backdrop-blur-md border border-neon-purple/30"
                >
                  <DropdownMenuLabel className="text-white">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-neon-purple/20" />
                  <DropdownMenuItem className="text-gray-300 hover:text-white focus:text-white hover:bg-neon-purple/10 focus:bg-neon-purple/10">
                    <Link to="/dashboard" className="w-full flex items-center">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:text-white focus:text-white hover:bg-neon-purple/10 focus:bg-neon-purple/10">
                    <Link to="/profile" className="w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:text-white focus:text-white hover:bg-neon-purple/10 focus:bg-neon-purple/10">
                    <Link to="/sell-prompt" className="w-full">
                      Sell a Prompt
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-neon-purple/20" />
                  <DropdownMenuItem
                    onClick={() => setIsLoggedIn(false)}
                    className="text-gray-300 hover:text-white focus:text-white hover:bg-neon-purple/10 focus:bg-neon-purple/10"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <Button
                  asChild
                  className="px-4 bg-transparent border py-5 text-lg border-purple-500 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-all duration-300"
                >
                  <Link to="/marketplace">Marketplace</Link>
                </Button>

                {account?.address || address ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink hover:from-neon-purple/90 hover:via-neon-blue/90 hover:to-neon-pink/90 px-4 py-4 text-md text-white font-light group transition-all duration-300">
                        {account?.address
                          ? `${account.address.slice(
                              0,
                              6
                            )}...${account.address.slice(-4)}`
                          : `${address.slice(0, 6)}...${address.slice(-4)}`}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-background/95 backdrop-blur-md border border-neon-purple/30"
                    >
                      <DropdownMenuLabel className="text-white">
                        Wallet Connected
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-neon-purple/20" />
                      <DropdownMenuItem className="text-gray-300 hover:text-white focus:text-white hover:bg-neon-purple/10 focus:bg-neon-purple/10">
                        <Link
                          to="/dashboard"
                          className="w-full flex items-center"
                        >
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 hover:text-white focus:text-white hover:bg-neon-purple/10 focus:bg-neon-purple/10">
                        <Link
                          to="/profile"
                          className="w-full flex items-center"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 hover:text-white focus:text-white hover:bg-neon-purple/10 focus:bg-neon-purple/10">
                        <Link
                          to="/sell-prompt"
                          className="w-full flex items-center"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Sell a Prompt
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 hover:text-white focus:text-white hover:bg-neon-purple/10 focus:bg-neon-purple/10">
                        <Link
                          to="/marketplace"
                          className="w-full flex items-center"
                        >
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Marketplace
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-neon-purple/20" />
                      <DropdownMenuItem
                        onClick={() => {
                          logout && logout()
                          setIsLoggedIn(false)
                        }}
                        className="text-red-400 hover:text-red-300 focus:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Disconnect
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    asChild
                    className="bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink hover:from-neon-purple/90 hover:via-neon-blue/90 hover:to-neon-pink/90 px-4 py-4 text-md text-white font-light group transition-all duration-300"
                  >
                    <Link to="/signup">Connect Wallet</Link>
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-neon-purple/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-neon-purple"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-300 hover:bg-neon-purple/5 hover:border-neon-purple/30 hover:text-white flex items-center"
              onClick={toggleMenu}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-300 hover:bg-neon-purple/5 hover:border-neon-purple/30 hover:text-white"
                  onClick={toggleMenu}
                >
                  Profile
                </Link>
                <Link
                  to="/sell-prompt"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-300 hover:bg-neon-purple/5 hover:border-neon-purple/30 hover:text-white"
                  onClick={toggleMenu}
                >
                  Sell a Prompt
                </Link>
                <button
                  className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-300 hover:bg-neon-purple/5 hover:border-neon-purple/30 hover:text-white"
                  onClick={() => {
                    setIsLoggedIn(false)
                    toggleMenu()
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 px-3 pt-2">
                <Button asChild variant="outline" className="text-white">
                  <Link to="/login" onClick={toggleMenu}>
                    Login
                  </Link>
                </Button>
                <Button
                  asChild
                  className="bg-neon-purple hover:bg-neon-purple/90"
                >
                  <Link to="/signup" onClick={toggleMenu}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
