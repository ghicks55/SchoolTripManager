import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Group } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { differenceInDays } from "date-fns";
import { PieChart, Pie, BarChart, Bar, XAxis, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface TripStatisticsProps {
  groups: Group[];
  isLoading: boolean;
}

export default function TripStatistics({ groups, isLoading }: TripStatisticsProps) {
  const [timePeriod, setTimePeriod] = useState("30");
  
  const filterGroupsByTimePeriod = (days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return groups.filter(group => {
      const createdDate = new Date(group.createdAt);
      return createdDate >= cutoffDate;
    });
  };
  
  const filteredGroups = filterGroupsByTimePeriod(parseInt(timePeriod));
  
  // Calculate popular destinations
  const destinations = filteredGroups.reduce((acc, group) => {
    const location = group.location;
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const destinationsData = Object.entries(destinations)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Calculate traveler types (mock since we don't have actual data)
  const travelerTypesData = [
    { name: "Students", value: 82, color: "#0078d4" },
    { name: "Chaperones", value: 15, color: "#107c10" },
    { name: "Directors", value: 3, color: "#2b88d8" },
  ];
  
  // Calculate trip lengths
  const calculateTripLength = (group: Group) => {
    const startDate = new Date(group.startDate);
    const endDate = new Date(group.endDate);
    const days = differenceInDays(endDate, startDate) + 1;
    
    if (days === 1) return "1 Day";
    if (days >= 2 && days <= 3) return "2-3 Days";
    if (days >= 4 && days <= 5) return "4-5 Days";
    return "6+ Days";
  };
  
  const tripLengths = filteredGroups.reduce((acc, group) => {
    const length = calculateTripLength(group);
    acc[length] = (acc[length] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const tripLengthsData = [
    { name: "1 Day", value: tripLengths["1 Day"] || 0, percentage: 0 },
    { name: "2-3 Days", value: tripLengths["2-3 Days"] || 0, percentage: 0 },
    { name: "4-5 Days", value: tripLengths["4-5 Days"] || 0, percentage: 0 },
    { name: "6+ Days", value: tripLengths["6+ Days"] || 0, percentage: 0 },
  ];
  
  const totalTrips = tripLengthsData.reduce((sum, item) => sum + item.value, 0);
  if (totalTrips > 0) {
    tripLengthsData.forEach(item => {
      item.percentage = Math.round((item.value / totalTrips) * 100);
    });
  }
  
  const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Trip Statistics</CardTitle>
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
            <SelectItem value="365">This Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-md" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full rounded-md" />
              <Skeleton className="h-32 w-full rounded-md" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border border-border rounded-md p-4">
              <h3 className="text-sm font-medium mb-2">Popular Destinations</h3>
              <div className="h-48">
                {destinationsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={destinationsData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <XAxis type="number" />
                      <Tooltip />
                      <Bar dataKey="count" barSize={20}>
                        {destinationsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No destination data available</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Traveler Types</h3>
                <div className="h-32 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={travelerTypesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                        label
                      >
                        {travelerTypesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="border border-border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Trip Length</h3>
                <div className="space-y-3 mt-4">
                  {tripLengthsData.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{item.name}</span>
                        <span>{item.percentage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
