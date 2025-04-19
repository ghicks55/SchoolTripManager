import { useState } from "react";
import { Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
      {isMobile && (
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      )}

      <div className="flex items-center gap-2 md:ml-auto">
        {isSearchOpen ? (
          <div className="relative w-full md:w-64 lg:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-neutral-100 pl-8"
              autoFocus
              onBlur={() => setIsSearchOpen(false)}
            />
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
            >
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
              <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-primary-500"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-auto">
              <DropdownMenuItem className="cursor-pointer p-4">
                <div className="flex w-full flex-col gap-1">
                  <div className="flex items-start justify-between">
                    <span className="font-medium">Group trip starting soon</span>
                    <span className="text-xs text-neutral-500">1 hour ago</span>
                  </div>
                  <p className="line-clamp-2 text-sm text-neutral-600">
                    Riverside High School - Band trip starts in 3 days. Make sure all preparations are complete.
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer p-4">
                <div className="flex w-full flex-col gap-1">
                  <div className="flex items-start justify-between">
                    <span className="font-medium">New roster additions</span>
                    <span className="text-xs text-neutral-500">3 hours ago</span>
                  </div>
                  <p className="line-clamp-2 text-sm text-neutral-600">
                    2 new students were added to the Washington High School trip roster.
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer p-4">
                <div className="flex w-full flex-col gap-1">
                  <div className="flex items-start justify-between">
                    <span className="font-medium">Room assignments ready</span>
                    <span className="text-xs text-neutral-500">Yesterday</span>
                  </div>
                  <p className="line-clamp-2 text-sm text-neutral-600">
                    Room assignments for Jefferson Middle School have been finalized and are ready for review.
                  </p>
                </div>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer justify-center">
              <span className="text-sm font-medium">View all notifications</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}