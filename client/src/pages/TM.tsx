import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, Send, Mail, Check, X, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Player {
  id: number;
  name: string;
  sport: string;
  position: string;
  level: string;
  age: number;
  city: string;
  email: string;
}

interface Team {
  id: number;
  name: string;
  sport: string;
  position: string;
  level: string;
  city: string;
  description: string;
  email: string;
}

interface Application {
  id: number;
  name: string;
  sport: string;
  position: string;
  message: string;
  status: "pendente" | "aceite" | "rejeitado";
  email: string;
}

type VacancyFormState = {
  sport: "futebol" | "basquete" | "volei";
  position: string;
  level: "iniciante" | "intermediario" | "avancado";
  city: string;
  description: string;
};

function mapSportLabel(sport: "futebol" | "basquete" | "volei") {
  if (sport === "futebol") return "Futebol";
  if (sport === "basquete") return "Basquete";
  return "Volei";
}

function mapSkillLabel(level?: string | null) {
  if (level === "iniciante") return "Iniciante";
  if (level === "avancado") return "Avancado";
  return "Intermedio";
}

export default function TM() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(
    user?.role === "treinador" ? "recrutamento" : "candidaturas"
  );
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [candidatureMessage, setCandidatureMessage] = useState("");
  const [showCreateVacancy, setShowCreateVacancy] = useState(false);
  const [isSavingVacancy, setIsSavingVacancy] = useState(false);
  const [teamsSeekingPlayers, setTeamsSeekingPlayers] = useState<Team[]>([]);
  const [vacancyForm, setVacancyForm] = useState<VacancyFormState>({
    sport: "futebol",
    position: "",
    level: "intermediario",
    city: "",
    description: "",
  });

  const [playersSeekingTeams] = useState<Player[]>([
    {
      id: 1,
      name: "Lucas 'Spider'",
      sport: "Basquete",
      position: "Armador",
      level: "Avancado",
      age: 22,
      city: "Lisboa",
      email: "lucas@email.com",
    },
    {
      id: 2,
      name: "Ana Volley",
      sport: "Volei",
      position: "Levantadora",
      level: "Intermedio",
      age: 26,
      city: "Porto",
      email: "ana@email.com",
    },
    {
      id: 3,
      name: "Marcos Gol",
      sport: "Futebol",
      position: "Guarda-redes",
      level: "Profissional",
      age: 29,
      city: "Setubal",
      email: "marcos@email.com",
    },
  ]);

  const [receivedApplications, setReceivedApplications] = useState<Application[]>([
    {
      id: 1,
      name: "Lucas 'Spider'",
      sport: "Basquete",
      position: "Armador",
      message: "Gostaria de fazer um teste na equipa!",
      status: "pendente",
      email: "lucas@email.com",
    },
    {
      id: 2,
      name: "Marcos Gol",
      sport: "Futebol",
      position: "Guarda-redes",
      message: "Tenho experiencia em torneios regionais.",
      status: "pendente",
      email: "marcos@email.com",
    },
  ]);

  const [myApplications, setMyApplications] = useState<Application[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadAnnouncements() {
      try {
        const announcements = await trpc.tm.getAnnouncementsByType.query({
          type: "procurando_jogador",
        });

        if (cancelled) return;

        setTeamsSeekingPlayers(
          announcements.map((announcement) => ({
            id: announcement.id,
            name: announcement.title,
            sport: mapSportLabel(announcement.sport),
            position: announcement.position ?? "Nao informado",
            level: mapSkillLabel(announcement.skillLevel),
            city: announcement.city ?? "Nao informada",
            description: announcement.description ?? "Sem descricao adicional.",
            email: "",
          }))
        );
      } catch (error) {
        console.error("Erro ao carregar anuncios:", error);
      }
    }

    loadAnnouncements();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleVacancyInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setVacancyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateVacancy = async () => {
    if (!user) return;

    if (!vacancyForm.position || !vacancyForm.city || !vacancyForm.description) {
      toast.error("Preencha posicao, cidade e descricao da vaga.");
      return;
    }

    setIsSavingVacancy(true);

    try {
      const createdAnnouncement = await trpc.tm.createAnnouncement.mutate({
        userId: user.id,
        type: "procurando_jogador",
        sport: vacancyForm.sport,
        title: `Vaga para ${vacancyForm.position}`,
        description: vacancyForm.description,
        position: vacancyForm.position,
        skillLevel: vacancyForm.level,
        city: vacancyForm.city,
      });

      setTeamsSeekingPlayers((prev) => [
        {
          id: createdAnnouncement.id,
          name: createdAnnouncement.title,
          sport: mapSportLabel(createdAnnouncement.sport),
          position: createdAnnouncement.position ?? "Nao informado",
          level: mapSkillLabel(createdAnnouncement.skillLevel),
          city: createdAnnouncement.city ?? "Nao informada",
          description: createdAnnouncement.description ?? "Sem descricao adicional.",
          email: "",
        },
        ...prev,
      ]);

      setVacancyForm({
        sport: "futebol",
        position: "",
        level: "intermediario",
        city: "",
        description: "",
      });
      setShowCreateVacancy(false);
      toast.success("Anuncio criado com sucesso e salvo na base de dados.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel criar o anuncio.";
      toast.error(message);
    } finally {
      setIsSavingVacancy(false);
    }
  };

  const handleSendCandidature = (teamId: number) => {
    if (!candidatureMessage.trim()) {
      toast.error("Escreva uma mensagem de candidatura.");
      return;
    }

    const team = teamsSeekingPlayers.find((item) => item.id === teamId);
    if (!team) return;

    const newApp: Application = {
      id: myApplications.length + 1,
      name: team.name,
      sport: team.sport,
      position: team.position,
      message: candidatureMessage,
      status: "pendente",
      email: team.email,
    };

    setMyApplications((current) => [...current, newApp]);
    toast.success(`Candidatura enviada para ${team.name}.`);
    setCandidatureMessage("");
    setSelectedTeam(null);
  };

  const handleAcceptApplication = (appId: number) => {
    setReceivedApplications((current) =>
      current.map((app) => (app.id === appId ? { ...app, status: "aceite" } : app))
    );
    toast.success("Candidatura aceite com sucesso.");
  };

  const handleRejectApplication = (appId: number) => {
    setReceivedApplications((current) =>
      current.map((app) => (app.id === appId ? { ...app, status: "rejeitado" } : app))
    );
    toast.success("Candidatura rejeitada.");
  };

  const handleViewProfile = (playerId: number) => {
    const player = playersSeekingTeams.find((item) => item.id === playerId);
    if (!player) return;

    setSelectedPlayer(player);
  };

  const handleContactViaEmail = (email: string) => {
    if (!email) {
      toast.error("Contacto de e-mail ainda nao configurado para este anuncio.");
      return;
    }

    window.location.href = `mailto:${email}`;
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="rounded-lg border-l-8 border-primary bg-card p-8 shadow-lg">
          <h1 className="mb-2 text-4xl font-display font-bold uppercase text-foreground">
            T&amp;M <span className="text-primary">Recrutamento</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            A ligacao perfeita entre talento e oportunidade. Encontre a sua proxima equipa ou o jogador que falta para a sua equipa.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {user?.role === "treinador" ? (
              <>
                <TabsTrigger value="recrutamento" className="gap-2">
                  <Trophy className="h-4 w-4" /> Procurar Jogadores
                </TabsTrigger>
                <TabsTrigger value="candidaturas" className="gap-2">
                  <Users className="h-4 w-4" /> Candidaturas Recebidas
                </TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="candidaturas" className="gap-2">
                  <Trophy className="h-4 w-4" /> Procurar Equipas
                </TabsTrigger>
                <TabsTrigger value="minhas-candidaturas" className="gap-2">
                  <Send className="h-4 w-4" /> Minhas Candidaturas
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {user?.role === "treinador" && (
            <TabsContent value="recrutamento" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold">Jogadores Disponiveis</h2>
                <Button onClick={() => setShowCreateVacancy(!showCreateVacancy)} className="gap-2">
                  <Plus className="h-4 w-4" /> Criar Anuncio de Vaga
                </Button>
              </div>

              {showCreateVacancy && (
                <Card className="border-2 border-primary bg-card">
                  <CardHeader>
                    <CardTitle>Criar Anuncio de Vaga</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Desporto</label>
                      <select
                        name="sport"
                        value={vacancyForm.sport}
                        onChange={handleVacancyInputChange}
                        className="mt-1 w-full rounded border bg-background p-2"
                      >
                        <option value="futebol">Futebol</option>
                        <option value="basquete">Basquete</option>
                        <option value="volei">Volei</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Posicao Procurada</label>
                      <input
                        type="text"
                        name="position"
                        value={vacancyForm.position}
                        onChange={handleVacancyInputChange}
                        className="mt-1 w-full rounded border bg-background p-2"
                        placeholder="ex: Armador"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Nivel</label>
                      <select
                        name="level"
                        value={vacancyForm.level}
                        onChange={handleVacancyInputChange}
                        className="mt-1 w-full rounded border bg-background p-2"
                      >
                        <option value="iniciante">Iniciante</option>
                        <option value="intermediario">Intermedio</option>
                        <option value="avancado">Avancado</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Cidade</label>
                      <input
                        type="text"
                        name="city"
                        value={vacancyForm.city}
                        onChange={handleVacancyInputChange}
                        className="mt-1 w-full rounded border bg-background p-2"
                        placeholder="ex: Lisboa"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Descricao da Vaga</label>
                      <textarea
                        name="description"
                        value={vacancyForm.description}
                        onChange={handleVacancyInputChange}
                        className="mt-1 min-h-20 w-full rounded border bg-background p-2"
                        placeholder="Descreva a oportunidade..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateVacancy} className="flex-1" disabled={isSavingVacancy}>
                        {isSavingVacancy ? "A guardar..." : "Criar"}
                      </Button>
                      <Button onClick={() => setShowCreateVacancy(false)} variant="outline" className="flex-1">
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {playersSeekingTeams.map((player) => (
                  <Card key={player.id} className="transition-colors hover:border-primary">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="mb-2 text-lg font-display font-bold">{player.name}</h3>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>Desporto: <strong>{player.sport}</strong></p>
                            <p>Posicao: <strong>{player.position}</strong></p>
                            <p>Nivel: <strong>{player.level}</strong></p>
                            <p>Idade: <strong>{player.age}</strong> | Cidade: <strong>{player.city}</strong></p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button onClick={() => handleViewProfile(player.id)} variant="outline" size="sm">
                            Ver Perfil
                          </Button>
                          <Button onClick={() => handleContactViaEmail(player.email)} size="sm" className="gap-2">
                            <Mail className="h-4 w-4" /> Contactar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}

          {user?.role === "treinador" && (
            <TabsContent value="candidaturas" className="space-y-6">
              <h2 className="text-2xl font-display font-bold">Candidaturas Recebidas</h2>
              <div className="grid gap-4">
                {receivedApplications.length > 0 ? (
                  receivedApplications.map((app) => (
                    <Card
                      key={app.id}
                      className={
                        app.status === "aceite"
                          ? "border-green-500"
                          : app.status === "rejeitado"
                            ? "border-red-500"
                            : ""
                      }
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <h3 className="text-lg font-display font-bold">{app.name}</h3>
                              <span
                                className={`rounded px-2 py-1 text-xs font-bold ${
                                  app.status === "aceite"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : app.status === "rejeitado"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                }`}
                              >
                                {app.status === "aceite"
                                  ? "Aceite"
                                  : app.status === "rejeitado"
                                    ? "Rejeitado"
                                    : "Pendente"}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>Desporto: <strong>{app.sport}</strong> | Posicao: <strong>{app.position}</strong></p>
                              <p className="italic">"{app.message}"</p>
                              <p>E-mail: <strong>{app.email}</strong></p>
                            </div>
                          </div>
                          {app.status === "pendente" && (
                            <div className="flex flex-col gap-2">
                              <Button onClick={() => handleAcceptApplication(app.id)} size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                                <Check className="h-4 w-4" /> Aceitar
                              </Button>
                              <Button onClick={() => handleRejectApplication(app.id)} size="sm" variant="outline" className="gap-2">
                                <X className="h-4 w-4" /> Rejeitar
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      Nenhuma candidatura recebida.
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          )}

          {user?.role === "atleta" && (
            <TabsContent value="candidaturas" className="space-y-6">
              <h2 className="text-2xl font-display font-bold">Equipas Procurando Jogadores</h2>
              <div className="grid gap-4">
                {teamsSeekingPlayers.length > 0 ? (
                  teamsSeekingPlayers.map((team) => (
                    <Card key={team.id} className="transition-colors hover:border-primary">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="mb-2 text-lg font-display font-bold">{team.name}</h3>
                            <div className="mb-3 space-y-2 text-sm text-muted-foreground">
                              <p>Desporto: <strong>{team.sport}</strong> | Posicao: <strong>{team.position}</strong></p>
                              <p>Nivel: <strong>{team.level}</strong> | Cidade: <strong>{team.city}</strong></p>
                              <p className="mt-2 italic">"{team.description}"</p>
                            </div>
                          </div>
                          <Button onClick={() => setSelectedTeam(team.id)} className="gap-2">
                            Candidatar-se
                          </Button>
                        </div>

                        {selectedTeam === team.id && (
                          <div className="mt-6 space-y-4 border-t pt-6">
                            <textarea
                              value={candidatureMessage}
                              onChange={(e) => setCandidatureMessage(e.target.value)}
                              placeholder="Escreva uma mensagem de candidatura..."
                              className="min-h-20 w-full rounded border bg-background p-2"
                            />
                            <div className="flex gap-2">
                              <Button onClick={() => handleSendCandidature(team.id)} className="flex-1">
                                Enviar Candidatura
                              </Button>
                              <Button onClick={() => setSelectedTeam(null)} variant="outline" className="flex-1">
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      Ainda nao existem vagas publicadas.
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          )}

          {user?.role === "atleta" && (
            <TabsContent value="minhas-candidaturas" className="space-y-6">
              <h2 className="text-2xl font-display font-bold">Minhas Candidaturas</h2>
              <div className="grid gap-4">
                {myApplications.length > 0 ? (
                  myApplications.map((app) => (
                    <Card
                      key={app.id}
                      className={
                        app.status === "aceite"
                          ? "border-green-500"
                          : app.status === "rejeitado"
                            ? "border-red-500"
                            : ""
                      }
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <h3 className="text-lg font-display font-bold">{app.name}</h3>
                              <span
                                className={`rounded px-2 py-1 text-xs font-bold ${
                                  app.status === "aceite"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : app.status === "rejeitado"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                }`}
                              >
                                {app.status === "aceite"
                                  ? "Aceite"
                                  : app.status === "rejeitado"
                                    ? "Rejeitado"
                                    : "Pendente"}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>Posicao: <strong>{app.position}</strong></p>
                              <p>Mensagem: <em>"{app.message}"</em></p>
                            </div>
                          </div>
                          <Button onClick={() => handleContactViaEmail(app.email)} size="sm" className="gap-2">
                            <Mail className="h-4 w-4" /> Contactar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      Ainda nao enviou nenhuma candidatura.
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>

        <Dialog
          open={!!selectedPlayer}
          onOpenChange={(open) => {
            if (!open) setSelectedPlayer(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedPlayer?.name}</DialogTitle>
              <DialogDescription>
                Perfil do jogador integrado no T&amp;M.
              </DialogDescription>
            </DialogHeader>

            {selectedPlayer && (
              <div className="grid gap-3 rounded-lg border border-border bg-card/50 p-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Desporto</span>
                  <span className="font-semibold text-foreground">{selectedPlayer.sport}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Posicao</span>
                  <span className="font-semibold text-foreground">{selectedPlayer.position}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Nivel</span>
                  <span className="font-semibold text-foreground">{selectedPlayer.level}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Idade</span>
                  <span className="font-semibold text-foreground">{selectedPlayer.age} anos</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Cidade</span>
                  <span className="font-semibold text-foreground">{selectedPlayer.city}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">E-mail</span>
                  <span className="font-semibold text-foreground">{selectedPlayer.email}</span>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedPlayer(null)}>
                Fechar
              </Button>
              {selectedPlayer?.email && (
                <Button className="gap-2" onClick={() => handleContactViaEmail(selectedPlayer.email)}>
                  <Mail className="h-4 w-4" /> Contactar
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
