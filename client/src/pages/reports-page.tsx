import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  FileText, 
  Download, 
  BarChart,
  PieChart,
  CalendarDays,
  Users,
  Home,
  Bus
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Group } from "@shared/schema";
import { format } from "date-fns";

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [reportType, setReportType] = useState<string>("summary");
  
  // Fetch all groups
  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });
  
  // Get the current date for the report header
  const currentDate = format(new Date(), "MMMM d, yyyy");
  
  // Sample report data (in a real application, this would come from the API)
  const totalGroups = groups.length;
  const totalStudents = groups.reduce((total, group) => total + (group.totalTravelers || 0), 0);
  const totalBuses = groups.reduce((total, group) => total + (group.totalBuses || 0), 0);
  
  // Helper function to get selected group
  const getSelectedGroup = () => {
    if (selectedGroupId === "all") return null;
    return groups.find(g => g.id.toString() === selectedGroupId);
  };
  
  const selectedGroup = getSelectedGroup();
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-heading font-bold text-neutral-900">Reports</h1>
              <p className="text-neutral-600">Generate and view reports for your trips</p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <Button className="bg-primary-600 hover:bg-primary-700">
                <Download className="h-5 w-5 mr-2" />
                Export Report
              </Button>
              <Button variant="outline">
                <FileText className="h-5 w-5 mr-2" />
                Print Report
              </Button>
            </div>
          </div>
          
          {/* Report Controls */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Report Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="group-select" className="block text-sm font-medium text-neutral-700 mb-1">
                    Select Group
                  </label>
                  <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                    <SelectTrigger id="group-select">
                      <SelectValue placeholder="All Groups" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Groups</SelectItem>
                      {groups.map(group => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.schoolName} - {group.groupName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="report-type" className="block text-sm font-medium text-neutral-700 mb-1">
                    Report Type
                  </label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger id="report-type">
                      <SelectValue placeholder="Summary Report" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary Report</SelectItem>
                      <SelectItem value="financial">Financial Report</SelectItem>
                      <SelectItem value="travelers">Traveler Report</SelectItem>
                      <SelectItem value="transportation">Transportation Report</SelectItem>
                      <SelectItem value="meals">Meal Report</SelectItem>
                      <SelectItem value="rooming">Rooming Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full bg-primary-600 hover:bg-primary-700">
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Report Content */}
          <Card>
            <CardHeader className="border-b border-neutral-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-xl font-medium">
                  {reportType === "summary" && "Summary Report"}
                  {reportType === "financial" && "Financial Report"}
                  {reportType === "travelers" && "Traveler Report"}
                  {reportType === "transportation" && "Transportation Report"}
                  {reportType === "meals" && "Meal Report"}
                  {reportType === "rooming" && "Rooming Report"}
                  {selectedGroup && `: ${selectedGroup.schoolName} - ${selectedGroup.groupName}`}
                </CardTitle>
                <div className="text-sm text-neutral-500 mt-2 md:mt-0">
                  Generated on {currentDate}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Summary Report */}
              {reportType === "summary" && (
                <div>
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-neutral-50">
                      <CardContent className="pt-6 pb-4">
                        <div className="flex items-center">
                          <div className="p-3 rounded-full bg-primary-100 text-primary-700 mr-4">
                            <Users className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="text-sm text-neutral-500">Total Groups</div>
                            <div className="text-2xl font-semibold">{totalGroups}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-neutral-50">
                      <CardContent className="pt-6 pb-4">
                        <div className="flex items-center">
                          <div className="p-3 rounded-full bg-secondary-100 text-secondary-700 mr-4">
                            <Users className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="text-sm text-neutral-500">Total Students</div>
                            <div className="text-2xl font-semibold">{totalStudents}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-neutral-50">
                      <CardContent className="pt-6 pb-4">
                        <div className="flex items-center">
                          <div className="p-3 rounded-full bg-info-100 text-info-700 mr-4">
                            <CalendarDays className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="text-sm text-neutral-500">Upcoming Trips</div>
                            <div className="text-2xl font-semibold">{groups.length}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-neutral-50">
                      <CardContent className="pt-6 pb-4">
                        <div className="flex items-center">
                          <div className="p-3 rounded-full bg-success-100 text-success-700 mr-4">
                            <Bus className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="text-sm text-neutral-500">Total Buses</div>
                            <div className="text-2xl font-semibold">{totalBuses}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Charts Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-medium">Groups by Month</CardTitle>
                      </CardHeader>
                      <CardContent className="h-64 flex items-center justify-center">
                        <BarChart3 className="h-24 w-24 text-neutral-300" />
                        <div className="ml-4 text-neutral-500">
                          Chart visualization would appear here
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-medium">Travelers by Type</CardTitle>
                      </CardHeader>
                      <CardContent className="h-64 flex items-center justify-center">
                        <PieChart className="h-24 w-24 text-neutral-300" />
                        <div className="ml-4 text-neutral-500">
                          Chart visualization would appear here
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Recent Groups Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Recent Groups</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                                Director
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Total Travelers
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            {groups.slice(0, 5).map((group) => (
                              <tr key={group.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-neutral-900">{group.schoolName}</div>
                                  <div className="text-sm text-neutral-500">{group.groupName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-neutral-900">
                                    {format(new Date(group.startDate), "MMM d")} - {format(new Date(group.endDate), "MMM d, yyyy")}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-neutral-900">{group.director || "Not assigned"}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                  {group.totalTravelers || 0}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* Financial Report */}
              {reportType === "financial" && (
                <div className="text-center py-8">
                  <BarChart className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Financial Report</h3>
                  <p className="text-neutral-500 mb-4 max-w-md mx-auto">
                    This report would display financial information including revenue, expenses, and payments.
                  </p>
                </div>
              )}
              
              {/* Traveler Report */}
              {reportType === "travelers" && (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Traveler Report</h3>
                  <p className="text-neutral-500 mb-4 max-w-md mx-auto">
                    This report would display detailed traveler information, demographics, and participation statistics.
                  </p>
                </div>
              )}
              
              {/* Transportation Report */}
              {reportType === "transportation" && (
                <div className="text-center py-8">
                  <Bus className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Transportation Report</h3>
                  <p className="text-neutral-500 mb-4 max-w-md mx-auto">
                    This report would display detailed transportation information, bus assignments, and logistics.
                  </p>
                </div>
              )}
              
              {/* Meal Report */}
              {reportType === "meals" && (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Meal Report</h3>
                  <p className="text-neutral-500 mb-4 max-w-md mx-auto">
                    This report would display meal counts, types, and special dietary requirements.
                  </p>
                </div>
              )}
              
              {/* Rooming Report */}
              {reportType === "rooming" && (
                <div className="text-center py-8">
                  <Home className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Rooming Report</h3>
                  <p className="text-neutral-500 mb-4 max-w-md mx-auto">
                    This report would display detailed rooming assignments, room types, and occupancy information.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
