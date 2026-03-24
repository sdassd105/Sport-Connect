import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Esportes from "./pages/Esportes";
import Torneios from "./pages/Torneios";
import Times from "./pages/Times";
import TM from "./pages/TM";
import PlayerProfile from "./pages/PlayerProfile";
import Auth from "./pages/Auth";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">A carregar...</div>;
  }

  if (!isAuthenticated && location !== "/auth") {
    setLocation("/auth");
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
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
