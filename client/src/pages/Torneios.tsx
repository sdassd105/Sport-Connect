import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Calendar, MapPin, Users, Plus, ShieldCheck, Clock } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Torneios() {
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    type: "amador",
    date: "",
    location: "",
    address: "",
    maxTeams: "",
    sport: "futebol",
  });

  const amadorTournaments = [
    {
      id: 1,
      name: "Copa do Bairro",
      sport: "Futebol",
      teams: "8/12",
      date: "20/02/2026",
      location: "Arena Society Central",
      organizer: "Joao Silva",
      type: "amador",
    },
    {
      id: 2,
      name: "3x3 do Parque",
      sport: "Basquete",
      teams: "4/8",
      date: "22/02/2026",
      location: "Quadra Municipal",
      organizer: "Carlos M.",
      type: "amador",
    },
    {
      id: 3,
      name: "Volei de Praia",
      sport: "Volei",
      teams: "6/8",
      date: "25/02/2026",
      location: "Praia Central",
      organizer: "Maria Silva",
      type: "amador",
    },
  ];

  const profissionalTournaments = [
    {
      id: 101,
      name: "Liga Nacional Pro",
      sport: "Futebol",
      teams: "16/16",
      date: "01/03/2026",
      location: "Estadio Municipal",
      status: "Inscricoes Encerradas",
      type: "profissional",
    },
    {
      id: 102,
      name: "Grand Slam Volei",
      sport: "Volei",
      teams: "10/12",
      date: "15/03/2026",
      location: "Ginasio Ibirapuera",
      status: "Aberto",
      type: "profissional",
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTournament = () => {
    if (
      !formData.name ||
      !formData.date ||
      !formData.location ||
      !formData.address ||
      !formData.maxTeams
    ) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    console.log("Torneio criado:", formData);
    setFormData({
      name: "",
      type: "amador",
      date: "",
      location: "",
      address: "",
      maxTeams: "",
      sport: "futebol",
    });
    setShowCreate(false);
    alert("Torneio criado com sucesso!");
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-display font-bold uppercase text-foreground">
              Torneios & <span className="text-primary">Competicoes</span>
            </h1>
            <p className="font-sans text-muted-foreground">
              Organize ou participe dos maiores eventos da sua regiao.
            </p>
          </div>

          {user?.role === "treinador" && (
            <Button
              onClick={() => setShowCreate(!showCreate)}
              className="h-12 bg-primary px-8 font-display uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="mr-2 h-5 w-5" /> Criar Torneio
            </Button>
          )}
        </div>

        {showCreate && user?.role === "treinador" && (
          <Card className="animate-in slide-in-from-top-4 fade-in border-2 border-primary bg-card">
            <CardHeader>
              <CardTitle className="font-display uppercase">Novo Agendamento de Torneio</CardTitle>
              <CardDescription>Preencha os dados para abrir as inscricoes</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest">
                    Nome do Torneio
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border-2 border-border bg-background p-3 outline-none focus:border-primary"
                    placeholder="Ex: Copa Verao 2026"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest">
                    Tipo de Torneio
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full border-2 border-border bg-background p-3 outline-none focus:border-primary"
                  >
                    <option value="amador">Amador</option>
                    <option value="profissional">Profissional</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest">Desporto</label>
                  <select
                    name="sport"
                    value={formData.sport}
                    onChange={handleInputChange}
                    className="w-full border-2 border-border bg-background p-3 outline-none focus:border-primary"
                  >
                    <option value="futebol">Futebol</option>
                    <option value="basquete">Basquete</option>
                    <option value="volei">Volei</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest">Data e Hora</label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full border-2 border-border bg-background p-3 outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest">Local</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full border-2 border-border bg-background p-3 outline-none focus:border-primary"
                    placeholder="Ex: Arena Society Central"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest">Endereco</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full border-2 border-border bg-background p-3 outline-none focus:border-primary"
                    placeholder="Ex: Rua das Flores, 120 - Lisboa"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest">
                    Quantidade de Equipas
                  </label>
                  <input
                    type="number"
                    name="maxTeams"
                    value={formData.maxTeams}
                    onChange={handleInputChange}
                    className="w-full border-2 border-border bg-background p-3 outline-none focus:border-primary"
                    placeholder="Ex: 12"
                  />
                </div>
                <div className="mt-4 flex gap-4 md:col-span-2">
                  <Button
                    type="button"
                    onClick={handleCreateTournament}
                    className="h-12 flex-1 bg-primary font-display uppercase hover:bg-primary/90"
                  >
                    Publicar Torneio
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreate(false)}
                    className="h-12 flex-1 font-display uppercase"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="amador" className="w-full">
          <TabsList className="mb-8 grid h-16 w-full grid-cols-2 border-2 border-border bg-card p-1">
            <TabsTrigger
              value="amador"
              className="font-display text-lg uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="mr-2 h-5 w-5" /> Torneios Amadores
            </TabsTrigger>
            <TabsTrigger
              value="profissional"
              className="font-display text-lg uppercase data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
            >
              <ShieldCheck className="mr-2 h-5 w-5" /> Liga Profissional
            </TabsTrigger>
          </TabsList>

          <TabsContent value="amador" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {amadorTournaments.map((t) => (
                <Card key={t.id} className="overflow-hidden border-2 border-border transition-colors hover:border-primary">
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="bg-primary px-2 py-1 text-[10px] font-bold uppercase text-primary-foreground">
                        {t.sport}
                      </span>
                      <span className="text-xs text-muted-foreground">{t.teams} equipas</span>
                    </div>
                    <CardTitle className="font-display text-xl uppercase">{t.name}</CardTitle>
                    <CardDescription className="text-sm">Organizado por {t.organizer}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      {t.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      {t.location}
                    </div>
                    <Button className="mt-4 w-full bg-secondary font-display uppercase text-secondary-foreground hover:bg-secondary/90">
                      Inscrever Equipa
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profissional" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {profissionalTournaments.map((t) => (
                <Card key={t.id} className="border-2 border-border transition-colors hover:border-secondary">
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="bg-secondary px-2 py-1 text-[10px] font-bold uppercase text-secondary-foreground">
                        {t.sport}
                      </span>
                      <span
                        className={`px-2 py-1 text-[10px] font-bold uppercase ${
                          t.status === "Aberto"
                            ? "bg-green-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <CardTitle className="font-display text-2xl uppercase">{t.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-secondary" />
                        <span>{t.teams}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-secondary" />
                        <span>{t.date}</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-secondary" />
                        <span>{t.location}</span>
                      </div>
                    </div>
                    <Button
                      className="w-full font-display uppercase"
                      variant={t.status === "Aberto" ? "default" : "outline"}
                      disabled={t.status !== "Aberto"}
                    >
                      {t.status === "Aberto" ? "Solicitar Inscricao" : "Inscricoes Encerradas"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Card className="border-l-4 border-l-primary bg-card">
          <CardContent className="pt-6">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
              <div className="rounded-full bg-primary p-3">
                <Trophy className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 font-display text-xl font-bold uppercase">
                  Queres organizar um torneio oficial?
                </h3>
                <p className="text-muted-foreground">
                  Treinadores verificados podem criar e gerir torneios diretamente pela plataforma.
                </p>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Apoio 24h
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Verificacao
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
