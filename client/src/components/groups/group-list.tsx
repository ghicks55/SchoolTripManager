import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus, Filter, Search, MoreVertical } from "lucide-react";
import { Group } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { GroupForm } from "./group-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function GroupList() {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("any");
  const [directorFilter, setDirectorFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  
  // Fetch all groups and directors
  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });
  
  // Extract unique directors, locations for filters
  const uniqueDirectors = [...new Set(groups.map(g => g.director).filter(Boolean))];
  const uniqueLocations = [...new Set(groups.map(g => g.location).filter(Boolean))];
  
  // Filter groups based on search text and other filters
  const filteredGroups = groups.filter(group => {
    // Search by school name, group name, location
    const searchMatch = !searchText || 
      group.schoolName.toLowerCase().includes(searchText.toLowerCase()) ||
      group.groupName.toLowerCase().includes(searchText.toLowerCase()) ||
      (group.location && group.location.toLowerCase().includes(searchText.toLowerCase()));
    
    // Filter by status
    let statusMatch = true;
    if (statusFilter !== "all") {
      if (statusFilter === "confirmed" && !group.contractSigned) statusMatch = false;
      if (statusFilter === "planning" && group.contractSigned) statusMatch = false;
      if (statusFilter === "registration_open" && !group.registrationDate) statusMatch = false;
      if (statusFilter === "payment_pending" && !group.moneyCollectionStarted) statusMatch = false;
      if (statusFilter === "contract_sent" && !group.contractSent) statusMatch = false;
    }
    
    // Filter by date
    let dateMatch = true;
    const now = new Date();
    const startDate = new Date(group.startDate);
    if (dateFilter === "30days" && (startDate.getTime() - now.getTime()) > 30 * 24 * 60 * 60 * 1000) dateMatch = false;
    if (dateFilter === "90days" && (startDate.getTime() - now.getTime()) > 90 * 24 * 60 * 60 * 1000) dateMatch = false;
    if (dateFilter === "thisyear" && startDate.getFullYear() !== now.getFullYear()) dateMatch = false;
    
    // Filter by director
    const directorMatch = directorFilter === "all" || group.director === directorFilter;
    
    // Filter by location
    const locationMatch = locationFilter === "all" || group.location === locationFilter;
    
    return searchMatch && statusMatch && dateMatch && directorMatch && locationMatch;
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
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900">School Groups</h1>
          <p className="text-neutral-600">Manage your school groups and trip details</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary-600 hover:bg-primary-700">
                <Plus className="h-5 w-5 mr-2" />
                Add Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[850px]">
              <DialogHeader>
                <DialogTitle>Add New School Group</DialogTitle>
              </DialogHeader>
              <GroupForm onSuccess={() => {}} />
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            <Filter className="h-5 w-5 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Group Search and Filter Controls */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-neutral-700 mb-1">Search Groups</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-neutral-400" />
                </div>
                <Input
                  type="text"
                  id="search"
                  className="pl-10"
                  placeholder="Search by school name, group name, or location..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
              <Select defaultValue="all" onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="planning">In Planning</SelectItem>
                  <SelectItem value="registration_open">Registration Open</SelectItem>
                  <SelectItem value="payment_pending">Pending Payment</SelectItem>
                  <SelectItem value="contract_sent">Contract Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label htmlFor="date-filter" className="block text-sm font-medium text-neutral-700 mb-1">Travel Date</label>
              <Select defaultValue="any" onValueChange={setDateFilter}>
                <SelectTrigger id="date-filter">
                  <SelectValue placeholder="Any Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Date</SelectItem>
                  <SelectItem value="30days">Next 30 Days</SelectItem>
                  <SelectItem value="90days">Next 90 Days</SelectItem>
                  <SelectItem value="thisyear">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="director-filter" className="block text-sm font-medium text-neutral-700 mb-1">Director</label>
              <Select defaultValue="all" onValueChange={setDirectorFilter}>
                <SelectTrigger id="director-filter">
                  <SelectValue placeholder="All Directors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Directors</SelectItem>
                  {uniqueDirectors.map(director => (
                    <SelectItem key={director} value={director}>{director}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="location-filter" className="block text-sm font-medium text-neutral-700 mb-1">Location</label>
              <Select defaultValue="all" onValueChange={setLocationFilter}>
                <SelectTrigger id="location-filter">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-primary-600 hover:bg-primary-700">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Groups Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  School & Group
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Location
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Transportation
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-neutral-500">
                    Loading groups...
                  </td>
                </tr>
              ) : filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-neutral-500">
                    No groups found matching your filters
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
                        <div className="text-sm font-medium text-neutral-900">{group.schoolName}</div>
                        <div className="text-sm text-neutral-500">{group.groupName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{group.location || "Not specified"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">
                          {format(new Date(group.startDate), "MMM d")}-{format(new Date(group.endDate), "d, yyyy")}
                        </div>
                        <div className="text-xs text-neutral-500">{days} days</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{group.director || "Not assigned"}</div>
                        <div className="text-xs text-neutral-500">{group.directorEmail || ""}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {group.totalTravelers || "0"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{group.busSupplier || "Not assigned"}</div>
                        <div className="text-xs text-neutral-500">{group.totalBuses ? `${group.totalBuses} buses` : ""}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/groups/${group.id}`} className="text-primary-600 hover:text-primary-900 mr-3">View</Link>
                        <Link href={`/groups/${group.id}/edit`} className="text-primary-600 hover:text-primary-900 mr-3">Edit</Link>
                        <Button variant="ghost" size="sm" className="p-1">
                          <MoreVertical className="h-5 w-5 text-neutral-600" />
                        </Button>
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
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(filteredGroups.length, 5)}</span> of <span className="font-medium">{filteredGroups.length}</span> groups
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
    </div>
  );
}
