import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { 
  Users, 
  FileText, 
  Truck, 
  DollarSign,
  ClipboardList,
  Trash,
  Plus
} from "lucide-react";

interface RecentActivityProps {
  className?: string;
}

// Helper function to get icon based on activity type
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'created':
    case 'updated':
      return <Users className="h-5 w-5 text-info-700" />;
    case 'contract':
      return <FileText className="h-5 w-5 text-primary-700" />;
    case 'transportation':
      return <Truck className="h-5 w-5 text-secondary-700" />;
    case 'payment':
      return <DollarSign className="h-5 w-5 text-success-700" />;
    case 'roster':
      return <ClipboardList className="h-5 w-5 text-info-700" />;
    case 'drop_off':
      return <Trash className="h-5 w-5 text-error-700" />;
    case 'waiting_list':
    case 'promotion':
      return <Plus className="h-5 w-5 text-warning-700" />;
    default:
      return <Users className="h-5 w-5 text-neutral-700" />;
  }
};

// Helper function to get background color based on activity type
const getActivityBgColor = (type: string) => {
  switch (type) {
    case 'created':
    case 'updated':
    case 'roster':
      return 'bg-info-100';
    case 'contract':
      return 'bg-primary-100';
    case 'transportation':
      return 'bg-secondary-100';
    case 'payment':
      return 'bg-success-100';
    case 'drop_off':
      return 'bg-error-100';
    case 'waiting_list':
    case 'promotion':
      return 'bg-warning-100';
    default:
      return 'bg-neutral-100';
  }
};

export function RecentActivity({ className }: RecentActivityProps) {
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
    queryFn: async () => {
      const res = await fetch('/api/activities?limit=5');
      if (!res.ok) throw new Error('Failed to fetch activities');
      return res.json();
    }
  });
  
  return (
    <Card className={className}>
      <CardHeader className="px-5 py-4 border-b border-neutral-200 flex justify-between items-center">
        <CardTitle className="font-heading font-semibold text-neutral-900">Recent Activity</CardTitle>
        <Button variant="link" className="text-sm text-primary-600 hover:text-primary-700 p-0">
          View All
        </Button>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="py-10 text-center text-neutral-500">
            Loading recent activities...
          </div>
        ) : activities.length === 0 ? (
          <div className="py-10 text-center text-neutral-500">
            No recent activities to display
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {activities.map((activity, index) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index < activities.length - 1 && (
                      <span 
                        className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-neutral-200" 
                        aria-hidden="true"
                      ></span>
                    )}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        <div className={`h-10 w-10 rounded-full ${getActivityBgColor(activity.type)} flex items-center justify-center ring-8 ring-white`}>
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm font-medium text-neutral-900">
                            {activity.type === 'roster' && 'New student registration'}
                            {activity.type === 'created' && 'New group created'}
                            {activity.type === 'updated' && 'Group details updated'}
                            {activity.type === 'contract' && 'Contract signed'}
                            {activity.type === 'payment' && 'Payment received'}
                            {activity.type === 'transportation' && 'Transportation updated'}
                            {activity.type === 'drop_off' && 'Student dropped off'}
                            {activity.type === 'waiting_list' && 'Added to waiting list'}
                            {activity.type === 'promotion' && 'Promoted from waiting list'}
                          </div>
                          <p className="mt-0.5 text-sm text-neutral-500">
                            {activity.description.split(':')[0]}
                          </p>
                        </div>
                        <div className="mt-2 text-sm text-neutral-700">
                          <p>{activity.description.split(':')[1]}</p>
                        </div>
                        <div className="mt-1 text-xs text-neutral-500">
                          <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
