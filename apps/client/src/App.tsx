import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import AdminStreamlined from "@/pages/AdminStreamlined";
import AdminLogin from "@/pages/AdminLogin";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import CaseStudies from "@/pages/CaseStudies";
import CaseStudyDetail from "@/pages/CaseStudyDetail";
import ErrorTranslatorDemo from "@/pages/ErrorTranslatorDemo";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/case-studies" component={CaseStudies} />
      <Route path="/case-study/:slug" component={CaseStudyDetail} />
      <Route path="/error-translator" component={ErrorTranslatorDemo} />
      <Route path="/admin">
        <AdminAuthGuard>
          <AdminStreamlined />
        </AdminAuthGuard>
      </Route>
      <Route path="/admin/login" component={AdminLogin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
