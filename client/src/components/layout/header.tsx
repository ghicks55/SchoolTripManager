import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Search, Bell, HelpCircle } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
  className?: string;
}

export function Header({ onMenuClick, className }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Searching for: ${searchQuery}`);
    // Implement search functionality here
  };

  return (
    <header className={cn("bg-white border-b border-border", className)}>
      <div className="flex justify-between items-center px-4 py-3">
        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="p-2 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 focus:outline-none"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 md:max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search trips, schools, students..."
              className="w-full pl-10 pr-4 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5 text-neutral-500" />
          </Button>
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5 text-neutral-500" />
          </Button>
        </div>
      </div>
    </header>
  );
}
