import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Group } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Edit, Eye, MoreHorizontal } from "lucide-react";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface GroupsTableProps {
  groups: Group[];
  isLoading: boolean;
}

export default function GroupsTable({ groups, isLoading }: GroupsTableProps) {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality is implemented through the filter below
  };
  
  const handleAddGroup = () => {
    navigate("/groups/new");
  };
  
  // Filter and paginate groups
  const filteredGroups = groups
    .filter(group => {
      const query = searchQuery.toLowerCase();
      return (
        group.schoolName.toLowerCase().includes(query) ||
        group.groupName.toLowerCase().includes(query) ||
        group.location.toLowerCase().includes(query) ||
        group.director?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const pageCount = Math.ceil(filteredGroups.length / itemsPerPage);
  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string }> = {
      active: { bg: "bg-green-100 text-green-800", text: "Active" },
      confirmed: { bg: "bg-blue-100 text-blue-800", text: "Confirmed" },
      pending: { bg: "bg-amber-100 text-amber-800", text: "Pending" },
      processing: { bg: "bg-purple-100 text-purple-800", text: "Processing" },
      completed: { bg: "bg-gray-100 text-gray-800", text: "Completed" },
      incomplete: { bg: "bg-red-100 text-red-800", text: "Incomplete" },
    };
    
    const defaultStatus = { bg: "bg-gray-100 text-gray-800", text: "Unknown" };
    const statusStyle = statusMap[status?.toLowerCase()] || defaultStatus;
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusStyle.bg}`}>
        {statusStyle.text}
      </span>
    );
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Recent Groups</CardTitle>
        <div className="flex space-x-2">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search groups..."
              className="pl-9 pr-4 py-1.5 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <Button onClick={handleAddGroup}>
            <Plus className="mr-2 h-4 w-4" /> Add Group
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">School Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Group Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Travel Dates</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Director</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                  </tr>
                ))
              ) : paginatedGroups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-3 text-center text-muted-foreground">
                    {searchQuery ? "No groups match your search" : "No groups found"}
                  </td>
                </tr>
              ) : (
                paginatedGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">{group.schoolName}</td>
                    <td className="px-4 py-3 text-sm">{group.groupName}</td>
                    <td className="px-4 py-3 text-sm">{group.location}</td>
                    <td className="px-4 py-3 text-sm">
                      {format(new Date(group.startDate), "MMM d")}
                      {new Date(group.startDate).toDateString() !== new Date(group.endDate).toDateString() 
                        ? ` - ${format(new Date(group.endDate), "MMM d, yyyy")}`
                        : `, ${format(new Date(group.startDate), "yyyy")}`
                      }
                    </td>
                    <td className="px-4 py-3 text-sm">{group.director || "Not assigned"}</td>
                    <td className="px-4 py-3">{getStatusBadge(group.status)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => navigate(`/groups/${group.id}/edit`)}
                          className="text-primary hover:text-primary/80"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => navigate(`/groups/${group.id}`)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/groups/${group.id}/roster`)}>View Roster</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/groups/${group.id}/itinerary`)}>View Itinerary</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/groups/${group.id}/rooming`)}>Manage Rooming</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {filteredGroups.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {paginatedGroups.length} of {filteredGroups.length} groups
            </div>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(pageCount, 3) }).map((_, i) => {
                let pageNumber;
                
                if (pageCount <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage === 1) {
                  pageNumber = i + 1;
                } else if (currentPage === pageCount) {
                  pageNumber = pageCount - 2 + i;
                } else {
                  pageNumber = currentPage - 1 + i;
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={currentPage === pageNumber ? "bg-primary-50 text-primary-600 border border-border" : ""}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pageCount || pageCount === 0}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
