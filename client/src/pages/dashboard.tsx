import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { TripCalendar } from "@/components/dashboard/trip-calendar";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { UpcomingTrips } from "@/components/dashboard/upcoming-trips";
import {
  LayoutDashboard,
  Calendar,
  Users,
  TruckIcon,
  DollarSign,
} from "lucide-react";

interface DashboardStats {
  activeTrips: number;
  upcomingTrips: number;
  totalStudents: number;
  revenue: number;
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });
  
  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6">
          {/* Dashboard Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-heading font-bold text-neutral-900">Dashboard</h1>
            <p className="text-neutral-600">Overview of your school trips and activities</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Active Trips"
              value={isLoading ? "..." : stats?.activeTrips || 0}
              icon={<LayoutDashboard className="h-6 w-6" />}
              change="+2"
              iconClassName="bg-primary-100"
            />
            
            <StatsCard
              title="Upcoming Trips"
              value={isLoading ? "..." : stats?.upcomingTrips || 0}
              icon={<Calendar className="h-6 w-6" />}
              change="+5"
              iconClassName="bg-secondary-100 text-secondary-700"
            />
            
            <StatsCard
              title="Total Students"
              value={isLoading ? "..." : stats?.totalStudents || 0}
              icon={<Users className="h-6 w-6" />}
              change="+108"
              iconClassName="bg-info-100 text-info-700"
            />
            
            <StatsCard
              title="Revenue"
              value={isLoading ? "..." : formatCurrency(stats?.revenue || 0)}
              icon={<DollarSign className="h-6 w-6" />}
              change="+18.2%"
              iconClassName="bg-success-100 text-success-700"
            />
          </div>
          
          {/* Calendar and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <TripCalendar className="lg:col-span-2" />
            <RecentActivity />
          </div>
          
          {/* Upcoming Trips */}
          <UpcomingTrips className="mb-6" />
        </main>
      </div>
    </div>
  );
}
