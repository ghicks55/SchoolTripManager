import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useQuery } from "@tanstack/react-query";
import { Group, Itinerary } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Plus, Calendar } from "lucide-react";

export default function Itineraries() {
  const [, navigate] = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  
  const { data: groups, isLoading: isLoadingGroups } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
  });
  
  const { data: itineraries, isLoading: isLoadingItineraries } = useQuery<Itinerary[]>({
    queryKey: [`/api/groups/${selectedGroupId}/itineraries`],
    enabled: !!selectedGroupId,
  });
  
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };
  
  const handleGroupChange = (value: string) => {
    setSelectedGroupId(value);
  };
  
  const handleAddItinerary = () => {
    if (selectedGroupId) {
      navigate(`/groups/${selectedGroupId}/itinerary/new`);
    }
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
            <h1 className="text-2xl font-semibold">Itineraries</h1>
            <p className="text-muted-foreground">Manage trip schedules and activities</p>
          </div>
          
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Select a Group</CardTitle>
                <Button 
                  onClick={handleAddItinerary} 
                  disabled={!selectedGroupId || isLoadingGroups}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Itinerary Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingGroups ? (
                <Skeleton className="h-10 w-full" />
              ) : groups && groups.length > 0 ? (
                <Select value={selectedGroupId} onValueChange={handleGroupChange}>
                  <SelectTrigger className="w-full md:w-[400px]">
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.schoolName}: {group.groupName} - {format(new Date(group.startDate), "MMM d, yyyy")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-2">No groups available</p>
                  <Button onClick={() => navigate("/groups/new")}>
                    Create a group first
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {selectedGroupId && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isLoadingGroups 
                    ? <Skeleton className="h-6 w-40" /> 
                    : groups?.find(g => g.id.toString() === selectedGroupId) && (
                        <>
                          Itinerary for {groups.find(g => g.id.toString() === selectedGroupId)?.schoolName}: {groups.find(g => g.id.toString() === selectedGroupId)?.groupName}
                        </>
                      )
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingItineraries ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : itineraries && itineraries.length > 0 ? (
                  <div className="space-y-6">
                    {itineraries
                      .sort((a, b) => a.dayNumber - b.dayNumber)
                      .map((day) => (
                        <div 
                          key={day.id} 
                          className="relative pl-8 pb-8 border-l border-muted cursor-pointer hover:bg-muted/20 p-4 rounded-md"
                          onClick={() => navigate(`/groups/${selectedGroupId}/itinerary/${day.id}`)}
                        >
                          <div className="absolute left-0 top-0 w-6 h-6 bg-primary rounded-full -translate-x-1/2 flex items-center justify-center text-white text-sm font-medium">
                            {day.dayNumber}
                          </div>
                          <div className="mb-2">
                            <h3 className="text-lg font-semibold">
                              Day {day.dayNumber}: {format(new Date(day.date), "EEEE, MMMM d, yyyy")}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {day.location || groups?.find(g => g.id.toString() === selectedGroupId)?.location}
                            </p>
                          </div>
                          <div className="bg-muted/50 p-4 rounded-md">
                            <p className="font-medium">{day.activity}</p>
                            {(day.startTime || day.endTime) && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {day.startTime && `Start: ${day.startTime}`}
                                {day.startTime && day.endTime && " • "}
                                {day.endTime && `End: ${day.endTime}`}
                              </p>
                            )}
                            {day.notes && <p className="text-sm mt-2">{day.notes}</p>}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No itinerary items found for this group</p>
                    <Button onClick={handleAddItinerary}>
                      Create First Itinerary Item
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
