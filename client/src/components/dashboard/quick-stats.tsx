import { Card, CardContent } from "@/components/ui/card";
import { Group } from "@shared/schema";
import { Bus, Users, CalendarCheck, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isFuture, parseISO } from "date-fns";

interface QuickStatsProps {
  groups: Group[];
  isLoading: boolean;
}

export default function QuickStats({ groups, isLoading }: QuickStatsProps) {
  const currentDate = new Date();
  
  // Calculate active trips (trips happening now)
  const activeTrips = groups.filter(
    (group) => {
      const startDate = new Date(group.startDate);
      const endDate = new Date(group.endDate);
      return startDate <= currentDate && endDate >= currentDate;
    }
  );
  
  // Calculate total travelers
  const totalTravelers = groups.reduce(
    (acc, group) => acc + (group.totalTravelers || 0), 
    0
  );
  
  // Calculate upcoming departures
  const upcomingDepartures = groups.filter(
    (group) => {
      const startDate = new Date(group.startDate);
      return isFuture(startDate);
    }
  ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  
  // Calculate unsigned contracts
  const pendingContracts = groups.filter(
    (group) => !group.contractSigned
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {isLoading ? (
        <>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-9 w-16" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
                <div className="mt-4">
                  <Skeleton className="h-5 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Trips</p>
                  <p className="text-2xl font-semibold">{activeTrips.length}</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bus className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-green-600 text-sm font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  {Math.round((activeTrips.length / Math.max(groups.length, 1)) * 100)}%
                </span>
                <span className="text-muted-foreground text-xs ml-2">of total trips</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-semibold">{totalTravelers}</p>
                </div>
                <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-green-600 text-sm font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  12%
                </span>
                <span className="text-muted-foreground text-xs ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming Departures</p>
                  <p className="text-2xl font-semibold">{upcomingDepartures.length}</p>
                </div>
                <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                  <CalendarCheck className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-muted-foreground text-xs">
                  {upcomingDepartures.length > 0 ? (
                    <>Next: {format(new Date(upcomingDepartures[0].startDate), "MMM d, yyyy")}</>
                  ) : (
                    "No upcoming departures"
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Contracts</p>
                  <p className="text-2xl font-semibold">{pendingContracts.length}</p>
                </div>
                <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-amber-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-amber-600 text-sm font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {pendingContracts.filter(g => new Date(g.startDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length} urgent
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
