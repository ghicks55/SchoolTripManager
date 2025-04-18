import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Group, Itinerary, Roster } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Bus, 
  FileText, 
  DollarSign, 
  Check, 
  X 
} from "lucide-react";

export default function GroupDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: group, isLoading: isLoadingGroup } = useQuery<Group>({
    queryKey: [`/api/groups/${id}`],
  });

  const { data: itineraries, isLoading: isLoadingItineraries } = useQuery<Itinerary[]>({
    queryKey: [`/api/groups/${id}/itineraries`],
    enabled: activeTab === "itinerary",
  });

  const { data: roster, isLoading: isLoadingRoster } = useQuery<Roster[]>({
    queryKey: [`/api/groups/${id}/roster`],
    enabled: activeTab === "roster",
  });

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  if (!id) return null;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string }> = {
      active: { bg: "bg-green-100 text-green-800", text: "Active" },
      confirmed: { bg: "bg-blue-100 text-blue-800", text: "Confirmed" },
      pending: { bg: "bg-amber-100 text-amber-800", text: "Pending" },
      processing: { bg: "bg-purple-100 text-purple-800", text: "Processing" },
      completed: { bg: "bg-gray-100 text-gray-800", text: "Completed" },
    };
    
    const defaultStatus = { bg: "bg-gray-100 text-gray-800", text: "Unknown" };
    const statusStyle = statusMap[status?.toLowerCase()] || defaultStatus;
    
    return (
      <Badge variant="outline" className={`${statusStyle.bg} border-none`}>
        {statusStyle.text}
      </Badge>
    );
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
            <Button 
              variant="ghost" 
              onClick={() => navigate("/groups")} 
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Groups
            </Button>
            
            {isLoadingGroup ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ) : group ? (
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-semibold">{group.schoolName}: {group.groupName}</h1>
                  <div className="flex items-center mt-1 text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{group.location}</span>
                    <span className="mx-2">•</span>
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {format(new Date(group.startDate), "MMM d")}
                      {new Date(group.startDate).toDateString() !== new Date(group.endDate).toDateString() 
                        ? ` - ${format(new Date(group.endDate), "MMM d, yyyy")}`
                        : `, ${format(new Date(group.startDate), "yyyy")}`
                      }
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {getStatusBadge(group.status)}
                  <Button onClick={() => navigate(`/groups/${id}/edit`)}>Edit Group</Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Group not found</p>
              </div>
            )}
          </div>
          
          {isLoadingGroup ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full rounded-md" />
            </div>
          ) : group ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                <TabsTrigger value="roster">Roster</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Users className="mr-2 h-5 w-5 text-primary" />
                        Group Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Director</p>
                        <p>{group.director || "Not assigned"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Director Email</p>
                        <p>{group.directorEmail || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Travelers</p>
                        <p>{group.totalTravelers || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">GMR Number</p>
                        <p>{group.gmrNumber || "Not assigned"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Registration Opens</p>
                        <p>
                          {group.openRegistrationDate 
                            ? format(new Date(group.openRegistrationDate), "MMMM d, yyyy") 
                            : "Not scheduled"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Bus className="mr-2 h-5 w-5 text-primary" />
                        Transportation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Bus Supplier</p>
                        <p>{group.busSupplier || "Not assigned"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Number of Buses</p>
                        <p>{group.totalBuses || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Charter Number</p>
                        <p>{group.busCharterNumber || "Not assigned"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Bus Cost</p>
                        <p>{group.busCost ? `$${group.busCost.toLocaleString()}` : "$0"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Deposit Amount</p>
                        <p>{group.busDepositAmount ? `$${group.busDepositAmount.toLocaleString()}` : "$0"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Deposit Paid Date</p>
                        <p>
                          {group.busDepositPaidDate 
                            ? format(new Date(group.busDepositPaidDate), "MMMM d, yyyy") 
                            : "Not paid"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-primary" />
                        Trip Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 flex items-center justify-center mr-2">
                          {group.contractSent ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <X className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <p>Contract Sent</p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 flex items-center justify-center mr-2">
                          {group.contractSigned ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <X className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <p>Contract Signed</p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 flex items-center justify-center mr-2">
                          {group.planEarsWorkshopRegistered ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <X className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <p>PlanEars Workshop Registered</p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 flex items-center justify-center mr-2">
                          {group.insurancePurchased ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <X className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <p>Insurance Purchased</p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 flex items-center justify-center mr-2">
                          {group.moneyCollectionStarted ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <X className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <p>Money Collection Started</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="itinerary">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Trip Itinerary</CardTitle>
                        <CardDescription>Daily schedule for this trip</CardDescription>
                      </div>
                      <Button onClick={() => navigate(`/groups/${id}/itinerary/new`)}>Add Day</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingItineraries ? (
                      <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ) : itineraries && itineraries.length > 0 ? (
                      <div className="space-y-6">
                        {itineraries
                          .sort((a, b) => a.dayNumber - b.dayNumber)
                          .map((day) => (
                            <div key={day.id} className="relative pl-8 pb-8 border-l border-muted">
                              <div className="absolute left-0 top-0 w-6 h-6 bg-primary rounded-full -translate-x-1/2 flex items-center justify-center text-white text-sm font-medium">
                                {day.dayNumber}
                              </div>
                              <div className="mb-2">
                                <h3 className="text-lg font-semibold">
                                  Day {day.dayNumber}: {format(new Date(day.date), "EEEE, MMMM d, yyyy")}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {day.location || group.location}
                                </p>
                              </div>
                              <div className="bg-muted/50 p-4 rounded-md">
                                <p className="font-medium">{day.activity}</p>
                                {(day.startTime || day.endTime) && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {day.startTime && `Start: ${day.startTime}`}
                                    {day.startTime && day.endTime && " • "}
                                    {day.endTime && `End: ${day.endTime}`}
                                  </p>
                                )}
                                {day.notes && <p className="text-sm mt-2">{day.notes}</p>}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">No itinerary items found</p>
                        <Button onClick={() => navigate(`/groups/${id}/itinerary/new`)}>
                          Create First Day
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="roster">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Trip Roster</CardTitle>
                        <CardDescription>Participants for this trip</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => navigate(`/groups/${id}/roster/waiting-list`)}>
                          Waiting List
                        </Button>
                        <Button onClick={() => navigate(`/groups/${id}/roster/new`)}>Add Traveler</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingRoster ? (
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    ) : roster && roster.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Name</th>
                              <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Type</th>
                              <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Gender</th>
                              <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Meal</th>
                              <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Room</th>
                              <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Insurance</th>
                              <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {roster.map((traveler) => (
                              <tr key={traveler.id} className="border-b border-border hover:bg-muted/50">
                                <td className="py-3 px-4">
                                  {traveler.firstName} {traveler.lastName}
                                </td>
                                <td className="py-3 px-4 capitalize">{traveler.travelerType}</td>
                                <td className="py-3 px-4">{traveler.gender}</td>
                                <td className="py-3 px-4">{traveler.meal || "Not selected"}</td>
                                <td className="py-3 px-4">{traveler.roomOccupancy || "Not assigned"}</td>
                                <td className="py-3 px-4">{traveler.insurance || "No"}</td>
                                <td className="py-3 px-4">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => navigate(`/groups/${id}/roster/${traveler.id}`)}
                                  >
                                    Details
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">No travelers found</p>
                        <Button onClick={() => navigate(`/groups/${id}/roster/new`)}>
                          Add First Traveler
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : null}
        </main>
      </div>
    </div>
  );
}
