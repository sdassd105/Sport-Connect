import { Suspense, lazy, useEffect, useState } from "react";
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

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-primary shadow-[0_0_40px_rgba(204,255,0,0.28)]">
          <img
            src="/images/hero-main.jpg"
            alt="Sport Connect"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-background/25" />
        </div>
        <div>
          <h1 className="text-5xl leading-none text-primary sm:text-6xl">
            Sport Connect
          </h1>
          <p className="mt-2 text-sm uppercase tracking-[0.28em] text-muted-foreground">
            A carregar
          </p>
        </div>
        <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-pulse bg-primary" />
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && location !== "/auth") {
      setLocation("/auth");
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  if (isLoading) {
    return <LoadingScreen />;
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
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setShowSplash(false);
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, []);

  if (showSplash) {
    return (
      <ErrorBoundary>
        <ThemeProvider defaultTheme="dark">
          <LoadingScreen />
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Suspense
              fallback={<LoadingScreen />}
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
