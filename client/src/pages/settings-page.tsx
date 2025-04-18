import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Switch,
} from "@/components/ui/switch";
import { 
  Laptop, 
  User, 
  Lock, 
  Bell, 
  Mail, 
  Users, 
  Database, 
  HelpCircle,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Profile form schema
const profileFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  role: z.string().optional(),
});

const securityFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const notificationFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  tripUpdates: z.boolean().default(true),
  rosterChanges: z.boolean().default(true),
  paymentReminders: z.boolean().default(true),
});

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logoutMutation } = useAuth();
  
  // Profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      role: user?.role || "",
    },
  });
  
  // Security form
  const securityForm = useForm<z.infer<typeof securityFormSchema>>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Notification form
  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      tripUpdates: true,
      rosterChanges: true,
      paymentReminders: true,
    },
  });
  
  // Form submission handlers
  const onProfileSubmit = (data: z.infer<typeof profileFormSchema>) => {
    console.log("Profile data", data);
    // Handle profile update
  };
  
  const onSecuritySubmit = (data: z.infer<typeof securityFormSchema>) => {
    console.log("Security data", data);
    // Handle password change
  };
  
  const onNotificationSubmit = (data: z.infer<typeof notificationFormSchema>) => {
    console.log("Notification data", data);
    // Handle notification settings
  };
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-heading font-bold text-neutral-900">Settings</h1>
            <p className="text-neutral-600">Manage your account settings and preferences</p>
          </div>
          
          {/* Settings Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-white border border-neutral-200 p-1">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Laptop className="h-4 w-4" />
                <span>Appearance</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Update your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                              <Input {...field} disabled />
                            </FormControl>
                            <FormDescription>
                              Your role cannot be changed. Contact an administrator for assistance.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button type="submit" className="bg-primary-600 hover:bg-primary-700">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Change your password and manage security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...securityForm}>
                    <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                      <FormField
                        control={securityForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormDescription>
                              Password must be at least 8 characters long.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button type="submit" className="bg-primary-600 hover:bg-primary-700">
                          Update Password
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage when and how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                              <FormDescription>
                                Receive email notifications for important updates
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="tripUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Trip Updates</FormLabel>
                              <FormDescription>
                                Receive notifications when trip details are updated
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="rosterChanges"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Roster Changes</FormLabel>
                              <FormDescription>
                                Receive notifications for roster additions and removals
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="paymentReminders"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Payment Reminders</FormLabel>
                              <FormDescription>
                                Receive notifications for payment due dates and reminders
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button type="submit" className="bg-primary-600 hover:bg-primary-700">
                          Save Preferences
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Appearance Tab */}
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize the look and feel of the application
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-10">
                  <div className="text-center">
                    <Laptop className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Appearance settings</h3>
                    <p className="text-neutral-500 mb-4">
                      Appearance customization is not available at this time.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Additional Settings Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Account Management */}
            <Card>
              <CardHeader>
                <CardTitle>Account Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-neutral-500" />
                    <span>User Permissions</span>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-neutral-500" />
                    <span>Data Export</span>
                  </div>
                  <Button variant="outline" size="sm">Export</Button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <LogOut className="h-5 w-5 text-neutral-500" />
                    <span>Logout</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Support and Help */}
            <Card>
              <CardHeader>
                <CardTitle>Support & Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <HelpCircle className="h-5 w-5 text-neutral-500" />
                    <span>Knowledge Base</span>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-neutral-500" />
                    <span>Contact Support</span>
                  </div>
                  <Button variant="outline" size="sm">Email</Button>
                </div>
              </CardContent>
            </Card>
            
            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Version</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Last Updated</span>
                  <span>Today</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Browser</span>
                  <span>{window.navigator.userAgent.split(' ').slice(-1)[0].split('/')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Platform</span>
                  <span>{window.navigator.platform}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
