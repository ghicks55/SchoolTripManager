import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Group, RoomingList, Roster, InsertRoomingList, insertRoomingListSchema } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  BedDouble, 
  Users, 
  UserX, 
  Building, 
  MoveHorizontal,
  AlertCircle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function Rooming() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<RoomingList | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const { data: groups, isLoading: isLoadingGroups } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
  });

  const { data: roomingList, isLoading: isLoadingRooms } = useQuery<RoomingList[]>({
    queryKey: [`/api/groups/${selectedGroupId}/rooming`],
    enabled: !!selectedGroupId,
  });

  const { data: rosterList, isLoading: isLoadingRoster } = useQuery<Roster[]>({
    queryKey: [`/api/groups/${selectedGroupId}/roster`],
    enabled: !!selectedGroupId,
  });

  const createRoom = useMutation({
    mutationFn: async (newRoom: InsertRoomingList) => {
      const res = await apiRequest("POST", "/api/rooming", newRoom);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${selectedGroupId}/rooming`] });
      toast({
        title: "Room created",
        description: "The room has been added successfully",
      });
      setIsCreateDialogOpen(false);
      form.reset({
        groupId: parseInt(selectedGroupId),
        roomNumber: "",
        roomType: "",
        roomOccupancy: "",
        roomGender: "",
        occupant1Id: undefined,
        occupant2Id: undefined,
        occupant3Id: undefined,
        occupant4Id: undefined,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create room",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateRoom = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertRoomingList> }) => {
      const res = await apiRequest("PUT", `/api/rooming/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${selectedGroupId}/rooming`] });
      toast({
        title: "Room updated",
        description: "The room has been updated successfully",
      });
      setIsEditDialogOpen(false);
      setCurrentRoom(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update room",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRoom = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/rooming/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${selectedGroupId}/rooming`] });
      toast({
        title: "Room deleted",
        description: "The room has been removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete room",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleGroupChange = (value: string) => {
    setSelectedGroupId(value);
  };

  // Form schema
  const formSchema = insertRoomingListSchema;
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupId: parseInt(selectedGroupId) || 0,
      roomNumber: "",
      roomType: "",
      roomOccupancy: "",
      roomGender: "",
      occupant1Id: undefined,
      occupant2Id: undefined,
      occupant3Id: undefined,
      occupant4Id: undefined,
    },
  });

  const editForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupId: parseInt(selectedGroupId) || 0,
      roomNumber: "",
      roomType: "",
      roomOccupancy: "",
      roomGender: "",
      occupant1Id: undefined,
      occupant2Id: undefined,
      occupant3Id: undefined,
      occupant4Id: undefined,
    },
  });

  // Update form default values when selectedGroupId changes
  useEffect(() => {
    if (selectedGroupId) {
      form.setValue('groupId', parseInt(selectedGroupId));
    }
  }, [selectedGroupId, form]);

  const onSubmit = (data: FormValues) => {
    createRoom.mutate(data);
  };

  const onEdit = (data: FormValues) => {
    if (currentRoom) {
      updateRoom.mutate({ id: currentRoom.id, data });
    }
  };

  const handleEdit = (room: RoomingList) => {
    setCurrentRoom(room);
    editForm.reset({
      groupId: room.groupId,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      roomOccupancy: room.roomOccupancy,
      roomGender: room.roomGender || "",
      occupant1Id: room.occupant1Id,
      occupant2Id: room.occupant2Id,
      occupant3Id: room.occupant3Id,
      occupant4Id: room.occupant4Id,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteRoom.mutate(id);
  };

  // Filter rooming list based on active tab
  const filteredRoomingList = roomingList
    ? roomingList.filter(room => {
        if (activeTab === "all") return true;
        return room.roomType.toLowerCase() === activeTab.toLowerCase();
      })
    : [];

  // Get traveler name by ID
  const getTravelerName = (id?: number) => {
    if (!id || !rosterList) return "-";
    const traveler = rosterList.find(r => r.id === id);
    return traveler ? `${traveler.firstName} ${traveler.lastName}` : "-";
  };

  // Get unique room types for tabs
  const roomTypes = roomingList
    ? [...new Set(roomingList.map(room => room.roomType.toLowerCase()))]
    : [];

  // Get available travelers for dropdown
  const availableTravelers = rosterList
    ? rosterList.map(traveler => ({
        id: traveler.id,
        name: `${traveler.firstName} ${traveler.lastName} (${traveler.travelerType})`,
        gender: traveler.gender,
        type: traveler.travelerType,
      }))
    : [];

  // Sort by room number
  const sortedRoomingList = [...filteredRoomingList].sort((a, b) => {
    return a.roomNumber.localeCompare(b.roomNumber, undefined, {
      numeric: true,
      sensitivity: 'base'
    });
  });

  // Filter travelers by type and gender
  const filterTravelersByTypeAndGender = (type: string, gender: string) => {
    return availableTravelers.filter(
      t => (type === "" || t.type.toLowerCase() === type.toLowerCase()) && 
           (gender === "" || t.gender?.toLowerCase() === gender.toLowerCase())
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className={`fixed inset-0 z-50 bg-background md:static md:block md:z-auto md:w-64 ${isMobileSidebarOpen ? "block" : "hidden"}`}>
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={toggleMobileSidebar} />
        
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Rooming Management</h1>
            <p className="text-muted-foreground">Manage room assignments for group trips</p>
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
                    onClick={() => setIsCreateDialogOpen(true)} 
                    disabled={!selectedGroupId || isLoadingGroups}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Room
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
          
          {selectedGroupId ? (
            <Card>
              <CardHeader>
                <div className="flex flex-col space-y-2">
                  <CardTitle>
                    {isLoadingGroups 
                      ? <Skeleton className="h-6 w-40" /> 
                      : groups?.find(g => g.id.toString() === selectedGroupId) && (
                          <>
                            Room Assignments for {groups.find(g => g.id.toString() === selectedGroupId)?.schoolName}: {groups.find(g => g.id.toString() === selectedGroupId)?.groupName}
                          </>
                        )
                    }
                  </CardTitle>
                  <CardDescription>
                    Manage room assignments and occupants
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All Rooms</TabsTrigger>
                    {roomTypes.map((type) => (
                      <TabsTrigger key={type} value={type} className="capitalize">
                        {type}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                
                {isLoadingRooms ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i}>
                        <CardHeader className="pb-2">
                          <Skeleton className="h-6 w-32 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : sortedRoomingList.length === 0 ? (
                  <div className="text-center py-10">
                    <BedDouble className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {activeTab !== "all" ? "No rooms of this type found" : "No rooms assigned yet"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {activeTab !== "all" 
                        ? `Try creating a room with the type "${activeTab}"`
                        : "Create your first room assignment to get started"
                      }
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Add Room
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedRoomingList.map((room) => (
                      <Card key={room.id} className="overflow-hidden border border-border">
                        <CardHeader className="pb-2 bg-muted/30">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg flex items-center">
                                <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                                Room {room.roomNumber}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant="outline" 
                                  className="capitalize bg-primary/10 text-primary border-primary/20"
                                >
                                  {room.roomType}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className="capitalize bg-muted text-muted-foreground border-muted/50"
                                >
                                  {room.roomOccupancy}
                                </Badge>
                                {room.roomGender && (
                                  <Badge 
                                    variant="outline" 
                                    className={`capitalize ${
                                      room.roomGender.toLowerCase() === 'male' 
                                        ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                        : 'bg-pink-100 text-pink-800 border-pink-200'
                                    }`}
                                  >
                                    {room.roomGender}
                                  </Badge>
                                )}
                              </CardDescription>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(room)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will delete room {room.roomNumber} and remove all occupant assignments.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDelete(room.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Occupant 1:</span>
                              <span className="font-medium">{getTravelerName(room.occupant1Id)}</span>
                            </div>
                            {(room.roomOccupancy === "Double" || room.roomOccupancy === "Triple" || room.roomOccupancy === "Quad") && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Occupant 2:</span>
                                <span className="font-medium">{getTravelerName(room.occupant2Id)}</span>
                              </div>
                            )}
                            {(room.roomOccupancy === "Triple" || room.roomOccupancy === "Quad") && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Occupant 3:</span>
                                <span className="font-medium">{getTravelerName(room.occupant3Id)}</span>
                              </div>
                            )}
                            {room.roomOccupancy === "Quad" && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Occupant 4:</span>
                                <span className="font-medium">{getTravelerName(room.occupant4Id)}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Group Selected</h3>
                <p className="text-muted-foreground mb-4 text-center max-w-md">
                  Please select a group from the dropdown above to manage room assignments
                </p>
                {isLoadingGroups ? (
                  <Skeleton className="h-10 w-40" />
                ) : groups && groups.length === 0 ? (
                  <Button onClick={() => navigate("/groups/new")}>
                    Create a Group First
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
      
      {/* Create Room Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>
              Create a new room assignment for this group.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="roomNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roomType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select room type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Students">Students</SelectItem>
                          <SelectItem value="Chaperone">Chaperone</SelectItem>
                          <SelectItem value="Director">Director</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Travel Agent">Travel Agent</SelectItem>
                          <SelectItem value="Bus Driver">Bus Driver</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="roomOccupancy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Occupancy *</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset occupant values not needed for this occupancy
                          if (value === "Single") {
                            form.setValue("occupant2Id", undefined);
                            form.setValue("occupant3Id", undefined);
                            form.setValue("occupant4Id", undefined);
                          } else if (value === "Double") {
                            form.setValue("occupant3Id", undefined);
                            form.setValue("occupant4Id", undefined);
                          } else if (value === "Triple") {
                            form.setValue("occupant4Id", undefined);
                          }
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select occupancy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="Double">Double</SelectItem>
                          <SelectItem value="Triple">Triple</SelectItem>
                          <SelectItem value="Quad">Quad</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roomGender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Room Occupants</h3>
                
                <FormField
                  control={form.control}
                  name="occupant1Id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupant 1</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select occupant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Not assigned</SelectItem>
                          {availableTravelers.map((traveler) => (
                            <SelectItem key={traveler.id} value={traveler.id.toString()}>
                              {traveler.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {(form.watch("roomOccupancy") === "Double" || 
                  form.watch("roomOccupancy") === "Triple" || 
                  form.watch("roomOccupancy") === "Quad") && (
                  <FormField
                    control={form.control}
                    name="occupant2Id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupant 2</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select occupant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Not assigned</SelectItem>
                            {availableTravelers.map((traveler) => (
                              <SelectItem key={traveler.id} value={traveler.id.toString()}>
                                {traveler.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {(form.watch("roomOccupancy") === "Triple" || 
                  form.watch("roomOccupancy") === "Quad") && (
                  <FormField
                    control={form.control}
                    name="occupant3Id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupant 3</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select occupant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Not assigned</SelectItem>
                            {availableTravelers.map((traveler) => (
                              <SelectItem key={traveler.id} value={traveler.id.toString()}>
                                {traveler.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {form.watch("roomOccupancy") === "Quad" && (
                  <FormField
                    control={form.control}
                    name="occupant4Id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupant 4</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select occupant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Not assigned</SelectItem>
                            {availableTravelers.map((traveler) => (
                              <SelectItem key={traveler.id} value={traveler.id.toString()}>
                                {traveler.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={createRoom.isPending}>
                  {createRoom.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Room"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Room Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>
              Update room {currentRoom?.roomNumber} assignments.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="roomNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="roomType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select room type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Students">Students</SelectItem>
                          <SelectItem value="Chaperone">Chaperone</SelectItem>
                          <SelectItem value="Director">Director</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Travel Agent">Travel Agent</SelectItem>
                          <SelectItem value="Bus Driver">Bus Driver</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="roomOccupancy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Occupancy *</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset occupant values not needed for this occupancy
                          if (value === "Single") {
                            editForm.setValue("occupant2Id", undefined);
                            editForm.setValue("occupant3Id", undefined);
                            editForm.setValue("occupant4Id", undefined);
                          } else if (value === "Double") {
                            editForm.setValue("occupant3Id", undefined);
                            editForm.setValue("occupant4Id", undefined);
                          } else if (value === "Triple") {
                            editForm.setValue("occupant4Id", undefined);
                          }
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select occupancy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="Double">Double</SelectItem>
                          <SelectItem value="Triple">Triple</SelectItem>
                          <SelectItem value="Quad">Quad</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="roomGender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Room Occupants</h3>
                
                <FormField
                  control={editForm.control}
                  name="occupant1Id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupant 1</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select occupant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Not assigned</SelectItem>
                          {availableTravelers.map((traveler) => (
                            <SelectItem key={traveler.id} value={traveler.id.toString()}>
                              {traveler.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {(editForm.watch("roomOccupancy") === "Double" || 
                  editForm.watch("roomOccupancy") === "Triple" || 
                  editForm.watch("roomOccupancy") === "Quad") && (
                  <FormField
                    control={editForm.control}
                    name="occupant2Id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupant 2</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select occupant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Not assigned</SelectItem>
                            {availableTravelers.map((traveler) => (
                              <SelectItem key={traveler.id} value={traveler.id.toString()}>
                                {traveler.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {(editForm.watch("roomOccupancy") === "Triple" || 
                  editForm.watch("roomOccupancy") === "Quad") && (
                  <FormField
                    control={editForm.control}
                    name="occupant3Id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupant 3</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select occupant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Not assigned</SelectItem>
                            {availableTravelers.map((traveler) => (
                              <SelectItem key={traveler.id} value={traveler.id.toString()}>
                                {traveler.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {editForm.watch("roomOccupancy") === "Quad" && (
                  <FormField
                    control={editForm.control}
                    name="occupant4Id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupant 4</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select occupant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Not assigned</SelectItem>
                            {availableTravelers.map((traveler) => (
                              <SelectItem key={traveler.id} value={traveler.id.toString()}>
                                {traveler.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={updateRoom.isPending}>
                  {updateRoom.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Room"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
