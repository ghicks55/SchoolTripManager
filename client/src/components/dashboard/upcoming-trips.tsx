import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Group } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { format, isAfter, isBefore, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { Link } from "wouter";

interface UpcomingTripsProps {
  className?: string;
}

export function UpcomingTrips({ className }: UpcomingTripsProps) {
  const [timeframe, setTimeframe] = useState("all");
  
  // Fetch all groups
  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });
  
  // Filter groups based on the selected timeframe
  const filteredGroups = groups.filter(group => {
    const startDate = new Date(group.startDate);
    const now = new Date();
    
    switch (timeframe) {
      case "month":
        // This month
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        return isAfter(startDate, monthStart) && isBefore(startDate, monthEnd);
        
      case "next_month":
        // Next month
        const nextMonthStart = startOfMonth(addMonths(now, 1));
        const nextMonthEnd = endOfMonth(addMonths(now, 1));
        return isAfter(startDate, nextMonthStart) && isBefore(startDate, nextMonthEnd);
        
      case "quarter":
        // Next 3 months
        const quarterEnd = addMonths(now, 3);
        return isAfter(startDate, now) && isBefore(startDate, quarterEnd);
        
      default:
        // All upcoming trips
        return isAfter(startDate, now);
    }
  }).sort((a, b) => {
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
  
  // Function to get the status of a group
  const getGroupStatus = (group: Group) => {
    if (group.contractSigned) return "confirmed";
    if (group.contractSent) return "contract_sent";
    if (group.moneyCollectionStarted) return "payment_pending";
    if (group.registrationDate && new Date(group.registrationDate) <= new Date()) return "registration_open";
    return "planning";
  };
  
  return (
    <Card className={className}>
      <CardHeader className="px-5 py-4 border-b border-neutral-200 flex justify-between items-center">
        <CardTitle className="font-heading font-semibold text-neutral-900">Upcoming Trips</CardTitle>
        <div className="flex space-x-2">
          <Select defaultValue="all" onValueChange={setTimeframe}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="All Trips" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trips</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="next_month">Next Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </CardHeader>
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
                Total Travelers
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Director
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-neutral-500">
                  Loading upcoming trips...
                </td>
              </tr>
            ) : filteredGroups.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-neutral-500">
                  No upcoming trips found
                </td>
              </tr>
            ) : (
              filteredGroups.map((group) => {
                // Calculate travel duration in days
                const startDate = new Date(group.startDate);
                const endDate = new Date(group.endDate);
                const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                
                // Determine group status
                const status = getGroupStatus(group);
                
                return (
                  <tr key={group.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-neutral-900">
                            {group.schoolName}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {group.groupName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">
                        {format(new Date(group.startDate), "MMM d")}-{format(new Date(group.endDate), "d, yyyy")}
                      </div>
                      <div className="text-xs text-neutral-500">{days} days</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">{group.totalTravelers || "0"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">{group.director || "Not assigned"}</div>
                      <div className="text-xs text-neutral-500">{group.directorEmail || ""}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/groups/${group.id}`} className="text-primary-600 hover:text-primary-800 mr-3">View</Link>
                      <Link href={`/groups/${group.id}/edit`} className="text-primary-600 hover:text-primary-800">Edit</Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {filteredGroups.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-neutral-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-neutral-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(filteredGroups.length, 5)}</span> of <span className="font-medium">{filteredGroups.length}</span> trips
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50"
                    disabled
                  >
                    <span className="sr-only">Previous</span>
                    <span aria-hidden="true">&laquo;</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm" 
                    className="relative inline-flex items-center px-4 py-2 border border-neutral-300 bg-primary-50 text-sm font-medium text-primary-600"
                  >
                    1
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50"
                    disabled
                  >
                    <span className="sr-only">Next</span>
                    <span aria-hidden="true">&raquo;</span>
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
