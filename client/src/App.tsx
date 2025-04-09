import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import LoginPage from "@/pages/admin/login";
import { ResourceStoreProvider } from "@/hooks/use-resource-store";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <ProtectedRoute path="/admin" component={Admin} />
      <Route path="/admin/login" component={LoginPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ResourceStoreProvider>
          <Router />
          <Toaster />
        </ResourceStoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
