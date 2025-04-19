import { useState } from "react";
import { format } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Group, InsertGroup } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { School, Plus, Search, Calendar, MapPin, Users, Trash2, Edit, Download } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

// Create schema for the group form
const groupFormSchema = z.object({
  schoolName: z.string().min(2, { message: "School name must be at least 2 characters" }),
  groupName: z.string().min(2, { message: "Group name must be at least 2 characters" }),
  location: z.string().min(2, { message: "Location must be at least 2 characters" }),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().min(1, { message: "End date is required" }),
  registrationDate: z.string().optional(),
  gmrNumber: z.string().optional(),
  director: z.string().optional(),
  directorEmail: z.string().email({ message: "Invalid email" }).optional().or(z.literal("")),
  totalTravelers: z.coerce.number().int().optional(),
  busSupplier: z.string().optional(),
  totalBuses: z.coerce.number().int().optional(),
  busCharterNumber: z.string().optional(),
  busCost: z.coerce.number().optional(),
  busDepositPaidDate: z.string().optional(),
  busDepositAmount: z.coerce.number().optional(),
  contractSent: z.boolean().optional(),
  contractSigned: z.boolean().optional(),
  planEarsWorkshopRegistered: z.boolean().optional(),
  insurancePurchased: z.boolean().optional(),
  moneyCollectionStarted: z.boolean().optional(),
});

type GroupFormValues = z.infer<typeof groupFormSchema>;

export default function GroupsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isNewGroupDialogOpen, setIsNewGroupDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch all groups
  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });

  // Create new group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (newGroup: GroupFormValues) => {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGroup),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create group');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      setIsNewGroupDialogOpen(false);
      toast({
        title: "Success",
        description: "School group was created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete group');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      toast({
        title: "Success",
        description: "School group was deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form for creating a new group
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      schoolName: "",
      groupName: "",
      location: "",
      startDate: "",
      endDate: "",
      registrationDate: "",
      gmrNumber: "",
      director: "",
      directorEmail: "",
      totalTravelers: undefined,
      busSupplier: "",
      totalBuses: undefined,
      busCharterNumber: "",
      busCost: undefined,
      busDepositPaidDate: "",
      busDepositAmount: undefined,
      contractSent: false,
      contractSigned: false,
      planEarsWorkshopRegistered: false,
      insurancePurchased: false,
      moneyCollectionStarted: false,
    },
  });

  // Handle form submission
  const onSubmit = (data: GroupFormValues) => {
    createGroupMutation.mutate(data);
  };

  // Filter groups based on search text
  const filteredGroups = groups.filter(group => {
    return (
      group.schoolName.toLowerCase().includes(searchText.toLowerCase()) ||
      group.groupName.toLowerCase().includes(searchText.toLowerCase()) ||
      group.location.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  // Delete group confirmation
  const handleDeleteGroup = (groupId: number) => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      deleteGroupMutation.mutate(groupId);
    }
  };

  // Get upcoming trips (those starting in the future)
  const upcomingTrips = groups.filter(group => new Date(group.startDate) > new Date());
  // Get active trips (those currently in progress)
  const activeTrips = groups.filter(group => {
    const today = new Date();
    return new Date(group.startDate) <= today && new Date(group.endDate) >= today;
  });
  // Get completed trips (those that have ended)
  const completedTrips = groups.filter(group => new Date(group.endDate) < new Date());

  const getStatusBadge = (group: Group) => {
    const today = new Date();
    const startDate = new Date(group.startDate);
    const endDate = new Date(group.endDate);
    
    if (startDate > today) {
      return <Badge className="bg-blue-500 hover:bg-blue-600">Upcoming</Badge>;
    } else if (endDate < today) {
      return <Badge className="bg-neutral-500 hover:bg-neutral-600">Completed</Badge>;
    } else {
      return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
    }
  };

  const formatDateRange = (startDate: string | Date, endDate: string | Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
  };

  const calculateDuration = (startDate: string | Date, endDate: string | Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-heading font-bold text-neutral-900">School Groups</h1>
              <p className="text-neutral-600">Manage your school groups and trips</p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <Dialog open={isNewGroupDialogOpen} onOpenChange={setIsNewGroupDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary-600 hover:bg-primary-700">
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px]">
                  <DialogHeader>
                    <DialogTitle>Create New School Group</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Basic Information */}
                        <div>
                          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="schoolName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>School Name*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter school name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="groupName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Group Name*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter group name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Destination*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter trip destination" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Start Date*</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>End Date*</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Contact Information */}
                        <div>
                          <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="director"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Director Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter director's name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="directorEmail"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Director Email</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="Enter director's email" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="totalTravelers"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Total Travelers</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="Enter total number of travelers" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="registrationDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Registration Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Administration Information */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Administration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="gmrNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>GMR Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter GMR number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="contractSent"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Contract Sent</FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="contractSigned"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Contract Signed</FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <FormField
                            control={form.control}
                            name="planEarsWorkshopRegistered"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Plan EARS Workshop</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="insurancePurchased"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Insurance Purchased</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="moneyCollectionStarted"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Money Collection Started</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      {/* Transportation Information */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Transportation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="busSupplier"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bus Supplier</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter bus supplier name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="totalBuses"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Total Buses</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="Enter number of buses" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="busCharterNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bus Charter Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter bus charter number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="busCost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bus Cost</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" placeholder="Enter bus cost" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="busDepositPaidDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bus Deposit Paid Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="busDepositAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bus Deposit Amount</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" placeholder="Enter deposit amount" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button type="submit" className="bg-primary-600 hover:bg-primary-700" disabled={createGroupMutation.isPending}>
                          {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline">
                <Download className="h-5 w-5 mr-2" />
                Export Groups
              </Button>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                type="search"
                placeholder="Search groups..."
                className="pl-8"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
          
          {/* Group Tabs */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all" className="flex items-center">
                <School className="h-4 w-4 mr-2" />
                All Groups
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Active Trips ({activeTrips.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Upcoming Trips ({upcomingTrips.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center">
                <Trash2 className="h-4 w-4 mr-2" />
                Completed Trips ({completedTrips.length})
              </TabsTrigger>
            </TabsList>
            
            {/* All Groups Tab */}
            <TabsContent value="all">
              {isLoading ? (
                <div className="text-center py-8 text-neutral-500">Loading groups...</div>
              ) : filteredGroups.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <School className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Groups Found</h3>
                    <p className="text-neutral-500 max-w-md mx-auto mb-6">
                      {searchText ? 
                        "No groups match your search criteria. Try a different search term." : 
                        "You haven't created any school groups yet. Create your first group to get started."}
                    </p>
                    <Button 
                      className="bg-primary-600 hover:bg-primary-700"
                      onClick={() => setIsNewGroupDialogOpen(true)}
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add New Group
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredGroups.map((group) => (
                    <Card key={group.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{group.schoolName}</h3>
                            <p className="text-neutral-600">{group.groupName}</p>
                          </div>
                          {getStatusBadge(group)}
                        </div>
                        
                        <div className="space-y-2 mt-4">
                          <div className="flex items-start">
                            <Calendar className="h-4 w-4 text-neutral-500 mt-0.5 mr-2" />
                            <div>
                              <div className="text-sm font-medium">
                                {formatDateRange(group.startDate, group.endDate)}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {calculateDuration(group.startDate, group.endDate)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 text-neutral-500 mt-0.5 mr-2" />
                            <div className="text-sm">{group.location}</div>
                          </div>
                          
                          {group.totalTravelers && (
                            <div className="flex items-start">
                              <Users className="h-4 w-4 text-neutral-500 mt-0.5 mr-2" />
                              <div className="text-sm">{group.totalTravelers} travelers</div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-between mt-6">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/group-details/${group.id}`}>View Details</a>
                          </Button>
                          
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-neutral-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500"
                              onClick={() => handleDeleteGroup(group.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Active Trips Tab */}
            <TabsContent value="active">
              {activeTrips.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Active Trips</h3>
                    <p className="text-neutral-500 max-w-md mx-auto">
                      There are currently no active trips. Active trips will appear here when they are in progress.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeTrips.map((group) => (
                    <Card key={group.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{group.schoolName}</h3>
                            <p className="text-neutral-600">{group.groupName}</p>
                          </div>
                          {getStatusBadge(group)}
                        </div>
                        
                        <div className="space-y-2 mt-4">
                          <div className="flex items-start">
                            <Calendar className="h-4 w-4 text-neutral-500 mt-0.5 mr-2" />
                            <div>
                              <div className="text-sm font-medium">
                                {formatDateRange(group.startDate, group.endDate)}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {calculateDuration(group.startDate, group.endDate)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 text-neutral-500 mt-0.5 mr-2" />
                            <div className="text-sm">{group.location}</div>
                          </div>
                          
                          {group.totalTravelers && (
                            <div className="flex items-start">
                              <Users className="h-4 w-4 text-neutral-500 mt-0.5 mr-2" />
                              <div className="text-sm">{group.totalTravelers} travelers</div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-between mt-6">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/group-details/${group.id}`}>View Details</a>
                          </Button>
                          
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-neutral-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500"
                              onClick={() => handleDeleteGroup(group.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Upcoming Trips Tab */}
            <TabsContent value="upcoming">
              {upcomingTrips.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Upcoming Trips</h3>
                    <p className="text-neutral-500 max-w-md mx-auto">
                      There are currently no upcoming trips scheduled. Create a new group with future dates to see it here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingTrips.map((group) => (
                    <Card key={group.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{group.schoolName}</h3>
                            <p className="text-neutral-600">{group.groupName}</p>
                          </div>
                          {getStatusBadge(group)}
                        </div>
                        
                        <div className="space-y-2 mt-4">
                          <div className="flex items-start">
                            <Calendar className="h-4 w-4 text-neutral-500 mt-0.5 mr-2" />
                            <div>
                              <div className="text-sm font-medium">
                                {formatDateRange(group.startDate, group.endDate)}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {calculateDuration(group.startDate, group.endDate)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 text-neutral-500 mt-0.5 mr-2" />
                            <div className="text-sm">{group.location}</div>
                          </div>
                          
                          {group.totalTravelers && (
                            <div className="flex items-start">
                              <Users className="h-4 w-4 text-neutral-500 mt-0.5 mr-2" />
                              <div className="text-sm">{group.totalTravelers} travelers</div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-between mt-6">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/group-details/${group.id}`}>View Details</a>
                          </Button>
                          
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-neutral-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500"
                              onClick={() => handleDeleteGroup(group.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Completed Trips Tab */}
            <TabsContent value="completed">
              {completedTrips.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Trash2 className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Completed Trips</h3>
                    <p className="text-neutral-500 max-w-md mx-auto">
                      There are currently no completed trips. Trips will appear here once their end date has passed.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedTrips.map((group) => (
                    <Card key={group.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{group.schoolName}</h3>
                            <p className="text-neutral-600">{group.groupName}</p>
                          </div>
                          {getStatusBadge(group)}
                        </div>
                        
                        <div className="space-y-2 mt-4">
                          <div className="flex items-start">
                            <Calendar className="h-4 w-4 text-neutral-500 mt-0.5 mr-2" />
                            <div>
                              <div className="text-sm font-medium">
                                {formatDateRange(group.startDate, group.endDate)}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {calculateDuration(group.startDate, group.endDate)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 text-neutral-500 mt-0.5 mr-2" />
                            <div className="text-sm">{group.location}</div>
                          </div>
                          
                          {group.totalTravelers && (
                            <div className="flex items-start">
                              <Users className="h-4 w-4 text-neutral-500 mt-0.5 mr-2" />
                              <div className="text-sm">{group.totalTravelers} travelers</div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-between mt-6">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/group-details/${group.id}`}>View Details</a>
                          </Button>
                          
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-neutral-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500"
                              onClick={() => handleDeleteGroup(group.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}