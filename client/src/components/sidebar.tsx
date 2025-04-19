import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Home, 
  School, 
  Calendar, 
  Users, 
  Truck, 
  UtensilsCrossed, 
  Building, 
  FileBarChart, 
  Settings, 
  LogOut 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type NavItemProps = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
};

function NavItem({ href, icon: Icon, label, active }: NavItemProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:text-primary-900 hover:bg-primary-50",
          active
            ? "bg-primary-100 text-primary-900 font-medium"
            : "text-neutral-600"
        )}
      >
        <Icon className={cn("h-5 w-5", active ? "text-primary-800" : "text-neutral-500")} />
        <span>{label}</span>
      </a>
    </Link>
  );
}

export default function Sidebar() {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    // Close sidebar on mobile when route changes
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
      },
    });
  };

  if (!sidebarOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white transition-transform duration-300 ease-in-out",
        isMobile && "shadow-lg",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/">
          <a className="flex items-center gap-2">
            <School className="h-6 w-6 text-primary-600" />
            <span className="font-heading text-lg font-semibold">TripManager</span>
          </a>
        </Link>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-1 px-2">
          <NavItem
            href="/"
            icon={Home}
            label="Dashboard"
            active={location === "/"}
          />
          <NavItem
            href="/groups"
            icon={School}
            label="School Groups"
            active={location === "/groups"}
          />
          <NavItem
            href="/itineraries"
            icon={Calendar}
            label="Itineraries"
            active={location === "/itineraries"}
          />
          <NavItem
            href="/rosters"
            icon={Users}
            label="Rosters"
            active={location === "/rosters"}
          />
          <NavItem
            href="/transportation"
            icon={Truck}
            label="Transportation"
            active={location === "/transportation"}
          />
          <NavItem
            href="/meals"
            icon={UtensilsCrossed}
            label="Meals"
            active={location === "/meals"}
          />
          <NavItem
            href="/rooming"
            icon={Building}
            label="Rooming"
            active={location === "/rooming"}
          />
          <NavItem
            href="/reports"
            icon={FileBarChart}
            label="Reports"
            active={location === "/reports"}
          />
          <NavItem
            href="/settings"
            icon={Settings}
            label="Settings"
            active={location === "/settings"}
          />
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm font-medium text-primary-800">
              {user?.fullName?.charAt(0) || user?.username?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium">{user?.fullName || user?.username}</p>
            <p className="text-xs text-neutral-500">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  );
}