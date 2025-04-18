import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Group, Meal, InsertMeal, insertMealSchema } from "@shared/schema";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead,
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { format, parseISO } from "date-fns";
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  FileText, 
  Utensils, 
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

export default function Meals() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentMeal, setCurrentMeal] = useState<Meal | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const { data: groups, isLoading: isLoadingGroups } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
  });

  const { data: meals, isLoading: isLoadingMeals } = useQuery<Meal[]>({
    queryKey: [`/api/groups/${selectedGroupId}/meals`],
    enabled: !!selectedGroupId,
  });

  const createMeal = useMutation({
    mutationFn: async (newMeal: InsertMeal) => {
      const res = await apiRequest("POST", "/api/meals", newMeal);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${selectedGroupId}/meals`] });
      toast({
        title: "Meal plan created",
        description: "The meal plan has been added successfully",
      });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create meal plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMeal = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertMeal> }) => {
      const res = await apiRequest("PUT", `/api/meals/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${selectedGroupId}/meals`] });
      toast({
        title: "Meal plan updated",
        description: "The meal plan has been updated successfully",
      });
      setIsEditDialogOpen(false);
      setCurrentMeal(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update meal plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMeal = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/meals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${selectedGroupId}/meals`] });
      toast({
        title: "Meal plan deleted",
        description: "The meal plan has been removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete meal plan",
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

  // Extended form schema
  const formSchema = insertMealSchema.extend({
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupId: parseInt(selectedGroupId) || 0,
      date: "",
      time: "",
      gmrSubCount: 0,
      turkeySubCount: 0,
      italianSubCount: 0,
      veggieSubCount: 0,
      saladCount: 0,
      notes: "",
    },
  });

  const editForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupId: parseInt(selectedGroupId) || 0,
      date: "",
      time: "",
      gmrSubCount: 0,
      turkeySubCount: 0,
      italianSubCount: 0,
      veggieSubCount: 0,
      saladCount: 0,
      notes: "",
    },
  });

  // Update form default values when selectedGroupId changes
  React.useEffect(() => {
    if (selectedGroupId) {
      form.setValue('groupId', parseInt(selectedGroupId));
    }
  }, [selectedGroupId, form]);

  const onSubmit = (data: FormValues) => {
    const formattedData = {
      ...data,
      date: new Date(data.date),
    };
    createMeal.mutate(formattedData);
  };

  const onEdit = (data: FormValues) => {
    if (currentMeal) {
      const formattedData = {
        ...data,
        date: new Date(data.date),
      };
      updateMeal.mutate({ id: currentMeal.id, data: formattedData });
    }
  };

  const handleEdit = (meal: Meal) => {
    setCurrentMeal(meal);
    editForm.reset({
      groupId: meal.groupId,
      date: format(new Date(meal.date), "yyyy-MM-dd"),
      time: meal.time,
      gmrSubCount: meal.gmrSubCount || 0,
      turkeySubCount: meal.turkeySubCount || 0,
      italianSubCount: meal.italianSubCount || 0,
      veggieSubCount: meal.veggieSubCount || 0,
      saladCount: meal.saladCount || 0,
      notes: meal.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMeal.mutate(id);
  };

  const getTotalMealCount = (meal: Meal) => {
    return (
      (meal.gmrSubCount || 0) +
      (meal.turkeySubCount || 0) +
      (meal.italianSubCount || 0) +
      (meal.veggieSubCount || 0) +
      (meal.saladCount || 0)
    );
  };

  // Sort meals by date
  const sortedMeals = meals
    ? [...meals].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  return (
    <div className="flex h-screen overflow-hidden">
      <div className={`fixed inset-0 z-50 bg-background md:static md:block md:z-auto md:w-64 ${isMobileSidebarOpen ? "block" : "hidden"}`}>
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={toggleMobileSidebar} />
        
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Meal Management</h1>
            <p className="text-muted-foreground">Manage meal plans for group trips</p>
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
                    <Plus className="mr-2 h-4 w-4" /> Add Meal Plan
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
          
          {selectedGroupId ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isLoadingGroups 
                    ? <Skeleton className="h-6 w-40" /> 
                    : groups?.find(g => g.id.toString() === selectedGroupId) && (
                        <>
                          Meal Plans for {groups.find(g => g.id.toString() === selectedGroupId)?.schoolName}: {groups.find(g => g.id.toString() === selectedGroupId)?.groupName}
                        </>
                      )
                  }
                </CardTitle>
                <CardDescription>
                  Track meal requirements for each day of the trip
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingMeals ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : sortedMeals.length === 0 ? (
                  <div className="text-center py-10">
                    <Utensils className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No meal plans found</h3>
                    <p className="text-muted-foreground mb-4">Add your first meal plan to track food requirements</p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Add Meal Plan
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>GMR Subs</TableHead>
                          <TableHead>Turkey Subs</TableHead>
                          <TableHead>Italian Subs</TableHead>
                          <TableHead>Veggie Subs</TableHead>
                          <TableHead>Salads</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedMeals.map((meal) => (
                          <TableRow key={meal.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                {format(new Date(meal.date), "MMM d, yyyy")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                {meal.time}
                              </div>
                            </TableCell>
                            <TableCell>{meal.gmrSubCount || 0}</TableCell>
                            <TableCell>{meal.turkeySubCount || 0}</TableCell>
                            <TableCell>{meal.italianSubCount || 0}</TableCell>
                            <TableCell>{meal.veggieSubCount || 0}</TableCell>
                            <TableCell>{meal.saladCount || 0}</TableCell>
                            <TableCell>
                              <span className="font-medium">{getTotalMealCount(meal)}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(meal)}>
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
                                        This will permanently delete the meal plan for {format(new Date(meal.date), "MMMM d, yyyy")}.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDelete(meal.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
                  Please select a group from the dropdown above to manage meal plans
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
      
      {/* Create Meal Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Meal Plan</DialogTitle>
            <DialogDescription>
              Create a meal plan for a specific date and time.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 12:30 PM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <FormField
                  control={form.control}
                  name="gmrSubCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GMR Subs</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="turkeySubCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Turkey Subs</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="italianSubCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Italian Subs</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="veggieSubCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Veggie Subs</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="saladCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salads</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any special instructions or dietary requirements"
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={createMeal.isPending}>
                  {createMeal.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Meal Plan"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Meal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Meal Plan</DialogTitle>
            <DialogDescription>
              Update the meal plan details.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 12:30 PM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <FormField
                  control={editForm.control}
                  name="gmrSubCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GMR Subs</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="turkeySubCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Turkey Subs</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="italianSubCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Italian Subs</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="veggieSubCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Veggie Subs</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="saladCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salads</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any special instructions or dietary requirements"
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={updateMeal.isPending}>
                  {updateMeal.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Meal Plan"
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
