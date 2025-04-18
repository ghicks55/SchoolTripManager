import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead,
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Group, InsertGroup, insertGroupSchema } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Loader2, Search, Plus, Edit, Eye, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export default function Groups() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: groups, isLoading: isLoadingGroups } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
  });

  const { data: busSuppliers, isLoading: isLoadingBusSuppliers } = useQuery<any[]>({
    queryKey: ["/api/bus-suppliers"],
  });

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const createGroup = useMutation({
    mutationFn: async (newGroup: InsertGroup) => {
      const res = await apiRequest("POST", "/api/groups", newGroup);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Group created",
        description: "The group has been created successfully",
      });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create group",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Extended schema for form validation
  const formSchema = insertGroupSchema.extend({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    openRegistrationDate: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schoolName: "",
      groupName: "",
      location: "",
      startDate: "",
      endDate: "",
      openRegistrationDate: "",
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
      status: "pending",
    },
  });

  const onSubmit = (data: FormValues) => {
    // Convert string dates to Date objects for backend processing
    const formattedData = {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      openRegistrationDate: data.openRegistrationDate ? new Date(data.openRegistrationDate) : undefined,
      busDepositPaidDate: data.busDepositPaidDate ? new Date(data.busDepositPaidDate) : undefined,
    };
    
    createGroup.mutate(formattedData);
  };

  // Filter and paginate groups
  const filteredGroups = groups
    ? groups.filter(group => {
        const query = searchQuery.toLowerCase();
        return (
          group.schoolName.toLowerCase().includes(query) ||
          group.groupName.toLowerCase().includes(query) ||
          group.location.toLowerCase().includes(query) ||
          group.director?.toLowerCase().includes(query)
        );
      })
    : [];

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    // Sort by start date (newest first)
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  const pageCount = Math.ceil(sortedGroups.length / itemsPerPage);
  const paginatedGroups = sortedGroups.slice(
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
    <div className="flex h-screen overflow-hidden">
      <div className={`fixed inset-0 z-50 bg-background md:static md:block md:z-auto md:w-64 ${isMobileSidebarOpen ? "block" : "hidden"}`}>
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={toggleMobileSidebar} />
        
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Groups</h1>
              <p className="text-muted-foreground">Manage all school groups and trips</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Group
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>
                    Enter the group details to create a new school trip.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="schoolName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>School Name</FormLabel>
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
                            <FormLabel>Group Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter group name (e.g., Band)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter destination" {...field} />
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
                            <FormLabel>Start Date</FormLabel>
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
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="director"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Director</FormLabel>
                            <FormControl>
                              <Input placeholder="Director name" {...field} />
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
                              <Input placeholder="Director email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="busSupplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bus Supplier</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select bus supplier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingBusSuppliers ? (
                                <SelectItem value="loading" disabled>Loading suppliers...</SelectItem>
                              ) : busSuppliers && busSuppliers.length > 0 ? (
                                busSuppliers.map((supplier) => (
                                  <SelectItem key={supplier.id} value={supplier.companyName}>
                                    {supplier.companyName}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="none" disabled>No suppliers available</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit" disabled={createGroup.isPending}>
                        {createGroup.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Group"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>All Groups</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search groups..."
                    className="pl-9 w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingGroups ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>School Name</TableHead>
                        <TableHead>Group Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Travel Dates</TableHead>
                        <TableHead>Director</TableHead>
                        <TableHead>Travelers</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedGroups.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                            {searchQuery ? "No groups match your search" : "No groups found"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedGroups.map((group) => (
                          <TableRow key={group.id}>
                            <TableCell>{group.schoolName}</TableCell>
                            <TableCell>{group.groupName}</TableCell>
                            <TableCell>{group.location}</TableCell>
                            <TableCell>
                              {format(new Date(group.startDate), "MMM d")}
                              {new Date(group.startDate).toDateString() !== new Date(group.endDate).toDateString() 
                                ? ` - ${format(new Date(group.endDate), "MMM d, yyyy")}`
                                : `, ${format(new Date(group.startDate), "yyyy")}`
                              }
                            </TableCell>
                            <TableCell>{group.director || "Not assigned"}</TableCell>
                            <TableCell>{group.totalTravelers || 0}</TableCell>
                            <TableCell>{getStatusBadge(group.status)}</TableCell>
                            <TableCell>
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
                                    <DropdownMenuItem onClick={() => navigate(`/groups/${group.id}/roster`)}>
                                      View Roster
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate(`/groups/${group.id}/itinerary`)}>
                                      View Itinerary
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate(`/groups/${group.id}/rooming`)}>
                                      Manage Rooming
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  
                  {pageCount > 1 && (
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
                        {Array.from({ length: Math.min(pageCount, 5) }).map((_, i) => {
                          let pageNumber;
                          
                          if (pageCount <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= pageCount - 2) {
                            pageNumber = pageCount - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
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
                          disabled={currentPage === pageCount}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
