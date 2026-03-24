import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, ShieldCheck, User, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { login, register } = useAuth();
  const [role, setRole] = useState<"atleta" | "treinador">("atleta");
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof Error && err.message) return err.message;
    if (typeof err === "object" && err !== null) {
      const maybeMessage = (err as { message?: unknown }).message;
      if (typeof maybeMessage === "string" && maybeMessage) return maybeMessage;
      const maybeShape = (err as { shape?: { message?: unknown } }).shape;
      if (typeof maybeShape?.message === "string" && maybeShape.message) return maybeShape.message;
      const maybeData = (err as { data?: { zodError?: unknown } }).data;
      if (maybeData?.zodError) return JSON.stringify(maybeData.zodError);
    }
    return fallback;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      if (!formData.email || !formData.password) {
        setError("Por favor, preencha todos os campos.");
        return;
      }
      
      await login(formData.email, formData.password);
      setLocation("/");
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao fazer login. Tente novamente."));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      if (!formData.name || !formData.email || !formData.password) {
        setError("Por favor, preencha todos os campos.");
        return;
      }
      
      if (formData.password.length < 6) {
        setError("A palavra-passe deve ter pelo menos 6 caracteres.");
        return;
      }
      
      await register(formData.name, formData.email, formData.password, role);
      setLocation("/");
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao criar conta. Tente novamente."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
      
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary text-background p-2 -skew-x-12">
              <Activity className="h-10 w-10" />
            </div>
          </div>
          <div>
            <CardTitle className="text-4xl font-display font-bold uppercase tracking-tighter">
              Sport<span className="text-primary">Connect</span>
            </CardTitle>
            <CardDescription className="font-sans uppercase tracking-widest text-[10px] mt-1">
              A sua arena digital de ligação desportiva
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 border border-border">
              <TabsTrigger value="login" className="font-display uppercase">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="font-display uppercase">Registar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="uppercase text-[10px] font-bold tracking-widest">E-mail</Label>
                  <Input 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-background border-2 border-border focus:border-primary h-12" 
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-[10px] font-bold tracking-widest">Palavra-passe</Label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="bg-background border-2 border-border focus:border-primary h-12" 
                    disabled={loading}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display uppercase text-lg h-12 mt-4"
                >
                  {loading ? "A entrar..." : "Aceder à Arena"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setRole("atleta")}
                    disabled={loading}
                    className={`p-4 border-2 flex flex-col items-center gap-2 transition-all ${role === "atleta" ? "border-primary bg-primary/10 text-primary" : "border-border grayscale opacity-50"}`}
                  >
                    <User className="h-6 w-6" />
                    <span className="font-display uppercase text-xs">Sou Atleta</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("treinador")}
                    disabled={loading}
                    className={`p-4 border-2 flex flex-col items-center gap-2 transition-all ${role === "treinador" ? "border-primary bg-primary/10 text-primary" : "border-border grayscale opacity-50"}`}
                  >
                    <ShieldCheck className="h-6 w-6" />
                    <span className="font-display uppercase text-xs">Sou Treinador</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <Label className="uppercase text-[10px] font-bold tracking-widest">Nome Completo</Label>
                  <Input 
                    placeholder="Como quer ser chamado?" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-background border-2 border-border focus:border-primary h-12" 
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-[10px] font-bold tracking-widest">E-mail</Label>
                  <Input 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-background border-2 border-border focus:border-primary h-12" 
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-[10px] font-bold tracking-widest">Palavra-passe</Label>
                  <Input 
                    type="password" 
                    placeholder="Mínimo 6 caracteres" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="bg-background border-2 border-border focus:border-primary h-12" 
                    disabled={loading}
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display uppercase text-lg h-12 mt-4"
                >
                  {loading ? "A criar conta..." : "Criar Conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
