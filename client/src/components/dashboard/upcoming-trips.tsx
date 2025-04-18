import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Group } from "@shared/schema";
import { isFuture, isPast, parseISO, format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

interface UpcomingTripsProps {
  groups: Group[];
  isLoading: boolean;
}

export default function UpcomingTrips({ groups, isLoading }: UpcomingTripsProps) {
  const [, navigate] = useLocation();
  
  // Filter to only upcoming trips and sort by date
  const upcomingTrips = groups
    .filter(group => {
      const startDate = new Date(group.startDate);
      return isFuture(startDate);
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 4); // Only show top 4
  
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string }> = {
      active: { bg: "bg-primary-50 text-primary-600", text: "Active" },
      confirmed: { bg: "bg-green-50 text-green-600", text: "Confirmed" },
      pending: { bg: "bg-amber-50 text-amber-600", text: "Pending" },
      processing: { bg: "bg-purple-50 text-purple-600", text: "Processing" },
      completed: { bg: "bg-blue-50 text-blue-600", text: "Completed" },
    };
    
    const defaultStatus = { bg: "bg-gray-50 text-gray-600", text: "Unknown" };
    const statusStyle = statusMap[status?.toLowerCase()] || defaultStatus;
    
    return (
      <span className={`text-xs ${statusStyle.bg} px-2 py-0.5 rounded`}>
        {statusStyle.text}
      </span>
    );
  };
  
  const getBorderColor = (status: string) => {
    const borderMap: Record<string, string> = {
      active: "border-primary-500",
      confirmed: "border-green-500",
      pending: "border-amber-500",
      processing: "border-purple-500", 
      completed: "border-blue-500",
    };
    
    return borderMap[status?.toLowerCase()] || "border-gray-500";
  };
  
  const handleCreateTrip = () => {
    navigate("/groups/new");
  };
  
  const handleViewAll = () => {
    navigate("/groups");
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Upcoming Trips</CardTitle>
        <Button variant="link" size="sm" onClick={handleViewAll} className="text-primary-600 p-0">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-14 w-1.5" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : upcomingTrips.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-2">No upcoming trips found</p>
            <Button variant="outline" onClick={handleCreateTrip}>
              Create your first trip
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingTrips.map((trip) => (
              <div 
                key={trip.id} 
                className={`border-l-4 ${getBorderColor(trip.status)} pl-3 py-2 cursor-pointer hover:bg-muted/20`}
                onClick={() => navigate(`/groups/${trip.id}`)}
              >
                <div className="flex justify-between">
                  <h3 className="font-medium">{trip.schoolName} {trip.groupName}</h3>
                  {getStatusBadge(trip.status)}
                </div>
                <p className="text-sm text-muted-foreground">{trip.location}</p>
                <div className="mt-1 flex items-center text-xs text-muted-foreground">
                  <Calendar className="mr-1 h-3 w-3" />
                  <span>
                    {format(new Date(trip.startDate), "MMM d")}
                    {new Date(trip.startDate).toDateString() !== new Date(trip.endDate).toDateString() 
                      ? ` - ${format(new Date(trip.endDate), "MMM d, yyyy")}`
                      : `, ${format(new Date(trip.startDate), "yyyy")}`
                    }
                  </span>
                  <span className="mx-2">•</span>
                  <span>{trip.totalTravelers || 0} travelers</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4">
          <Button 
            variant="outline" 
            className="w-full py-2 text-sm bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-md font-medium"
            onClick={handleCreateTrip}
          >
            Create New Trip
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
