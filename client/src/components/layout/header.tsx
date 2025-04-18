import { useState } from "react";
import { Bell, HelpCircle, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [searchText, setSearchText] = useState("");
  const { logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="bg-white border-b border-neutral-200 h-16 flex items-center z-20">
      <div className="px-4 sm:px-6 flex justify-between items-center w-full">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-neutral-500 hover:text-neutral-700 focus:outline-none sm:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        {/* Search Bar */}
        <div className="relative ml-4 sm:ml-0 flex-1 max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-neutral-400" />
          </div>
          <Input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md leading-5 bg-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search trips, schools, or participants..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        
        {/* Right Side Actions */}
        <div className="ml-4 flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-neutral-700">
            <Bell className="h-5 w-5" />
          </Button>
          
          {/* Help */}
          <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-neutral-700">
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* Logout */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-neutral-500 hover:text-neutral-700 hidden sm:block"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
