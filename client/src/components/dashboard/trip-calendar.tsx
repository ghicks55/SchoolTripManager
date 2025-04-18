import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Group } from "@shared/schema";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, getDay, isSameDay } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

interface TripCalendarProps {
  groups: Group[];
  isLoading: boolean;
}

export default function TripCalendar({ groups, isLoading }: TripCalendarProps) {
  const [, navigate] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = monthStart;
  const endDate = monthEnd;

  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  
  const startingDayOfWeek = getDay(monthStart);
  
  // Get days from previous month to fill in calendar
  const previousMonthDays = startingDayOfWeek > 0 ? Array.from({ length: startingDayOfWeek }).map((_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (startingDayOfWeek - i));
    return date;
  }) : [];
  
  // Get days from next month to fill in calendar
  const totalDaysToShow = Math.ceil((daysInMonth.length + startingDayOfWeek) / 7) * 7;
  const nextMonthDaysCount = totalDaysToShow - (daysInMonth.length + startingDayOfWeek);
  
  const nextMonthDays = nextMonthDaysCount > 0 ? Array.from({ length: nextMonthDaysCount }).map((_, i) => {
    const date = new Date(monthEnd);
    date.setDate(date.getDate() + i + 1);
    return date;
  }) : [];
  
  const allDays = [...previousMonthDays, ...daysInMonth, ...nextMonthDays];
  
  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }
  
  const tripsOnDate = (date: Date) => {
    return groups.filter(group => {
      const startDate = new Date(group.startDate);
      const endDate = new Date(group.endDate);
      return date >= startDate && date <= endDate;
    });
  };
  
  const getMonthYearOptions = () => {
    const options = [];
    for (let i = -2; i <= 12; i++) {
      const date = addMonths(new Date(), i);
      options.push({
        value: date.toISOString(),
        label: format(date, 'MMMM yyyy')
      });
    }
    return options;
  };

  const handlePreviousMonth = () => {
    setCurrentDate(addMonths(currentDate, -1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleAddTrip = () => {
    navigate("/groups/new");
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-blue-100 border-l-2 border-blue-500';
      case 'confirmed': return 'bg-green-100 border-l-2 border-green-500';
      case 'pending': return 'bg-amber-100 border-l-2 border-amber-500';
      case 'completed': return 'bg-purple-100 border-l-2 border-purple-500';
      default: return 'bg-gray-100 border-l-2 border-gray-500';
    }
  };

  const getRandomColor = (index: number) => {
    const colors = [
      'bg-blue-100 border-l-2 border-blue-500',
      'bg-green-100 border-l-2 border-green-500',
      'bg-purple-100 border-l-2 border-purple-500',
      'bg-amber-100 border-l-2 border-amber-500',
      'bg-red-100 border-l-2 border-red-500',
    ];
    return colors[index % colors.length];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Trip Calendar</CardTitle>
        <div className="flex space-x-2">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Select 
              value={currentDate.toISOString()}
              onValueChange={(value) => setCurrentDate(new Date(value))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue>{format(currentDate, 'MMMM yyyy')}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {getMonthYearOptions().map((option, i) => (
                  <SelectItem key={i} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <Button size="sm" onClick={handleAddTrip}>
            <Plus className="h-4 w-4 mr-1" /> Add Trip
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        ) : (
          <div className="border border-border rounded-md overflow-hidden">
            <div className="grid grid-cols-7 bg-muted/50 border-b border-border">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <div key={i} className="py-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 divide-x divide-y divide-border">
              {weeks.map((week, weekIndex) => (
                week.map((day, dayIndex) => {
                  const dayTrips = tripsOnDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  
                  return (
                    <div 
                      key={`${weekIndex}-${dayIndex}`} 
                      className={`h-24 p-1 relative ${!isCurrentMonth ? 'bg-muted/50 text-muted-foreground' : ''}`}
                    >
                      <span className="text-xs">{format(day, 'd')}</span>
                      <div className="mt-1 space-y-1 overflow-y-auto max-h-[72px]">
                        {dayTrips.slice(0, 2).map((trip, i) => (
                          <div 
                            key={i} 
                            className={`${getStatusColor(trip.status)} p-1 rounded text-xs truncate-2`}
                            onClick={() => navigate(`/groups/${trip.id}`)}
                          >
                            <p className="font-medium">{trip.schoolName}</p>
                            <p className="text-xs text-muted-foreground">{trip.location}</p>
                          </div>
                        ))}
                        {dayTrips.length > 2 && (
                          <div className="text-xs text-center text-muted-foreground">
                            +{dayTrips.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
