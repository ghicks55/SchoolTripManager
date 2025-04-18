import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Group, Roster, InsertRoster, insertRosterSchema } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Plus, Filter, Download, UserPlus, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function RosterPage() {
  const [, navigate] = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("roster");
  
  const { data: groups, isLoading: isLoadingGroups } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
  });
  
  const { data: roster, isLoading: isLoadingRoster } = useQuery<Roster[]>({
    queryKey: [`/api/groups/${selectedGroupId}/roster`],
    enabled: !!selectedGroupId && activeTab === "roster",
  });
  
  const { data: waitingList, isLoading: isLoadingWaitingList } = useQuery<Roster[]>({
    queryKey: [`/api/groups/${selectedGroupId}/waiting-list`],
    enabled: !!selectedGroupId && activeTab === "waiting-list",
  });
  
  const { data: droppedList, isLoading: isLoadingDroppedList } = useQuery<Roster[]>({
    queryKey: [`/api/groups/${selectedGroupId}/dropped`],
    enabled: !!selectedGroupId && activeTab === "dropped",
  });
  
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };
  
  const handleGroupChange = (value: string) => {
    setSelectedGroupId(value);
  };
  
  const handleAddTraveler = () => {
    if (selectedGroupId) {
      navigate(`/groups/${selectedGroupId}/roster/new`);
    } else {
      // Show an error or prompt to select a group first
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implemented through the filter below
  };

  // Filter roster data
  const filterRosterData = (data: Roster[] | undefined) => {
    if (!data) return [];
    
    return data.filter(traveler => {
      const query = searchQuery.toLowerCase();
      return (
        traveler.firstName.toLowerCase().includes(query) ||
        traveler.lastName.toLowerCase().includes(query) ||
        traveler.travelerType.toLowerCase().includes(query) ||
        (traveler.parentEmail && traveler.parentEmail.toLowerCase().includes(query))
      );
    });
  };
  
  const filteredRoster = filterRosterData(roster);
  const filteredWaitingList = filterRosterData(waitingList);
  const filteredDroppedList = filterRosterData(droppedList);
  
  return (
    <div className="flex h-screen overflow-hidden">
      <div className={`fixed inset-0 z-50 bg-background md:static md:block md:z-auto md:w-64 ${isMobileSidebarOpen ? "block" : "hidden"}`}>
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={toggleMobileSidebar} />
        
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Roster Management</h1>
            <p className="text-muted-foreground">Manage trip participants</p>
          </div>
          
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <CardTitle>Select a Group</CardTitle>
                <div className="flex gap-2">
                  <Select value={selectedGroupId} onValueChange={handleGroupChange}>
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingGroups ? (
                        <SelectItem value="loading" disabled>Loading groups...</SelectItem>
                      ) : groups && groups.length > 0 ? (
                        groups.map((group) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.schoolName}: {group.groupName} ({format(new Date(group.startDate), "MMM d, yyyy")})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No groups available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    onClick={handleAddTraveler} 
                    disabled={!selectedGroupId || isLoadingGroups}
                  >
                    <UserPlus className="mr-2 h-4 w-4" /> Add Traveler
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
          
          {selectedGroupId && (
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>
                      {isLoadingGroups 
                        ? <Skeleton className="h-6 w-40" /> 
                        : groups?.find(g => g.id.toString() === selectedGroupId) && (
                            <>
                              {groups.find(g => g.id.toString() === selectedGroupId)?.schoolName}: {groups.find(g => g.id.toString() === selectedGroupId)?.groupName} Roster
                            </>
                          )
                      }
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <form onSubmit={handleSearch} className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search roster..."
                        className="pl-9 w-[200px] md:w-[250px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </form>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>All Travelers</DropdownMenuItem>
                        <DropdownMenuItem>Students Only</DropdownMenuItem>
                        <DropdownMenuItem>Chaperones Only</DropdownMenuItem>
                        <DropdownMenuItem>Directors Only</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="roster">
                      Active Roster 
                      {roster && <span className="ml-1">({roster.length})</span>}
                    </TabsTrigger>
                    <TabsTrigger value="waiting-list">
                      Waiting List
                      {waitingList && <span className="ml-1">({waitingList.length})</span>}
                    </TabsTrigger>
                    <TabsTrigger value="dropped">
                      Dropped
                      {droppedList && <span className="ml-1">({droppedList.length})</span>}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="roster">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Name</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Type</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Gender</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Contact</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Meal</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">T-Shirt</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Room</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {isLoadingRoster ? (
                            Array.from({ length: 5 }).map((_, i) => (
                              <tr key={i} className="border-b border-border">
                                <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-12" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-12" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-12" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                              </tr>
                            ))
                          ) : filteredRoster.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-6 text-center text-muted-foreground">
                                {searchQuery ? "No travelers match your search" : "No travelers found"}
                              </td>
                            </tr>
                          ) : (
                            filteredRoster.map((traveler) => (
                              <tr key={traveler.id} className="border-b border-border hover:bg-muted/50">
                                <td className="py-3 px-4">
                                  {traveler.firstName} {traveler.lastName}
                                </td>
                                <td className="py-3 px-4 capitalize">{traveler.travelerType}</td>
                                <td className="py-3 px-4">{traveler.gender}</td>
                                <td className="py-3 px-4">
                                  {traveler.parentEmail || "N/A"}
                                </td>
                                <td className="py-3 px-4">{traveler.meal || "Not selected"}</td>
                                <td className="py-3 px-4">{traveler.tShirtSize || "N/A"}</td>
                                <td className="py-3 px-4">{traveler.roomOccupancy || "Not assigned"}</td>
                                <td className="py-3 px-4">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => navigate(`/groups/${selectedGroupId}/roster/${traveler.id}`)}
                                  >
                                    Details
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="waiting-list">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Name</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Type</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Gender</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Contact</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {isLoadingWaitingList ? (
                            Array.from({ length: 3 }).map((_, i) => (
                              <tr key={i} className="border-b border-border">
                                <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-12" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                              </tr>
                            ))
                          ) : filteredWaitingList.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-6 text-center text-muted-foreground">
                                {searchQuery ? "No waiting list travelers match your search" : "No travelers on waiting list"}
                              </td>
                            </tr>
                          ) : (
                            filteredWaitingList.map((traveler) => (
                              <tr key={traveler.id} className="border-b border-border hover:bg-muted/50">
                                <td className="py-3 px-4">
                                  {traveler.firstName} {traveler.lastName}
                                </td>
                                <td className="py-3 px-4 capitalize">{traveler.travelerType}</td>
                                <td className="py-3 px-4">{traveler.gender}</td>
                                <td className="py-3 px-4">
                                  {traveler.parentEmail || "N/A"}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => navigate(`/groups/${selectedGroupId}/roster/${traveler.id}`)}
                                    >
                                      Details
                                    </Button>
                                    <Button size="sm">Move to Roster</Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="dropped">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Name</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Type</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Gender</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Contact</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {isLoadingDroppedList ? (
                            Array.from({ length: 2 }).map((_, i) => (
                              <tr key={i} className="border-b border-border">
                                <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-12" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                              </tr>
                            ))
                          ) : filteredDroppedList.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-6 text-center text-muted-foreground">
                                {searchQuery ? "No dropped travelers match your search" : "No dropped travelers"}
                              </td>
                            </tr>
                          ) : (
                            filteredDroppedList.map((traveler) => (
                              <tr key={traveler.id} className="border-b border-border hover:bg-muted/50">
                                <td className="py-3 px-4">
                                  {traveler.firstName} {traveler.lastName}
                                </td>
                                <td className="py-3 px-4 capitalize">{traveler.travelerType}</td>
                                <td className="py-3 px-4">{traveler.gender}</td>
                                <td className="py-3 px-4">
                                  {traveler.parentEmail || "N/A"}
                                </td>
                                <td className="py-3 px-4">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => navigate(`/groups/${selectedGroupId}/roster/${traveler.id}`)}
                                  >
                                    Details
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
