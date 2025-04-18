import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { InsertGroup, insertGroupSchema } from "@shared/schema";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Enhance the schema with validation rules
const formSchema = insertGroupSchema.extend({
  schoolName: z.string().min(1, "School name is required"),
  groupName: z.string().min(1, "Group name is required"),
  location: z.string().min(1, "Location is required"),
  startDate: z.coerce.date({
    required_error: "Start date is required",
    invalid_type_error: "Start date is required",
  }),
  endDate: z.coerce.date({
    required_error: "End date is required",
    invalid_type_error: "End date is required",
  }),
  totalTravelers: z.coerce.number().optional(),
  totalBuses: z.coerce.number().optional(),
  director: z.string().optional(),
  directorEmail: z.string().email("Invalid email").optional().or(z.literal("")),
}).refine(
  (data) => !data.endDate || !data.startDate || data.endDate >= data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

export type GroupFormValues = z.infer<typeof formSchema>;

interface GroupFormProps {
  defaultValues?: Partial<GroupFormValues>;
  onSuccess: () => void;
  groupId?: number;
}

export function GroupForm({ defaultValues, onSuccess, groupId }: GroupFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch bus suppliers for the dropdown
  const { data: busSuppliers = [] } = useQuery({
    queryKey: ['/api/bus-suppliers'],
    queryFn: async () => {
      const res = await fetch('/api/bus-suppliers');
      if (!res.ok) throw new Error('Failed to fetch bus suppliers');
      return res.json();
    }
  });
  
  // Initialize the form
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schoolName: "",
      groupName: "",
      location: "",
      startDate: undefined,
      endDate: undefined,
      registrationDate: undefined,
      gmrNumber: "",
      director: "",
      directorEmail: "",
      totalTravelers: 0,
      busSupplier: "",
      totalBuses: 0,
      busCharterNumber: "",
      contractSent: false,
      contractSigned: false,
      planEarsWorkshopRegistered: false,
      insurancePurchased: false,
      moneyCollectionStarted: false,
      ...defaultValues,
    },
  });
  
  // Form submission handler
  const onSubmit = async (data: GroupFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Format dates for the API
      const formattedData = {
        ...data,
        startDate: data.startDate?.toISOString().split('T')[0],
        endDate: data.endDate?.toISOString().split('T')[0],
        registrationDate: data.registrationDate ? data.registrationDate.toISOString().split('T')[0] : null,
      };
      
      if (groupId) {
        // Update existing group
        await apiRequest("PUT", `/api/groups/${groupId}`, formattedData);
        toast({
          title: "Group updated",
          description: "The school group has been updated successfully.",
        });
      } else {
        // Create new group
        await apiRequest("POST", "/api/groups", formattedData);
        toast({
          title: "Group created",
          description: "The new school group has been created successfully.",
        });
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      onSuccess();
      
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save group",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Input placeholder="Band, Choir, Drama, etc." {...field} />
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
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="City, State" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="gmrNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GMR Number</FormLabel>
                <FormControl>
                  <Input placeholder="GMR Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Travel dates section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Travel Start Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                  />
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
                <FormLabel>Travel End Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                  />
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
                <FormLabel>Registration Open Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Director info section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="totalTravelers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Total Travelers</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="director"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Director Name</FormLabel>
                <FormControl>
                  <Input placeholder="Director Name" {...field} />
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
                  <Input type="email" placeholder="director@school.edu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Transportation section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="busSupplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bus Supplier</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a supplier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Select Bus Supplier</SelectItem>
                    {busSuppliers.map((supplier: any) => (
                      <SelectItem key={supplier.id} value={supplier.companyName}>
                        {supplier.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="totalBuses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Buses</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                  />
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
                  <Input placeholder="Charter number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Status checkboxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <FormLabel>PlanEars Workshop Registered</FormLabel>
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
        </div>
        
        {/* Form actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : groupId ? "Update Group" : "Add Group"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
