import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Download, Users, Clock, UserX } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Group, Roster, WaitingListEntry, DropOff } from "@shared/schema";
import { format } from "date-fns";

export default function RostersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [searchText, setSearchText] = useState("");
  const [travelerTypeFilter, setTravelerTypeFilter] = useState("all");
  
  // Fetch all groups
  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });
  
  // Fetch roster for selected group
  const { data: roster = [], isLoading: isLoadingRoster } = useQuery<Roster[]>({
    queryKey: ['/api/groups', selectedGroupId, 'rosters'],
    queryFn: async () => {
      if (!selectedGroupId) return [];
      const res = await fetch(`/api/groups/${selectedGroupId}/rosters`);
      if (!res.ok) throw new Error('Failed to fetch roster');
      return res.json();
    },
    enabled: !!selectedGroupId,
  });
  
  // Fetch waiting list for selected group
  const { data: waitingList = [], isLoading: isLoadingWaitingList } = useQuery<WaitingListEntry[]>({
    queryKey: ['/api/groups', selectedGroupId, 'waiting-list'],
    queryFn: async () => {
      if (!selectedGroupId) return [];
      const res = await fetch(`/api/groups/${selectedGroupId}/waiting-list`);
      if (!res.ok) throw new Error('Failed to fetch waiting list');
      return res.json();
    },
    enabled: !!selectedGroupId,
  });
  
  // Fetch drop-offs for selected group
  const { data: dropOffs = [], isLoading: isLoadingDropOffs } = useQuery<DropOff[]>({
    queryKey: ['/api/groups', selectedGroupId, 'drop-offs'],
    queryFn: async () => {
      if (!selectedGroupId) return [];
      const res = await fetch(`/api/groups/${selectedGroupId}/drop-offs`);
      if (!res.ok) throw new Error('Failed to fetch drop-offs');
      return res.json();
    },
    enabled: !!selectedGroupId,
  });
  
  // Filter roster based on search and traveler type
  const filteredRoster = roster.filter(traveler => {
    const searchMatch = !searchText || 
      traveler.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      traveler.lastName.toLowerCase().includes(searchText.toLowerCase());
    
    const typeMatch = travelerTypeFilter === 'all' || traveler.travelerType === travelerTypeFilter;
    
    return searchMatch && typeMatch;
  });
  
  // Get selected group details
  const selectedGroup = groups.find(g => g.id.toString() === selectedGroupId);
  
  // Count travelers by type
  const studentCount = roster.filter(t => t.travelerType === 'Student').length;
  const chaperoneCount = roster.filter(t => t.travelerType === 'Chaperone').length;
  const directorCount = roster.filter(t => t.travelerType === 'Director').length;
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-heading font-bold text-neutral-900">Rosters</h1>
              <p className="text-neutral-600">Manage travelers for your school trips</p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <Button disabled={!selectedGroupId} className="bg-primary-600 hover:bg-primary-700">
                <Plus className="h-5 w-5 mr-2" />
                Add Traveler
              </Button>
              <Button disabled={!selectedGroupId} variant="outline">
                <Download className="h-5 w-5 mr-2" />
                Export Roster
              </Button>
            </div>
          </div>
          
          {/* Group Selector */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Select Group</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a school group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Select a group</SelectItem>
                      {groups.map(group => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.schoolName} - {group.groupName} ({format(new Date(group.startDate), "MMM d, yyyy")})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Roster Contents */}
          {selectedGroupId ? (
            <div>
              {/* Group Trip Info */}
              {selectedGroup && (
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold">{selectedGroup.schoolName} - {selectedGroup.groupName}</h2>
                        <p className="text-neutral-600">
                          {format(new Date(selectedGroup.startDate), "MMMM d")} - {format(new Date(selectedGroup.endDate), "MMMM d, yyyy")}
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0 flex flex-wrap gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-semibold">{studentCount}</div>
                          <div className="text-sm text-neutral-600">Students</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-semibold">{chaperoneCount}</div>
                          <div className="text-sm text-neutral-600">Chaperones</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-semibold">{directorCount}</div>
                          <div className="text-sm text-neutral-600">Directors</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-semibold">{roster.length}</div>
                          <div className="text-sm text-neutral-600">Total</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Roster Tabs */}
              <Tabs defaultValue="roster" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="roster" className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Roster
                  </TabsTrigger>
                  <TabsTrigger value="waiting-list" className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Waiting List
                  </TabsTrigger>
                  <TabsTrigger value="drop-offs" className="flex items-center">
                    <UserX className="h-4 w-4 mr-2" />
                    Drop Offs
                  </TabsTrigger>
                </TabsList>
                
                {/* Roster Tab Content */}
                <TabsContent value="roster">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative w-full md:w-64">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                          <Input
                            type="search"
                            placeholder="Search roster..."
                            className="pl-8"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                          />
                        </div>
                        <Select defaultValue="all" onValueChange={setTravelerTypeFilter}>
                          <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="All Travelers" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Travelers</SelectItem>
                            <SelectItem value="Student">Students</SelectItem>
                            <SelectItem value="Chaperone">Chaperones</SelectItem>
                            <SelectItem value="Director">Directors</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingRoster ? (
                        <div className="text-center py-8 text-neutral-500">Loading roster...</div>
                      ) : filteredRoster.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No travelers found</h3>
                          <p className="text-neutral-500 mb-4">
                            {searchText || travelerTypeFilter !== 'all' 
                              ? "No travelers match your search criteria." 
                              : "This trip doesn't have any travelers yet."}
                          </p>
                          <Button className="bg-primary-600 hover:bg-primary-700">
                            <Plus className="h-5 w-5 mr-2" />
                            Add Traveler
                          </Button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Gender
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Date of Birth
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Contact
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Room
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                              {filteredRoster.map((traveler) => (
                                <tr key={traveler.id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-neutral-900">{traveler.firstName} {traveler.lastName}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      traveler.travelerType === 'Student' ? 'bg-info-100 text-info-800' :
                                      traveler.travelerType === 'Chaperone' ? 'bg-secondary-100 text-secondary-800' :
                                      'bg-primary-100 text-primary-800'
                                    }`}>
                                      {traveler.travelerType}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                    {traveler.gender || "Not specified"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                    {traveler.dateOfBirth ? format(new Date(traveler.dateOfBirth), "MMM d, yyyy") : "Not provided"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-neutral-900">{traveler.parentEmail || "N/A"}</div>
                                    <div className="text-sm text-neutral-500">{traveler.parentPhone || ""}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                    {traveler.roomOccupancy || "Not assigned"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                                    <Button variant="ghost" size="sm" className="mr-1">Edit</Button>
                                    <Button variant="ghost" size="sm" className="text-red-600">Remove</Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Waiting List Tab Content */}
                <TabsContent value="waiting-list">
                  <Card>
                    <CardContent className="pt-6">
                      {isLoadingWaitingList ? (
                        <div className="text-center py-8 text-neutral-500">Loading waiting list...</div>
                      ) : waitingList.length === 0 ? (
                        <div className="text-center py-8">
                          <Clock className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">Waiting list is empty</h3>
                          <p className="text-neutral-500 mb-4">
                            There are no travelers on the waiting list for this trip.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Gender
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Contact
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                              {waitingList.map((traveler) => (
                                <tr key={traveler.id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-neutral-900">{traveler.firstName} {traveler.lastName}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      traveler.travelerType === 'Student' ? 'bg-info-100 text-info-800' :
                                      traveler.travelerType === 'Chaperone' ? 'bg-secondary-100 text-secondary-800' :
                                      'bg-primary-100 text-primary-800'
                                    }`}>
                                      {traveler.travelerType}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                    {traveler.gender || "Not specified"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-neutral-900">{traveler.parentEmail || "N/A"}</div>
                                    <div className="text-sm text-neutral-500">{traveler.parentPhone || ""}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <Button size="sm" className="mr-1 bg-success-100 text-success-800 hover:bg-success-200">
                                      Promote to Roster
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-600">Remove</Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Drop Offs Tab Content */}
                <TabsContent value="drop-offs">
                  <Card>
                    <CardContent className="pt-6">
                      {isLoadingDropOffs ? (
                        <div className="text-center py-8 text-neutral-500">Loading drop-offs...</div>
                      ) : dropOffs.length === 0 ? (
                        <div className="text-center py-8">
                          <UserX className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No drop-offs recorded</h3>
                          <p className="text-neutral-500 mb-4">
                            There are no travelers who have dropped off from this trip.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Reason
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                              {dropOffs.map((traveler) => (
                                <tr key={traveler.id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-neutral-900">{traveler.firstName} {traveler.lastName}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      traveler.travelerType === 'Student' ? 'bg-info-100 text-info-800' :
                                      traveler.travelerType === 'Chaperone' ? 'bg-secondary-100 text-secondary-800' :
                                      'bg-primary-100 text-primary-800'
                                    }`}>
                                      {traveler.travelerType}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                    {traveler.reason || "No reason provided"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">No Group Selected</h3>
                <p className="text-neutral-500 max-w-md mx-auto">
                  Please select a school group above to view and manage its roster.
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
