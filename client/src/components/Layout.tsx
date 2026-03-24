import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, X, Trophy, Users, Newspaper, Activity, Share2, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();

  const navItems = [
    { href: "/", label: "Notícias", icon: Newspaper },
    { href: "/esportes", label: "Desportos", icon: Activity },
    { href: "/tm", label: "T&M", icon: Trophy },
    { href: "/profile", label: "Perfil", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b-4 border-primary bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-primary text-background p-1 transform -skew-x-12 group-hover:skew-x-0 transition-transform duration-300">
              <Share2 className="h-8 w-8" />
            </div>
            <span className="font-display text-3xl font-bold tracking-tighter uppercase text-foreground group-hover:text-primary transition-colors">
              Sport<span className="text-primary">Connect</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-1 text-lg font-display font-medium uppercase tracking-wide transition-colors hover:text-primary",
                    isActive ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {item.label}
                </Link>
              );
            })}
            <Button
              onClick={logout}
              variant="ghost"
              className="text-muted-foreground hover:text-primary font-display uppercase text-sm tracking-wide"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background p-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 text-lg font-display font-medium uppercase p-2 hover:bg-accent hover:text-accent-foreground transition-colors",
                    location === item.href ? "text-primary bg-accent/10" : "text-foreground"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <Button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                variant="ghost"
                className="justify-start text-muted-foreground hover:text-primary font-display uppercase text-sm tracking-wide"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12 mt-12">
        <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-primary text-background p-1 -skew-x-12">
                <Share2 className="h-6 w-6" />
              </div>
              <span className="font-display text-2xl font-bold uppercase">
                Sport<span className="text-primary">Connect</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              A sua plataforma definitiva para ligar atletas, equipas e a paixão pelo desporto.
            </p>
          </div>
          
          <div>
            <h3 className="font-display text-xl font-bold mb-4 text-primary">Desportos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/esportes?filter=futebol" className="hover:text-soccer transition-colors">Futebol</a></li>
              <li><a href="/esportes?filter=basquete" className="hover:text-basketball transition-colors">Basquete</a></li>
              <li><a href="/esportes?filter=volei" className="hover:text-volleyball transition-colors">Vôlei</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xl font-bold mb-4 text-primary">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contacto</a></li>
            </ul>
          </div>

        </div>
        <div className="container mt-8 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground">
          © 2026 Sport Connect. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
