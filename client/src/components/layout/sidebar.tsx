import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Bus,
  Utensils,
  BedDouble,
  FileText,
  Settings,
  UserCog,
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
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <div className="mr-3 text-lg">{icon}</div>
        {label}
      </a>
    </Link>
  );
};

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    {
      label: "Main",
      items: [
        {
          icon: <LayoutDashboard size={20} />,
          label: "Dashboard",
          href: "/",
        },
        {
          icon: <Users size={20} />,
          label: "Groups",
          href: "/groups",
        },
        {
          icon: <Calendar size={20} />,
          label: "Itineraries",
          href: "/itineraries",
        },
        {
          icon: <Users size={20} />,
          label: "Roster",
          href: "/roster",
        },
      ],
    },
    {
      label: "Management",
      items: [
        {
          icon: <Bus size={20} />,
          label: "Bus Suppliers",
          href: "/bus-suppliers",
        },
        {
          icon: <Utensils size={20} />,
          label: "Meals",
          href: "/meals",
        },
        {
          icon: <BedDouble size={20} />,
          label: "Rooming",
          href: "/rooming",
        },
      ],
    },
    {
      label: "Reports",
      items: [
        {
          icon: <FileText size={20} />,
          label: "Trip Reports",
          href: "/reports",
        },
      ],
    },
    {
      label: "System",
      items: [
        {
          icon: <Settings size={20} />,
          label: "Settings",
          href: "/settings",
        },
        {
          icon: <UserCog size={20} />,
          label: "User Management",
          href: "/users",
        },
      ],
    },
  ];

  return (
    <div className={cn("flex flex-col bg-sidebar-background border-r border-sidebar-border shadow-sm h-full", className)}>
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-lg font-semibold text-primary">School Trip Manager</h1>
      </div>
      
      <ScrollArea className="flex-1">
        <nav className="px-2 py-4">
          {navItems.map((section, index) => (
            <div key={index} className="mb-6">
              <div className="px-3 py-2 text-sm font-medium text-sidebar-foreground/60">{section.label}</div>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <SidebarItem
                    key={itemIndex}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    isActive={location === item.href || (item.href !== "/" && location.startsWith(item.href))}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
      
      {user && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={user.fullName} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user.fullName.split(' ').map(name => name[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3 space-y-0">
              <p className="text-sm font-medium leading-none">{user.fullName}</p>
              <p className="text-xs text-sidebar-foreground/60 leading-none mt-1">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout} 
              className="ml-auto text-sidebar-foreground/60 hover:text-sidebar-foreground"
              disabled={logoutMutation.isPending}
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
