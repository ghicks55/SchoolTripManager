import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Clipboard, 
  TruckIcon, 
  BookOpen, 
  Home, 
  BarChart, 
  Settings, 
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
}

const SidebarLink = ({ href, icon, label, isActive, isCollapsed }: SidebarLinkProps) => {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
          isActive 
            ? "bg-primary-50 text-primary-700" 
            : "text-neutral-600 hover:bg-neutral-100"
        )}
      >
        <span>{icon}</span>
        {!isCollapsed && <span>{label}</span>}
      </Button>
    </Link>
  );
};

export function Sidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  
  return (
    <aside 
      className={cn(
        "bg-white border-r border-neutral-200 transition-all duration-300 ease-in-out relative z-30 h-screen",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Area */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
        <div className="flex items-center">
          <span className="h-8 w-8 bg-primary-500 rounded text-white flex items-center justify-center font-bold mr-2">TM</span>
          {!isCollapsed && <h1 className="text-xl font-heading font-semibold text-primary-700">TripManager</h1>}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-neutral-500 hover:text-neutral-700 focus:outline-none h-8 w-8 px-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>
      
      {/* Navigation */}
      <nav className="mt-2 px-2">
        <div className="space-y-1">
          <SidebarLink 
            href="/" 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            isActive={location === "/"} 
            isCollapsed={isCollapsed} 
          />
          
          <SidebarLink 
            href="/groups" 
            icon={<Users size={20} />} 
            label="School Groups" 
            isActive={location === "/groups"} 
            isCollapsed={isCollapsed} 
          />
          
          <SidebarLink 
            href="/itineraries" 
            icon={<Calendar size={20} />} 
            label="Itineraries" 
            isActive={location === "/itineraries"} 
            isCollapsed={isCollapsed} 
          />
          
          <SidebarLink 
            href="/rosters" 
            icon={<Clipboard size={20} />} 
            label="Rosters" 
            isActive={location === "/rosters"} 
            isCollapsed={isCollapsed} 
          />
          
          <SidebarLink 
            href="/transportation" 
            icon={<TruckIcon size={20} />} 
            label="Transportation" 
            isActive={location === "/transportation"} 
            isCollapsed={isCollapsed} 
          />
          
          <SidebarLink 
            href="/meals" 
            icon={<BookOpen size={20} />} 
            label="Meals" 
            isActive={location === "/meals"} 
            isCollapsed={isCollapsed} 
          />
          
          <SidebarLink 
            href="/rooming" 
            icon={<Home size={20} />} 
            label="Rooming" 
            isActive={location === "/rooming"} 
            isCollapsed={isCollapsed} 
          />
          
          <SidebarLink 
            href="/reports" 
            icon={<BarChart size={20} />} 
            label="Reports" 
            isActive={location === "/reports"} 
            isCollapsed={isCollapsed} 
          />
          
          <SidebarLink 
            href="/settings" 
            icon={<Settings size={20} />} 
            label="Settings" 
            isActive={location === "/settings"} 
            isCollapsed={isCollapsed} 
          />
        </div>
      </nav>
      
      {/* User Profile */}
      <div className="absolute bottom-0 w-full border-t border-neutral-200 bg-white p-4">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-neutral-300 rounded-full text-neutral-700 flex items-center justify-center">
            {user?.fullName?.charAt(0) || "U"}
          </div>
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-neutral-800 truncate">{user?.fullName}</p>
              <p className="text-xs text-neutral-500 capitalize">{user?.role}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
