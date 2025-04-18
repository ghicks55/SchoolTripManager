import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BusSupplier, InsertBusSupplier, insertBusSupplierSchema } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter,
  CardDescription
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Search, Plus, Edit, Trash2, Bus, Info, Phone, Mail, Globe, AlertCircle } from "lucide-react";
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

export default function BusSuppliers() {
  const { toast } = useToast();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<BusSupplier | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: busSuppliers, isLoading } = useQuery<BusSupplier[]>({
    queryKey: ["/api/bus-suppliers"],
  });

  const createBusSupplier = useMutation({
    mutationFn: async (newSupplier: InsertBusSupplier) => {
      const res = await apiRequest("POST", "/api/bus-suppliers", newSupplier);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bus-suppliers"] });
      toast({
        title: "Bus supplier created",
        description: "The bus supplier has been added successfully",
      });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create bus supplier",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBusSupplier = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertBusSupplier> }) => {
      const res = await apiRequest("PUT", `/api/bus-suppliers/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bus-suppliers"] });
      toast({
        title: "Bus supplier updated",
        description: "The bus supplier has been updated successfully",
      });
      setIsEditDialogOpen(false);
      setCurrentSupplier(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update bus supplier",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBusSupplier = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/bus-suppliers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bus-suppliers"] });
      toast({
        title: "Bus supplier deleted",
        description: "The bus supplier has been removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete bus supplier",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Form schema
  const formSchema = insertBusSupplierSchema;
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      companyAddress: "",
      companyWebsite: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      availableBuses: undefined,
    },
  });

  const editForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      companyAddress: "",
      companyWebsite: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      availableBuses: undefined,
    },
  });

  const onSubmit = (data: FormValues) => {
    createBusSupplier.mutate(data);
  };

  const onEdit = (data: FormValues) => {
    if (currentSupplier) {
      updateBusSupplier.mutate({ id: currentSupplier.id, data });
    }
  };

  const handleEdit = (supplier: BusSupplier) => {
    setCurrentSupplier(supplier);
    editForm.reset({
      companyName: supplier.companyName,
      companyAddress: supplier.companyAddress || "",
      companyWebsite: supplier.companyWebsite || "",
      contactName: supplier.contactName || "",
      contactPhone: supplier.contactPhone || "",
      contactEmail: supplier.contactEmail || "",
      availableBuses: supplier.availableBuses,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteBusSupplier.mutate(id);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Already implemented through the filter below
  };

  // Filter bus suppliers based on search query
  const filteredSuppliers = busSuppliers
    ? busSuppliers.filter(supplier => {
        const query = searchQuery.toLowerCase();
        return (
          supplier.companyName.toLowerCase().includes(query) ||
          (supplier.contactName && supplier.contactName.toLowerCase().includes(query)) ||
          (supplier.contactEmail && supplier.contactEmail.toLowerCase().includes(query))
        );
      })
    : [];

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
              <h1 className="text-2xl font-semibold">Bus Suppliers</h1>
              <p className="text-muted-foreground">Manage transportation providers for school trips</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Supplier
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Add New Bus Supplier</DialogTitle>
                  <DialogDescription>
                    Enter the details of the transportation provider.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="companyAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter company address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="companyWebsite"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="availableBuses"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Available Buses</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Number of buses available" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter contact person's name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter contact phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter contact email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <DialogFooter>
                      <Button type="submit" disabled={createBusSupplier.isPending}>
                        {createBusSupplier.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Supplier"
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
                <CardTitle>All Bus Suppliers</CardTitle>
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search suppliers..."
                    className="pl-9 w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : filteredSuppliers.length === 0 ? (
                <div className="text-center py-10">
                  <Bus className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchQuery ? "No suppliers match your search" : "No bus suppliers found"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? "Try a different search term" : "Add your first bus supplier to get started"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Add Supplier
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSuppliers.map((supplier) => (
                    <Card key={supplier.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{supplier.companyName}</CardTitle>
                          <div className="rounded-full bg-primary/10 p-2">
                            <Bus className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <CardDescription>
                          {supplier.availableBuses} {supplier.availableBuses === 1 ? 'bus' : 'buses'} available
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2">
                          {supplier.companyAddress && (
                            <div className="flex items-start text-sm">
                              <Info className="h-4 w-4 text-muted-foreground mr-2 mt-1" />
                              <span>{supplier.companyAddress}</span>
                            </div>
                          )}
                          {supplier.contactName && (
                            <div className="flex items-center text-sm">
                              <div className="flex items-center">
                                <span className="font-medium">{supplier.contactName}</span>
                              </div>
                            </div>
                          )}
                          {supplier.contactPhone && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                              <span>{supplier.contactPhone}</span>
                            </div>
                          )}
                          {supplier.contactEmail && (
                            <div className="flex items-center text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                              <span className="truncate">{supplier.contactEmail}</span>
                            </div>
                          )}
                          {supplier.companyWebsite && (
                            <div className="flex items-center text-sm">
                              <Globe className="h-4 w-4 text-muted-foreground mr-2" />
                              <a 
                                href={supplier.companyWebsite.startsWith('http') ? supplier.companyWebsite : `https://${supplier.companyWebsite}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary truncate hover:underline"
                              >
                                {supplier.companyWebsite.replace(/^https?:\/\//, '')}
                              </a>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(supplier)}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete <span className="font-medium">{supplier.companyName}</span> from your suppliers list.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(supplier.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Bus Supplier</DialogTitle>
            <DialogDescription>
              Update the details of {currentSupplier?.companyName}.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="companyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="companyWebsite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="availableBuses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Buses</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Number of buses available" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact person's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={updateBusSupplier.isPending}>
                  {updateBusSupplier.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Supplier"
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
