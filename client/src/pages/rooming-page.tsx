import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Plus, Search, Users, Building } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Group, RoomingListEntry } from "@shared/schema";
import { format } from "date-fns";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function RoomingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [searchText, setSearchText] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("all");
  
  // Fetch all groups
  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });
  
  // Fetch rooming list for selected group
  const { data: roomingList = [], isLoading: isLoadingRooming } = useQuery<RoomingListEntry[]>({
    queryKey: ['/api/groups', selectedGroupId, 'rooming'],
    queryFn: async () => {
      if (!selectedGroupId) return [];
      const res = await fetch(`/api/groups/${selectedGroupId}/rooming`);
      if (!res.ok) throw new Error('Failed to fetch rooming list');
      return res.json();
    },
    enabled: !!selectedGroupId,
  });
  
  // Filter rooming list based on search and room type
  const filteredRooms = roomingList.filter(room => {
    const searchMatch = !searchText || 
      room.roomNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      (room.occupant1 && room.occupant1.toLowerCase().includes(searchText.toLowerCase())) ||
      (room.occupant2 && room.occupant2.toLowerCase().includes(searchText.toLowerCase())) ||
      (room.occupant3 && room.occupant3.toLowerCase().includes(searchText.toLowerCase())) ||
      (room.occupant4 && room.occupant4.toLowerCase().includes(searchText.toLowerCase()));
    
    const typeMatch = roomTypeFilter === 'all' || room.roomType === roomTypeFilter;
    
    return searchMatch && typeMatch;
  });
  
  // Get selected group details
  const selectedGroup = groups.find(g => g.id.toString() === selectedGroupId);
  
  // Count rooms by type
  const studentRooms = roomingList.filter(r => r.roomType === 'Students').length;
  const chaperoneRooms = roomingList.filter(r => r.roomType === 'Chaperone' || r.roomType === 'Director').length;
  const otherRooms = roomingList.filter(r => r.roomType !== 'Students' && r.roomType !== 'Chaperone' && r.roomType !== 'Director').length;
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-heading font-bold text-neutral-900">Rooming</h1>
              <p className="text-neutral-600">Manage room assignments for your trips</p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button disabled={!selectedGroupId} className="bg-primary-600 hover:bg-primary-700">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Room
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add New Room</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="room-number" className="text-sm font-medium text-neutral-700 block mb-1">
                          Room Number
                        </label>
                        <Input
                          id="room-number"
                          placeholder="Enter room number"
                        />
                      </div>
                      <div>
                        <label htmlFor="room-type" className="text-sm font-medium text-neutral-700 block mb-1">
                          Room Type
                        </label>
                        <Select>
                          <SelectTrigger id="room-type">
                            <SelectValue placeholder="Select room type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Students">Students</SelectItem>
                            <SelectItem value="Chaperone">Chaperone</SelectItem>
                            <SelectItem value="Director">Director</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Travel Agent">Travel Agent</SelectItem>
                            <SelectItem value="Bus Driver">Bus Driver</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="room-occupancy" className="text-sm font-medium text-neutral-700 block mb-1">
                          Room Occupancy
                        </label>
                        <Select>
                          <SelectTrigger id="room-occupancy">
                            <SelectValue placeholder="Select occupancy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Double">Double</SelectItem>
                            <SelectItem value="Triple">Triple</SelectItem>
                            <SelectItem value="Quad">Quad</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label htmlFor="room-gender" className="text-sm font-medium text-neutral-700 block mb-1">
                          Room Gender
                        </label>
                        <Select>
                          <SelectTrigger id="room-gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="occupant1" className="text-sm font-medium text-neutral-700 block mb-1">
                        Occupant 1
                      </label>
                      <Input
                        id="occupant1"
                        placeholder="Enter occupant name"
                      />
                    </div>
                    <div>
                      <label htmlFor="occupant2" className="text-sm font-medium text-neutral-700 block mb-1">
                        Occupant 2
                      </label>
                      <Input
                        id="occupant2"
                        placeholder="Enter occupant name"
                      />
                    </div>
                    <div>
                      <label htmlFor="occupant3" className="text-sm font-medium text-neutral-700 block mb-1">
                        Occupant 3
                      </label>
                      <Input
                        id="occupant3"
                        placeholder="Enter occupant name"
                      />
                    </div>
                    <div>
                      <label htmlFor="occupant4" className="text-sm font-medium text-neutral-700 block mb-1">
                        Occupant 4
                      </label>
                      <Input
                        id="occupant4"
                        placeholder="Enter occupant name"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <DialogTrigger asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogTrigger>
                    <Button className="bg-primary-600 hover:bg-primary-700">Add Room</Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button disabled={!selectedGroupId} variant="outline">
                <Users className="h-5 w-5 mr-2" />
                Create Chaperone Groups
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
                      <SelectItem value="none">Select a group</SelectItem>
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
          
          {/* Rooming Contents */}
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
                          <div className="text-2xl font-semibold">{studentRooms}</div>
                          <div className="text-sm text-neutral-600">Student Rooms</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-semibold">{chaperoneRooms}</div>
                          <div className="text-sm text-neutral-600">Chaperone Rooms</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-semibold">{otherRooms}</div>
                          <div className="text-sm text-neutral-600">Other Rooms</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-semibold">{roomingList.length}</div>
                          <div className="text-sm text-neutral-600">Total Rooms</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Rooming Tabs */}
              <Tabs defaultValue="rooms" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="rooms" className="flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Room Assignments
                  </TabsTrigger>
                  <TabsTrigger value="chaperones" className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Chaperone Groups
                  </TabsTrigger>
                </TabsList>
                
                {/* Room Assignments Tab */}
                <TabsContent value="rooms">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative w-full md:w-64">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                          <Input
                            type="search"
                            placeholder="Search rooms..."
                            className="pl-8"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                          />
                        </div>
                        <Select defaultValue="all" onValueChange={setRoomTypeFilter}>
                          <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="All Room Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Room Types</SelectItem>
                            <SelectItem value="Students">Student Rooms</SelectItem>
                            <SelectItem value="Chaperone">Chaperone Rooms</SelectItem>
                            <SelectItem value="Director">Director Rooms</SelectItem>
                            <SelectItem value="Admin">Admin Rooms</SelectItem>
                            <SelectItem value="Travel Agent">Travel Agent Rooms</SelectItem>
                            <SelectItem value="Bus Driver">Bus Driver Rooms</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingRooming ? (
                        <div className="text-center py-8 text-neutral-500">Loading room assignments...</div>
                      ) : filteredRooms.length === 0 ? (
                        <div className="text-center py-8">
                          <Home className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No rooms found</h3>
                          <p className="text-neutral-500 mb-4">
                            {searchText || roomTypeFilter !== 'all' 
                              ? "No rooms match your search criteria." 
                              : "This trip doesn't have any room assignments yet."}
                          </p>
                          <Button className="bg-primary-600 hover:bg-primary-700">
                            <Plus className="h-5 w-5 mr-2" />
                            Add Room
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredRooms.map((room) => (
                            <Card key={room.id} className="border-2 border-neutral-200">
                              <CardContent className="pt-6">
                                <div className="flex justify-between items-center mb-4">
                                  <div className="flex items-center">
                                    <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-md mr-3 font-medium">
                                      {room.roomNumber}
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      room.roomType === 'Students' ? 'bg-info-100 text-info-800' :
                                      room.roomType === 'Chaperone' ? 'bg-secondary-100 text-secondary-800' :
                                      room.roomType === 'Director' ? 'bg-primary-100 text-primary-800' :
                                      'bg-neutral-100 text-neutral-800'
                                    }`}>
                                      {room.roomType}
                                    </span>
                                  </div>
                                  <Button variant="ghost" size="sm" className="text-neutral-500">
                                    <i className="h-4 w-4 fas fa-ellipsis-v"></i>
                                  </Button>
                                </div>
                                <div className="mb-2">
                                  <span className="text-sm text-neutral-500">
                                    {room.roomGender} • {room.roomOccupancy}
                                  </span>
                                </div>
                                <div className="space-y-2 mt-4">
                                  {room.occupant1 && (
                                    <div className="bg-neutral-50 p-2 rounded text-sm">
                                      {room.occupant1}
                                    </div>
                                  )}
                                  {room.occupant2 && (
                                    <div className="bg-neutral-50 p-2 rounded text-sm">
                                      {room.occupant2}
                                    </div>
                                  )}
                                  {room.occupant3 && (
                                    <div className="bg-neutral-50 p-2 rounded text-sm">
                                      {room.occupant3}
                                    </div>
                                  )}
                                  {room.occupant4 && (
                                    <div className="bg-neutral-50 p-2 rounded text-sm">
                                      {room.occupant4}
                                    </div>
                                  )}
                                </div>
                                <div className="mt-4 flex justify-end">
                                  <Button variant="ghost" size="sm" className="text-primary-600">Edit</Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Chaperone Groups Tab */}
                <TabsContent value="chaperones">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No chaperone groups created</h3>
                        <p className="text-neutral-500 mb-4">
                          You haven't created any chaperone groups for this trip yet. Create chaperone groups to assign students to chaperones.
                        </p>
                        <Button className="bg-primary-600 hover:bg-primary-700">
                          <Plus className="h-5 w-5 mr-2" />
                          Create Chaperone Groups
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Home className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">No Group Selected</h3>
                <p className="text-neutral-500 max-w-md mx-auto">
                  Please select a school group above to view and manage room assignments.
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
