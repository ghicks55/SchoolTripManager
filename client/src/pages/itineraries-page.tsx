import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Group, Itinerary } from "@shared/schema";
import { format } from "date-fns";

export default function ItinerariesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  
  // Fetch all groups
  const { data: groups = [], isLoading: isLoadingGroups } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });
  
  // Fetch itineraries for selected group
  const { data: itineraries = [], isLoading: isLoadingItineraries } = useQuery<Itinerary[]>({
    queryKey: ['/api/groups', selectedGroupId, 'itineraries'],
    queryFn: async () => {
      if (!selectedGroupId || selectedGroupId === 'none') return [];
      const res = await fetch(`/api/groups/${selectedGroupId}/itineraries`);
      if (!res.ok) throw new Error('Failed to fetch itineraries');
      return res.json();
    },
    enabled: !!selectedGroupId && selectedGroupId !== 'none',
  });
  
  // Get selected group details
  const selectedGroup = groups.find(g => g.id.toString() === selectedGroupId);
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-heading font-bold text-neutral-900">Trip Itineraries</h1>
              <p className="text-neutral-600">Manage day-by-day activities for your trips</p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <Button disabled={!selectedGroupId || selectedGroupId === 'none'} className="bg-primary-600 hover:bg-primary-700">
                <Plus className="h-5 w-5 mr-2" />
                Add Activity
              </Button>
              <Button disabled={!selectedGroupId || selectedGroupId === 'none'} variant="outline">
                <FileText className="h-5 w-5 mr-2" />
                Export Itinerary
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
          
          {/* Itinerary Contents */}
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
                          {" "}({Math.ceil((new Date(selectedGroup.endDate).getTime() - new Date(selectedGroup.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days)
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <span className="text-neutral-600">Trip Director: </span>
                        <span className="font-medium">{selectedGroup.director || "Not assigned"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Day-by-day Itinerary */}
              <div className="space-y-4">
                {isLoadingItineraries ? (
                  <Card>
                    <CardContent className="flex justify-center items-center py-8">
                      <p className="text-neutral-500">Loading itinerary...</p>
                    </CardContent>
                  </Card>
                ) : itineraries.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Calendar className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No itinerary activities yet</h3>
                      <p className="text-neutral-500 mb-4">
                        Start building the itinerary by adding day-by-day activities for this trip.
                      </p>
                      <Button className="bg-primary-600 hover:bg-primary-700">
                        <Plus className="h-5 w-5 mr-2" />
                        Add First Activity
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Create a card for each day */}
                    {[...Array(Math.ceil((new Date(selectedGroup!.endDate).getTime() - new Date(selectedGroup!.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)].map((_, index) => {
                      const day = index + 1;
                      const date = new Date(selectedGroup!.startDate);
                      date.setDate(date.getDate() + index);
                      
                      // Find activities for this day
                      const dayActivities = itineraries.filter(i => i.day === day);
                      
                      return (
                        <Card key={index}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-xl font-medium flex items-center">
                              <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-md mr-3">Day {day}</span>
                              <span>{format(date, "EEEE, MMMM d, yyyy")}</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {dayActivities.length === 0 ? (
                              <div className="bg-neutral-50 rounded-md p-4 text-center">
                                <p className="text-neutral-500">No activities scheduled for this day</p>
                                <Button size="sm" variant="outline" className="mt-2">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Activity
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {dayActivities.map(activity => (
                                  <div key={activity.id} className="bg-neutral-50 rounded-md p-4">
                                    <div className="font-medium">{activity.activity}</div>
                                  </div>
                                ))}
                                <Button size="sm" variant="outline">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Another Activity
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">No Group Selected</h3>
                <p className="text-neutral-500 max-w-md mx-auto">
                  Please select a school group above to view and manage its itinerary.
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
