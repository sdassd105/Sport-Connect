import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, Calendar, Plus, Trophy, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  loadStoredTournaments,
  nextTournamentId,
  saveStoredTournaments,
  type StoredTournament,
} from "@/services/tournamentStorage";

interface Location {
  id: number;
  name: string;
  city: string;
  modalities: string;
}

interface AmateurGame {
  id: number;
  title: string;
  sport: "futebol" | "basquete" | "volei";
  date: string;
  location: string;
  maxPlayers: number;
  registeredPlayers: number;
  organizer: string;
  confirmed?: boolean;
}

export default function Esportes() {
  const { user } = useAuth();
  const [selectedSport, setSelectedSport] = useState<"futebol" | "basquete" | "volei">("futebol");
  const [showCreateTournament, setShowCreateTournament] = useState(false);
  const [showCreateAmateurGame, setShowCreateAmateurGame] = useState(false);
  const [showGameDetails, setShowGameDetails] = useState<number | null>(null);
  const [userConfirmations, setUserConfirmations] = useState<Record<number, boolean>>({});

  const [tournaments, setTournaments] = useState<StoredTournament[]>([]);
  const locations: Location[] = [
    {
      id: 1,
      name: "Pavilhao Multidesportos Dr. Mario Mexia",
      city: "Coimbra",
      modalities: "Basquetebol e Ginastica",
    },
    {
      id: 2,
      name: "Pavilhao Desportivo Municipal da Povoa de Varzim",
      city: "Povoa de Varzim",
      modalities: "Futsal e Andebol",
    },
    {
      id: 3,
      name: "Pavilhao Desportivo Municipal de Sines",
      city: "Sines",
      modalities: "Futsal (acolhe muitas fases finais)",
    },
    {
      id: 4,
      name: "Pavilhao Carlos Lopes",
      city: "Lisboa",
      modalities: "Atletismo e eventos corporativos",
    },
    {
      id: 5,
      name: "Pavilhao das Goladas",
      city: "Braga",
      modalities: "Hoquei em Patins (HC Braga)",
    },
    {
      id: 6,
      name: "Pavilhao Municipal de Barcelos",
      city: "Barcelos",
      modalities: "Hoquei em Patins e Futsal",
    },
    {
      id: 7,
      name: "Pavilhao dos Barreiros",
      city: "Funchal, Madeira",
      modalities: "Varias modalidades regionais",
    },
    {
      id: 8,
      name: "Pavilhao do Arade",
      city: "Portimao, Algarve",
      modalities: "Eventos e desportos indoor",
    },
    {
      id: 9,
      name: "Pavilhao Gimnodesportivo de Sesimbra",
      city: "Sesimbra",
      modalities: "Hoquei em Patins e Patinagem",
    },
  ];
  const [amateurGames, setAmateurGames] = useState<AmateurGame[]>([]);
  const [isLoadingAmateurGames, setIsLoadingAmateurGames] = useState(false);
  const [isSavingAmateurGame, setIsSavingAmateurGame] = useState(false);

  const [newTournament, setNewTournament] = useState({
    title: "",
    date: "",
    location: "",
    maxTeams: 16,
  });

  const [newAmateurGame, setNewAmateurGame] = useState({
    title: "",
    date: "",
    location: "",
    maxPlayers: 10,
    skillLevel: "intermediario" as "iniciante" | "intermediario" | "avancado",
    description: "",
  });

  useEffect(() => {
    setTournaments(loadStoredTournaments());
  }, []);

  useEffect(() => {
    saveStoredTournaments(tournaments);
  }, [tournaments]);

  useEffect(() => {
    let cancelled = false;

    async function loadGames() {
      setIsLoadingAmateurGames(true);

      try {
        const games = await trpc.sports.getGamesBySport.query({ sport: selectedSport });
        if (cancelled) return;

        setAmateurGames(
          games.map((game) => ({
            id: game.id,
            title: game.title,
            sport: game.sport,
            date: new Date(game.gameDate).toLocaleString("pt-PT"),
            location: game.customLocation ?? "Local nao informado",
            maxPlayers: game.maxPlayers ?? 0,
            registeredPlayers: 0,
            organizer:
              user && game.createdBy === user.id
                ? user.name ?? "Voce"
                : `Utilizador ${game.createdBy}`,
          }))
        );
      } catch (error) {
        console.error("Erro ao carregar jogos amadores:", error);
        if (!cancelled) toast.error("Nao foi possivel carregar os jogos amadores.");
      } finally {
        if (!cancelled) setIsLoadingAmateurGames(false);
      }
    }

    loadGames();

    return () => {
      cancelled = true;
    };
  }, [selectedSport, user?.id, user?.name]);

  const filteredTournaments = tournaments.filter((t) => t.sport === selectedSport);
  const filteredLocations = locations;
  const filteredAmateurGames = amateurGames.filter((g) => g.sport === selectedSport);

  const handleCreateTournament = () => {
    if (newTournament.title && newTournament.date && newTournament.location) {
      const newId = nextTournamentId(tournaments);
      setTournaments([
        ...tournaments,
        {
          id: newId,
          name: newTournament.title,
          sport: selectedSport,
          date: newTournament.date,
          location: newTournament.location,
          address: newTournament.location,
          type: "amador",
          maxTeams: newTournament.maxTeams,
          registeredTeams: 0,
          createdAt: new Date().toISOString(),
        },
      ]);
      setNewTournament({ title: "", date: "", location: "", maxTeams: 16 });
      setShowCreateTournament(false);
      toast.success("Torneio criado com sucesso!");
    } else {
      toast.error("Por favor, preencha todos os campos.");
    }
  };

  const handleCreateAmateurGame = async () => {
    if (!user) {
      toast.error("Precisa iniciar sessao para criar um jogo.");
      return;
    }

    if (!newAmateurGame.title || !newAmateurGame.date || !newAmateurGame.location) {
      toast.error("Preencha nome, data/hora e local do jogo.");
      return;
    }

    setIsSavingAmateurGame(true);

    try {
      const createdGame = await trpc.sports.createGame.mutate({
        createdBy: user.id,
        sport: selectedSport,
        title: newAmateurGame.title,
        description: newAmateurGame.description ? newAmateurGame.description : undefined,
        customLocation: newAmateurGame.location,
        gameDate: new Date(newAmateurGame.date),
        maxPlayers: newAmateurGame.maxPlayers,
        skillLevel: newAmateurGame.skillLevel,
      });

      setAmateurGames((current) => [
        {
          id: createdGame.id,
          title: createdGame.title,
          sport: createdGame.sport,
          date: new Date(createdGame.gameDate).toLocaleString("pt-PT"),
          location: createdGame.customLocation ?? newAmateurGame.location,
          maxPlayers: createdGame.maxPlayers ?? newAmateurGame.maxPlayers,
          registeredPlayers: 0,
          organizer: user.name ?? "Voce",
        },
        ...current,
      ]);

      setNewAmateurGame({
        title: "",
        date: "",
        location: "",
        maxPlayers: 10,
        skillLevel: "intermediario",
        description: "",
      });
      setShowCreateAmateurGame(false);
      toast.success("Jogo amador criado e salvo na base de dados.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel criar o jogo amador.";
      toast.error(message);
    } finally {
      setIsSavingAmateurGame(false);
    }
  };

  const handleConfirmAmateurGame = (gameId: number) => {
    setUserConfirmations({ ...userConfirmations, [gameId]: true });
    toast.success("Confirmado! Voce esta registado para este jogo.");
  };

  const handleCancelAmateurGame = (gameId: number) => {
    setUserConfirmations({ ...userConfirmations, [gameId]: false });
    toast.success("Cancelado! Voce foi removido da lista de jogadores.");
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b-2 border-border pb-6">
          <h1 className="text-4xl font-display font-bold uppercase">
            Desportos em <span className="text-primary">Portugal</span>
          </h1>
        </div>

        <div className="flex flex-wrap gap-4">
          {(["futebol", "basquete", "volei"] as const).map((sport) => (
            <Button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              variant={selectedSport === sport ? "default" : "outline"}
              className="uppercase font-display"
            >
              {sport === "futebol" ? "Futebol" : sport === "basquete" ? "Basquete" : "Volei"}
            </Button>
          ))}
        </div>

        <Tabs defaultValue="torneios" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="torneios">Torneios</TabsTrigger>
            <TabsTrigger value="locais">Locais</TabsTrigger>
            <TabsTrigger value="amador">Jogos Amadores</TabsTrigger>
          </TabsList>

          <TabsContent value="torneios" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold">Torneios Disponiveis</h2>
              <Button onClick={() => setShowCreateTournament(!showCreateTournament)} className="gap-2">
                <Plus className="h-4 w-4" /> Criar Torneio
              </Button>
            </div>

            {showCreateTournament && (
              <Card className="border-2 border-primary bg-card">
                <CardHeader>
                  <CardTitle>Criar Novo Torneio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome do Torneio</label>
                    <input
                      type="text"
                      value={newTournament.title}
                      onChange={(e) => setNewTournament({ ...newTournament, title: e.target.value })}
                      className="mt-1 w-full rounded border bg-background p-2"
                      placeholder="ex: Campeonato de Futebol 2026"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data e Hora</label>
                    <input
                      type="datetime-local"
                      value={newTournament.date}
                      onChange={(e) => setNewTournament({ ...newTournament, date: e.target.value })}
                      className="mt-1 w-full rounded border bg-background p-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Local / Endereco</label>
                    <input
                      type="text"
                      value={newTournament.location}
                      onChange={(e) => setNewTournament({ ...newTournament, location: e.target.value })}
                      className="mt-1 w-full rounded border bg-background p-2"
                      placeholder="ex: Pavilhao Municipal, Rua X, Lisboa"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateTournament} className="flex-1">
                      Criar
                    </Button>
                    <Button onClick={() => setShowCreateTournament(false)} variant="outline" className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {filteredTournaments.length > 0 ? (
                filteredTournaments.map((tournament) => (
                  <Card key={tournament.id} className="transition-colors hover:border-primary">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="mb-2 text-lg font-display font-bold">{tournament.name}</h3>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" /> {tournament.date}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" /> {tournament.location}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" /> {tournament.registeredTeams}/{tournament.maxTeams} equipas
                            </div>
                          </div>
                        </div>
                        <Button onClick={() => setShowGameDetails(tournament.id)} className="gap-2">
                          Detalhe <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      {showGameDetails === tournament.id && (
                        <div className="mt-6 space-y-4 border-t pt-6">
                          <div className="rounded-lg bg-primary/10 p-4">
                            <h4 className="mb-2 font-semibold">Informacoes Completas</h4>
                            <p className="text-sm">
                              Tipo: <strong>{tournament.type === "profissional" ? "Profissional" : "Amador"}</strong>
                            </p>
                            <p className="text-sm">
                              Vagas Disponiveis: <strong>{tournament.maxTeams - tournament.registeredTeams}</strong>
                            </p>
                            <p className="mt-4 text-sm">Para se inscrever, contacte o organizador do torneio.</p>
                          </div>
                          <Button onClick={() => setShowGameDetails(null)} variant="outline" className="w-full">
                            Fechar Detalhes
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Nenhum torneio disponivel para {selectedSport}.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="locais" className="space-y-6">
            <h2 className="text-2xl font-display font-bold">Locais para Praticar</h2>
            <div className="grid gap-4">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((location) => (
                  <Card key={location.id} className="transition-colors hover:border-primary">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="mb-2 text-lg font-display font-bold">{location.name}</h3>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" /> {location.city}
                            </div>
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4" /> {location.modalities}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Nenhum local disponivel por enquanto.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="amador" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold">Jogos Amadores</h2>
              <Button onClick={() => setShowCreateAmateurGame(!showCreateAmateurGame)} className="gap-2">
                <Plus className="h-4 w-4" /> Criar Jogo Amador
              </Button>
            </div>

            {showCreateAmateurGame && (
              <Card className="border-2 border-primary bg-card">
                <CardHeader>
                  <CardTitle>Criar Jogo Amador</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome do Jogo</label>
                    <input
                      type="text"
                      value={newAmateurGame.title}
                      onChange={(e) => setNewAmateurGame({ ...newAmateurGame, title: e.target.value })}
                      className="mt-1 w-full rounded border bg-background p-2"
                      placeholder="ex: Pelada de sexta"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data e Hora</label>
                    <input
                      type="datetime-local"
                      value={newAmateurGame.date}
                      onChange={(e) => setNewAmateurGame({ ...newAmateurGame, date: e.target.value })}
                      className="mt-1 w-full rounded border bg-background p-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Local / Endereco</label>
                    <input
                      type="text"
                      value={newAmateurGame.location}
                      onChange={(e) => setNewAmateurGame({ ...newAmateurGame, location: e.target.value })}
                      className="mt-1 w-full rounded border bg-background p-2"
                      placeholder="ex: Campo Sintetico do Bairro"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Max. Jogadores</label>
                      <input
                        type="number"
                        min={2}
                        value={newAmateurGame.maxPlayers}
                        onChange={(e) =>
                          setNewAmateurGame({
                            ...newAmateurGame,
                            maxPlayers: Number(e.target.value || 0),
                          })
                        }
                        className="mt-1 w-full rounded border bg-background p-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Nivel</label>
                      <select
                        value={newAmateurGame.skillLevel}
                        onChange={(e) =>
                          setNewAmateurGame({
                            ...newAmateurGame,
                            skillLevel: e.target.value as typeof newAmateurGame.skillLevel,
                          })
                        }
                        className="mt-1 w-full rounded border bg-background p-2"
                      >
                        <option value="iniciante">Iniciante</option>
                        <option value="intermediario">Intermedio</option>
                        <option value="avancado">Avancado</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descricao (opcional)</label>
                    <textarea
                      value={newAmateurGame.description}
                      onChange={(e) => setNewAmateurGame({ ...newAmateurGame, description: e.target.value })}
                      className="mt-1 min-h-20 w-full rounded border bg-background p-2"
                      placeholder="Regras, nivel, o que levar, etc."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateAmateurGame} className="flex-1" disabled={isSavingAmateurGame}>
                      {isSavingAmateurGame ? "A guardar..." : "Criar"}
                    </Button>
                    <Button onClick={() => setShowCreateAmateurGame(false)} variant="outline" className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {isLoadingAmateurGames ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    A carregar jogos amadores...
                  </CardContent>
                </Card>
              ) : filteredAmateurGames.length > 0 ? (
                filteredAmateurGames.map((game) => (
                  <Card
                    key={game.id}
                    className={`transition-colors hover:border-primary ${userConfirmations[game.id] ? "border-green-500" : ""}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="mb-2 text-lg font-display font-bold">{game.title}</h3>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" /> {game.date}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" /> {game.location}
                            </div>
                            <div className="text-xs">
                              Organizador: <strong>{game.organizer}</strong>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {game.maxPlayers > 0 && (
                            <div className="mb-4 text-sm font-semibold">
                              {game.registeredPlayers}/{game.maxPlayers} Jogadores
                            </div>
                          )}
                          {userConfirmations[game.id] ? <div className="mb-2 font-semibold text-green-500">Confirmado</div> : null}
                          <div className="flex gap-2">
                            <Button onClick={() => handleConfirmAmateurGame(game.id)} size="sm" className="gap-1">
                              Quero Jogar
                            </Button>
                            {userConfirmations[game.id] && (
                              <Button onClick={() => handleCancelAmateurGame(game.id)} size="sm" variant="outline">
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Nenhum jogo amador disponivel por enquanto.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
