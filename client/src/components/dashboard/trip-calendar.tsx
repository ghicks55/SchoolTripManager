import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Group } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface TripCalendarProps {
  className?: string;
}

// Helper function to determine color class based on index
const getColorClass = (index: number) => {
  const colors = [
    "bg-primary-100 text-primary-800",  // Blue
    "bg-secondary-100 text-secondary-800",  // Orange/Amber
    "bg-info-100 text-info-800",  // Light Blue
    "bg-success-100 text-success-800",  // Green
    "bg-warning-100 text-warning-800",  // Yellow
    "bg-error-100 text-error-800",  // Red
    "bg-purple-100 text-purple-800",  // Purple
    "bg-pink-100 text-pink-800",  // Pink
    "bg-indigo-100 text-indigo-800",  // Indigo
    "bg-teal-100 text-teal-800",  // Teal
  ];
  return colors[index % colors.length];
};

export function TripCalendar({ className }: TripCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Fetch all groups for the calendar
  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  // Get all days in the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = getDay(monthStart);
  
  // Create a 7x6 calendar grid (max 6 weeks)
  const calendarGrid = [];
  const totalSlots = 42; // 7 days x 6 weeks
  
  // Previous month days
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarGrid.push({ date: null, isCurrentMonth: false });
  }
  
  // Current month days
  days.forEach(day => {
    calendarGrid.push({ date: day, isCurrentMonth: true });
  });
  
  // Next month days (to fill the grid)
  const remainingSlots = totalSlots - calendarGrid.length;
  for (let i = 0; i < remainingSlots; i++) {
    calendarGrid.push({ date: null, isCurrentMonth: false });
  }
  
  // Group days into weeks
  const weeks = [];
  for (let i = 0; i < calendarGrid.length; i += 7) {
    weeks.push(calendarGrid.slice(i, i + 7));
  }
  
  // Find trips that are active on each date
  const getTripsForDate = (date: Date) => {
    if (!date) return [];
    
    return groups.filter(group => {
      const startDate = new Date(group.startDate);
      const endDate = new Date(group.endDate);
      return date >= startDate && date <= endDate;
    });
  };
  
  return (
    <Card className={className}>
      <CardHeader className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
        <CardTitle className="font-heading font-semibold text-neutral-900">Trip Calendar</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" className="p-2 rounded-md hover:bg-neutral-100" onClick={prevMonth}>
            <ChevronLeft className="h-5 w-5 text-neutral-600" />
          </Button>
          <h3 className="text-lg font-semibold text-neutral-800">
            {format(currentDate, "MMMM yyyy")}
          </h3>
          <Button variant="ghost" size="icon" className="p-2 rounded-md hover:bg-neutral-100" onClick={nextMonth}>
            <ChevronRight className="h-5 w-5 text-neutral-600" />
          </Button>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Labels */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
            <div key={i} className="text-center text-sm font-medium text-neutral-500 p-2">{day}</div>
          ))}
          
          {/* Calendar Days */}
          {weeks.map((week, weekIndex) => (
            <>
              {week.map((day, dayIndex) => {
                const trips = day.date ? getTripsForDate(day.date) : [];
                
                return (
                  <div 
                    key={`${weekIndex}-${dayIndex}`} 
                    className={`border ${day.isCurrentMonth ? 'border-neutral-200' : 'border-neutral-100'} rounded-md min-h-[80px] p-1 ${isToday(day.date) ? 'bg-neutral-50' : ''}`}
                  >
                    {day.date && (
                      <>
                        <div className={`${day.isCurrentMonth ? 'text-neutral-900' : 'text-neutral-400'}`}>
                          {format(day.date, "d")}
                        </div>
                        
                        {/* Trips on this day */}
                        <div className="mt-1 flex flex-col space-y-1">
                          {trips.slice(0, 3).map((trip, i) => (
                            <div 
                              key={trip.id} 
                              className={`text-xs p-1 ${getColorClass(i)} rounded truncate`}
                              title={`${trip.schoolName} - ${trip.groupName}`}
                            >
                              {trip.schoolName.split(' ')[0]} {trip.groupName.split(' ')[0]}
                            </div>
                          ))}
                          {trips.length > 3 && (
                            <div className="text-xs text-neutral-500 pl-1">
                              +{trips.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
