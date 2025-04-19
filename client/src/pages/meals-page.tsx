import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, Calendar, Clock, PieChart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Group, Lunch } from "@shared/schema";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function MealsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  
  // Fetch all groups
  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });
  
  // Fetch lunch data for selected group
  const { data: lunches = [], isLoading: isLoadingLunches } = useQuery<Lunch[]>({
    queryKey: ['/api/groups', selectedGroupId, 'lunches'],
    queryFn: async () => {
      if (!selectedGroupId || selectedGroupId === 'none') return [];
      const res = await fetch(`/api/groups/${selectedGroupId}/lunches`);
      if (!res.ok) throw new Error('Failed to fetch lunches');
      return res.json();
    },
    enabled: !!selectedGroupId && selectedGroupId !== 'none',
  });
  
  // Get selected group details
  const selectedGroup = groups.find(g => g.id.toString() === selectedGroupId);
  
  // Get total meal counts
  let totalMeals = 0;
  let gmrSubTotal = 0;
  let turkeySubTotal = 0;
  let italianSubTotal = 0;
  let veggieSubTotal = 0;
  let saladTotal = 0;
  
  if (lunches.length > 0) {
    const lunch = lunches[0]; // Assuming one lunch record per group
    gmrSubTotal = lunch.gmrSubTotal || 0;
    turkeySubTotal = lunch.turkeySubTotal || 0;
    italianSubTotal = lunch.italianSubTotal || 0;
    veggieSubTotal = lunch.veggieSubTotal || 0;
    saladTotal = lunch.saladTotal || 0;
    totalMeals = gmrSubTotal + turkeySubTotal + italianSubTotal + veggieSubTotal + saladTotal;
  }
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-heading font-bold text-neutral-900">Meal Planning</h1>
              <p className="text-neutral-600">Manage meals for your school trips</p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button disabled={!selectedGroupId || selectedGroupId === 'none'} className="bg-primary-600 hover:bg-primary-700">
                    <Plus className="h-5 w-5 mr-2" />
                    Update Meal Counts
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Update Meal Counts</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor="gmr-sub" className="text-sm font-medium text-neutral-700 block mb-1">
                          GMR Sub
                        </label>
                        <Input
                          id="gmr-sub"
                          type="number"
                          defaultValue={gmrSubTotal}
                        />
                      </div>
                      <div>
                        <label htmlFor="turkey-sub" className="text-sm font-medium text-neutral-700 block mb-1">
                          Turkey Sub
                        </label>
                        <Input
                          id="turkey-sub"
                          type="number"
                          defaultValue={turkeySubTotal}
                        />
                      </div>
                      <div>
                        <label htmlFor="italian-sub" className="text-sm font-medium text-neutral-700 block mb-1">
                          Italian Sub
                        </label>
                        <Input
                          id="italian-sub"
                          type="number"
                          defaultValue={italianSubTotal}
                        />
                      </div>
                      <div>
                        <label htmlFor="veggie-sub" className="text-sm font-medium text-neutral-700 block mb-1">
                          Veggie Sub
                        </label>
                        <Input
                          id="veggie-sub"
                          type="number"
                          defaultValue={veggieSubTotal}
                        />
                      </div>
                      <div>
                        <label htmlFor="salad" className="text-sm font-medium text-neutral-700 block mb-1">
                          Salad
                        </label>
                        <Input
                          id="salad"
                          type="number"
                          defaultValue={saladTotal}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="date-needed" className="text-sm font-medium text-neutral-700 block mb-1">
                            Date Needed
                          </label>
                          <Input
                            id="date-needed"
                            type="date"
                            defaultValue={lunches[0]?.dateNeeded ? new Date(lunches[0].dateNeeded).toISOString().split('T')[0] : ""}
                          />
                        </div>
                        <div>
                          <label htmlFor="time-needed" className="text-sm font-medium text-neutral-700 block mb-1">
                            Time Needed
                          </label>
                          <Input
                            id="time-needed"
                            type="time"
                            defaultValue={lunches[0]?.timeNeeded || ""}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <DialogTrigger asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogTrigger>
                    <Button className="bg-primary-600 hover:bg-primary-700">Update Meals</Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button disabled={!selectedGroupId || selectedGroupId === 'none'} variant="outline">
                <BookOpen className="h-5 w-5 mr-2" />
                Export Meal Plan
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
          
          {/* Meal Contents */}
          {selectedGroupId && selectedGroupId !== 'none' ? (
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
                      <div className="mt-4 md:mt-0">
                        <span className="text-neutral-600">Total Travelers: </span>
                        <span className="font-medium">{selectedGroup.totalTravelers || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Meal Summary */}
              {isLoadingLunches ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-neutral-500">Loading meal information...</p>
                  </CardContent>
                </Card>
              ) : lunches.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Meal Information</h3>
                    <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                      No meal counts have been recorded for this trip yet. Add meal information to start planning.
                    </p>
                    <Button className="bg-primary-600 hover:bg-primary-700">
                      <Plus className="h-5 w-5 mr-2" />
                      Add Meal Information
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Meal Summary Card */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Meal Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col space-y-4">
                          <div className="bg-neutral-50 p-4 rounded-lg">
                            <div className="text-neutral-500 text-sm mb-1">GMR Sub</div>
                            <div className="text-2xl font-semibold">{gmrSubTotal}</div>
                          </div>
                          <div className="bg-neutral-50 p-4 rounded-lg">
                            <div className="text-neutral-500 text-sm mb-1">Turkey Sub</div>
                            <div className="text-2xl font-semibold">{turkeySubTotal}</div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-4">
                          <div className="bg-neutral-50 p-4 rounded-lg">
                            <div className="text-neutral-500 text-sm mb-1">Italian Sub</div>
                            <div className="text-2xl font-semibold">{italianSubTotal}</div>
                          </div>
                          <div className="bg-neutral-50 p-4 rounded-lg">
                            <div className="text-neutral-500 text-sm mb-1">Veggie Sub</div>
                            <div className="text-2xl font-semibold">{veggieSubTotal}</div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-4">
                          <div className="bg-neutral-50 p-4 rounded-lg">
                            <div className="text-neutral-500 text-sm mb-1">Salad</div>
                            <div className="text-2xl font-semibold">{saladTotal}</div>
                          </div>
                          <div className="bg-primary-50 p-4 rounded-lg">
                            <div className="text-primary-600 text-sm mb-1">Total Meals</div>
                            <div className="text-2xl font-semibold text-primary-700">{totalMeals}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Delivery Info Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Delivery Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <Calendar className="h-5 w-5 mr-3 text-neutral-500" />
                          <div>
                            <div className="text-sm text-neutral-500 mb-1">Date Needed</div>
                            <div className="font-medium">
                              {lunches[0]?.dateNeeded 
                                ? format(new Date(lunches[0].dateNeeded), "MMMM d, yyyy")
                                : "Not specified"
                              }
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Clock className="h-5 w-5 mr-3 text-neutral-500" />
                          <div>
                            <div className="text-sm text-neutral-500 mb-1">Time Needed</div>
                            <div className="font-medium">
                              {lunches[0]?.timeNeeded || "Not specified"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <PieChart className="h-5 w-5 mr-3 text-neutral-500" />
                          <div>
                            <div className="text-sm text-neutral-500 mb-1">Special Dietary Needs</div>
                            <div className="font-medium">
                              None specified
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6">
                        <Button variant="outline" className="w-full">
                          Edit Delivery Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">No Group Selected</h3>
                <p className="text-neutral-500 max-w-md mx-auto">
                  Please select a school group above to view and manage its meal planning information.
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
