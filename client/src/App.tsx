import { Suspense, lazy, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Auth from "./pages/Auth";
import NotFound from "@/pages/NotFound";

const Home = lazy(() => import("./pages/Home"));
const Esportes = lazy(() => import("./pages/Esportes"));
const Torneios = lazy(() => import("./pages/Torneios"));
const Times = lazy(() => import("./pages/Times"));
const TM = lazy(() => import("./pages/TM"));
const PlayerProfile = lazy(() => import("./pages/PlayerProfile"));

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && location !== "/auth") {
      setLocation("/auth");
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">A carregar...</div>;
  }

  if (!isAuthenticated && location !== "/auth") {
    return null;
  }

  return <Component />;
}

function Router() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (!isAuthenticated && location !== "/auth") {
    return <Auth />;
  }

  return (
    <Switch>
      <Route path={"/auth"} component={Auth} />
      <Route path={"/"} component={() => <ProtectedRoute component={Home} />} />
      <Route path={"/esportes"} component={() => <ProtectedRoute component={Esportes} />} />
      <Route path={"/torneios"} component={() => <ProtectedRoute component={Torneios} />} />
      <Route path={"/times"} component={() => <ProtectedRoute component={Times} />} />
      <Route path={"/tm"} component={() => <ProtectedRoute component={TM} />} />
      <Route path={"/profile"} component={() => <ProtectedRoute component={PlayerProfile} />} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Suspense
              fallback={<div className="min-h-screen flex items-center justify-center">A carregar...</div>}
            >
              <Router />
            </Suspense>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
