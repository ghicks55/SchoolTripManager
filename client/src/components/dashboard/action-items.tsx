import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionItem } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { FileWarning, DollarSign, UserPlus, BedDouble, ArrowRight } from "lucide-react";
import { format, isPast } from "date-fns";

interface ActionItemsProps {
  actionItems: ActionItem[];
  isLoading: boolean;
}

export default function ActionItems({ actionItems, isLoading }: ActionItemsProps) {
  const [, navigate] = useLocation();
  
  // Sort action items by priority and due date
  const sortedActionItems = [...actionItems].sort((a, b) => {
    // First by priority (urgent > high > normal > low)
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    const priorityComparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 4) - 
                               (priorityOrder[b.priority as keyof typeof priorityOrder] || 4);
    
    if (priorityComparison !== 0) return priorityComparison;
    
    // Then by due date (closest first)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    // Items with due dates come before those without
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    
    return 0;
  });
  
  const getPriorityDisplay = (priority: string) => {
    const priorityMap: Record<string, { color: string; label: string }> = {
      urgent: { color: "text-red-600", label: "Urgent" },
      high: { color: "text-amber-600", label: "Due Soon" },
      normal: { color: "text-blue-600", label: "In Progress" },
      low: { color: "text-green-600", label: "Can Start" },
    };
    
    return priorityMap[priority] || { color: "text-muted-foreground", label: "Normal" };
  };
  
  const getIconByTitle = (title: string) => {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes("contract") || lowerTitle.includes("signature") || lowerTitle.includes("agreement")) {
      return <FileWarning className="text-red-600" />;
    }
    
    if (lowerTitle.includes("payment") || lowerTitle.includes("deposit") || lowerTitle.includes("fee") || lowerTitle.includes("cost")) {
      return <DollarSign className="text-amber-600" />;
    }
    
    if (lowerTitle.includes("roster") || lowerTitle.includes("student") || lowerTitle.includes("traveler")) {
      return <UserPlus className="text-blue-600" />;
    }
    
    if (lowerTitle.includes("room") || lowerTitle.includes("accommodation") || lowerTitle.includes("hotel")) {
      return <BedDouble className="text-green-600" />;
    }
    
    // Default icon
    return <FileWarning className="text-gray-600" />;
  };
  
  const getIconBgColor = (priority: string) => {
    const bgColorMap: Record<string, string> = {
      urgent: "bg-red-100",
      high: "bg-amber-100",
      normal: "bg-blue-100",
      low: "bg-green-100",
    };
    
    return bgColorMap[priority] || "bg-gray-100";
  };
  
  const handleViewAll = () => {
    navigate("/action-items");
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center">
          <CardTitle className="text-lg font-semibold">Action Items</CardTitle>
          {!isLoading && (
            <span className="bg-primary-50 text-primary-600 text-xs px-2 py-1 rounded-full ml-2">
              {actionItems.filter(item => item.status === "pending").length} pending
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start p-3 border border-border rounded-md">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedActionItems.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-2">No action items found</p>
            <Button variant="outline" onClick={() => navigate("/action-items/new")}>
              Create action item
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedActionItems.slice(0, 4).map((item) => (
              <div 
                key={item.id} 
                className="flex items-start p-3 border border-border rounded-md hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate(`/action-items/${item.id}`)}
              >
                <div className={`flex-shrink-0 h-8 w-8 ${getIconBgColor(item.priority)} rounded-full flex items-center justify-center`}>
                  {getIconByTitle(item.title)}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium">{item.title}</h3>
                    <span className={`text-xs ${getPriorityDisplay(item.priority).color}`}>
                      {getPriorityDisplay(item.priority).label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.description}
                    {item.dueDate && (
                      <span className={isPast(new Date(item.dueDate)) ? "text-red-600 font-medium" : ""}>
                        {" "}(Due: {format(new Date(item.dueDate), "MMM d, yyyy")})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Button 
          variant="outline" 
          className="mt-4 w-full py-2 text-sm flex items-center justify-center"
          onClick={handleViewAll}
        >
          <span>View All Action Items</span>
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
