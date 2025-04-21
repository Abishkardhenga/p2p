
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  MessageSquare,
  ShoppingCart,
  BarChart2,
  Settings,
  Heart,
  PenTool,
  HelpCircle,
  LogOut,
} from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
}

const SidebarItem = ({ icon, label, href, isActive }: SidebarItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
        isActive
          ? "bg-lavender-500 text-white"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      )}
    >
      {icon}
      {label}
    </Link>
  );
};

const DashboardSidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const routes = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Messages",
      href: "/dashboard/messages",
    },
    {
      icon: <ShoppingCart className="h-5 w-5" />,
      label: "Purchases",
      href: "/dashboard/purchases",
    },
    {
      icon: <Heart className="h-5 w-5" />,
      label: "Favorites",
      href: "/dashboard/favorites",
    },
    {
      icon: <PenTool className="h-5 w-5" />,
      label: "My Prompts",
      href: "/dashboard/my-prompts",
    },
    {
      icon: <BarChart2 className="h-5 w-5" />,
      label: "Analytics",
      href: "/dashboard/analytics",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      href: "/dashboard/settings",
    },
  ];

  return (
    <div className="h-screen flex flex-col border-r bg-white">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lavender-600 font-bold text-xl">Sui Prompt</span>
        </Link>
      </div>
      <div className="flex-1 px-3 py-2 space-y-1">
        {routes.map((route) => (
          <SidebarItem
            key={route.href}
            icon={route.icon}
            label={route.label}
            href={route.href}
            isActive={pathname === route.href}
          />
        ))}
      </div>
      <div className="p-4 mt-auto border-t">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-lavender-100 flex items-center justify-center text-lavender-600 font-semibold">
            JD
          </div>
          <div>
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-gray-500">john@example.com</p>
          </div>
        </div>
        <div className="space-y-1">
          <Link
            to="/help"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <HelpCircle className="h-5 w-5" />
            Help & Support
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
