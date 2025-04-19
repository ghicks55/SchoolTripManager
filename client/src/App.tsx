import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import GroupsPage from "@/pages/groups-page";
import ItinerariesPage from "@/pages/itineraries-page";
import RostersPage from "@/pages/rosters-page";
import TransportationPage from "@/pages/transportation-page";
import MealsPage from "@/pages/meals-page";
import RoomingPage from "@/pages/rooming-page";
import ReportsPage from "@/pages/reports-page";
import SettingsPage from "@/pages/settings-page";
import DocumentsPage from "@/pages/documents-page";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/groups" component={GroupsPage} />
      <ProtectedRoute path="/itineraries" component={ItinerariesPage} />
      <ProtectedRoute path="/rosters" component={RostersPage} />
      <ProtectedRoute path="/transportation" component={TransportationPage} />
      <ProtectedRoute path="/meals" component={MealsPage} />
      <ProtectedRoute path="/rooming" component={RoomingPage} />
      <ProtectedRoute path="/reports" component={ReportsPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/groups/:groupId/documents" component={DocumentsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
