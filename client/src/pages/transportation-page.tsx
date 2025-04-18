import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TruckIcon, Plus, Search, PenTool, Bus, Building, Phone, Mail, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BusSupplier, Group } from "@shared/schema";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function TransportationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchText, setSearchText] = useState("");
  
  // Fetch bus suppliers
  const { data: busSuppliers = [], isLoading: isLoadingSuppliers } = useQuery<BusSupplier[]>({
    queryKey: ['/api/bus-suppliers'],
  });
  
  // Fetch all groups to show transportation assignments
  const { data: groups = [], isLoading: isLoadingGroups } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });
  
  // Filter bus suppliers based on search
  const filteredSuppliers = busSuppliers.filter(supplier => {
    return !searchText || 
      supplier.companyName.toLowerCase().includes(searchText.toLowerCase()) ||
      (supplier.contactName && supplier.contactName.toLowerCase().includes(searchText.toLowerCase()));
  });
  
  // Filter groups with bus assignments
  const groupsWithBuses = groups.filter(group => group.busSupplier && group.totalBuses);
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-heading font-bold text-neutral-900">Transportation</h1>
              <p className="text-neutral-600">Manage bus suppliers and trip transportation</p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-primary-600 hover:bg-primary-700">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Bus Supplier
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add New Bus Supplier</DialogTitle>
                    <DialogDescription>
                      Enter the details of the bus supplier company.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor="company-name" className="text-sm font-medium text-neutral-700 block mb-1">
                          Company Name
                        </label>
                        <Input
                          id="company-name"
                          placeholder="Enter company name"
                        />
                      </div>
                      <div>
                        <label htmlFor="company-address" className="text-sm font-medium text-neutral-700 block mb-1">
                          Company Address
                        </label>
                        <Input
                          id="company-address"
                          placeholder="Enter company address"
                        />
                      </div>
                      <div>
                        <label htmlFor="company-website" className="text-sm font-medium text-neutral-700 block mb-1">
                          Company Website
                        </label>
                        <Input
                          id="company-website"
                          placeholder="https://www.example.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-name" className="text-sm font-medium text-neutral-700 block mb-1">
                          Contact Name
                        </label>
                        <Input
                          id="contact-name"
                          placeholder="Enter contact name"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-phone" className="text-sm font-medium text-neutral-700 block mb-1">
                          Contact Phone
                        </label>
                        <Input
                          id="contact-phone"
                          placeholder="(123) 456-7890"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="text-sm font-medium text-neutral-700 block mb-1">
                        Contact Email
                      </label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="contact@example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="total-buses" className="text-sm font-medium text-neutral-700 block mb-1">
                        Total Buses Available
                      </label>
                      <Input
                        id="total-buses"
                        type="number"
                        placeholder="Enter number of buses"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <DialogTrigger asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogTrigger>
                    <Button className="bg-primary-600 hover:bg-primary-700">Add Supplier</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Transportation Tabs */}
          <Tabs defaultValue="suppliers" className="space-y-4">
            <TabsList>
              <TabsTrigger value="suppliers" className="flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Bus Suppliers
              </TabsTrigger>
              <TabsTrigger value="assignments" className="flex items-center">
                <Bus className="h-4 w-4 mr-2" />
                Trip Assignments
              </TabsTrigger>
            </TabsList>
            
            {/* Bus Suppliers Tab */}
            <TabsContent value="suppliers">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                      <Input
                        type="search"
                        placeholder="Search suppliers..."
                        className="pl-8"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingSuppliers ? (
                    <div className="text-center py-8 text-neutral-500">Loading bus suppliers...</div>
                  ) : filteredSuppliers.length === 0 ? (
                    <div className="text-center py-8">
                      <TruckIcon className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No bus suppliers found</h3>
                      <p className="text-neutral-500 mb-4">
                        {searchText 
                          ? "No suppliers match your search criteria." 
                          : "You haven't added any bus suppliers yet."}
                      </p>
                      <Button className="bg-primary-600 hover:bg-primary-700">
                        <Plus className="h-5 w-5 mr-2" />
                        Add Bus Supplier
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredSuppliers.map((supplier) => (
                        <Card key={supplier.id} className="border-2 border-neutral-200">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold text-lg">{supplier.companyName}</h3>
                                <p className="text-neutral-500 text-sm">{supplier.companyAddress || "No address provided"}</p>
                              </div>
                              <Button variant="ghost" size="sm" className="text-neutral-500">
                                <PenTool className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {supplier.contactName && (
                                <div className="flex items-center text-sm">
                                  <Phone className="h-4 w-4 mr-2 text-neutral-500" />
                                  <span>{supplier.contactPhone || "No phone provided"}</span>
                                </div>
                              )}
                              {supplier.contactEmail && (
                                <div className="flex items-center text-sm">
                                  <Mail className="h-4 w-4 mr-2 text-neutral-500" />
                                  <span className="text-primary-600">{supplier.contactEmail}</span>
                                </div>
                              )}
                              {supplier.companyWebsite && (
                                <div className="flex items-center text-sm">
                                  <Globe className="h-4 w-4 mr-2 text-neutral-500" />
                                  <a href={supplier.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                    Website
                                  </a>
                                </div>
                              )}
                              <div className="flex items-center text-sm pt-2 border-t border-neutral-200 mt-2">
                                <Bus className="h-4 w-4 mr-2 text-neutral-500" />
                                <span>{supplier.totalBusesAvailable || 0} buses available</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Trip Assignments Tab */}
            <TabsContent value="assignments">
              <Card>
                <CardContent className="pt-6">
                  {isLoadingGroups ? (
                    <div className="text-center py-8 text-neutral-500">Loading transportation assignments...</div>
                  ) : groupsWithBuses.length === 0 ? (
                    <div className="text-center py-8">
                      <Bus className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No transportation assignments</h3>
                      <p className="text-neutral-500 mb-4">
                        No trips have been assigned transportation yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              School & Group
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Travel Dates
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Bus Supplier
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Total Buses
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Charter Number
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Cost
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                          {groupsWithBuses.map((group) => (
                            <tr key={group.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-neutral-900">{group.schoolName}</div>
                                <div className="text-sm text-neutral-500">{group.groupName}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-neutral-900">
                                  {format(new Date(group.startDate), "MMM d")} - {format(new Date(group.endDate), "MMM d, yyyy")}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                {group.busSupplier}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                {group.totalBuses}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                {group.busCharterNumber || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                {group.busCost 
                                  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(group.busCost))
                                  : "Not specified"
                                }
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                                <Button variant="ghost" size="sm">Edit</Button>
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
        </main>
      </div>
    </div>
  );
}
