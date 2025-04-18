import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Groups from "@/pages/groups";
import GroupDetails from "@/pages/group-details";
import Itineraries from "@/pages/itineraries";
import Roster from "@/pages/roster";
import BusSuppliers from "@/pages/bus-suppliers";
import Meals from "@/pages/meals";
import Rooming from "@/pages/rooming";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeProvider } from "next-themes";
import React from "react";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/groups" component={Groups} />
      <ProtectedRoute path="/groups/:id" component={GroupDetails} />
      <ProtectedRoute path="/itineraries" component={Itineraries} />
      <ProtectedRoute path="/roster" component={Roster} />
      <ProtectedRoute path="/bus-suppliers" component={BusSuppliers} />
      <ProtectedRoute path="/meals" component={Meals} />
      <ProtectedRoute path="/rooming" component={Rooming} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
