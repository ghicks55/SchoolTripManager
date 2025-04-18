import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import QuickStats from "@/components/dashboard/quick-stats";
import TripCalendar from "@/components/dashboard/trip-calendar";
import UpcomingTrips from "@/components/dashboard/upcoming-trips";
import GroupsTable from "@/components/dashboard/groups-table";
import ActionItems from "@/components/dashboard/action-items";
import TripStatistics from "@/components/dashboard/trip-statistics";
import { useQuery } from "@tanstack/react-query";
import { Group, ActionItem } from "@shared/schema";

export default function Dashboard() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { data: groups, isLoading: isLoadingGroups } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
  });

  const { data: actionItems, isLoading: isLoadingActionItems } = useQuery<ActionItem[]>({
    queryKey: ["/api/action-items"],
  });

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
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
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your school trip programs</p>
          </div>
          
          <QuickStats groups={groups || []} isLoading={isLoadingGroups} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <TripCalendar groups={groups || []} isLoading={isLoadingGroups} />
            </div>
            <div>
              <UpcomingTrips groups={groups || []} isLoading={isLoadingGroups} />
            </div>
          </div>
          
          <GroupsTable groups={groups || []} isLoading={isLoadingGroups} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActionItems actionItems={actionItems || []} isLoading={isLoadingActionItems} />
            <TripStatistics groups={groups || []} isLoading={isLoadingGroups} />
          </div>
        </main>
      </div>
    </div>
  );
}
