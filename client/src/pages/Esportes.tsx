import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, Calendar, Plus, Trophy, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Tournament {
  id: number;
  title: string;
  sport: "futebol" | "basquete" | "volei";
  date: string;
  location: string;
  type: "Torneio" | "Competicao" | "Circuito";
  maxTeams: number;
  registeredTeams: number;
}

interface Location {
  id: number;
  name: string;
  sport: "futebol" | "basquete" | "volei";
  address: string;
  city: string;
  distance: string;
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
  const [selectedSport, setSelectedSport] = useState<"futebol" | "basquete" | "volei">("futebol");
  const [showCreateTournament, setShowCreateTournament] = useState(false);
  const [showGameDetails, setShowGameDetails] = useState<number | null>(null);
  const [userConfirmations, setUserConfirmations] = useState<Record<number, boolean>>({});

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const locations: Location[] = [];
  const [amateurGames] = useState<AmateurGame[]>([]);

  const [newTournament, setNewTournament] = useState({
    title: "",
    date: "",
    location: "",
    maxTeams: 16,
  });

  const filteredTournaments = tournaments.filter((t) => t.sport === selectedSport);
  const filteredLocations = locations.filter((l) => l.sport === selectedSport);
  const filteredAmateurGames = amateurGames.filter((g) => g.sport === selectedSport);

  const handleCreateTournament = () => {
    if (newTournament.title && newTournament.date && newTournament.location) {
      const newId = Math.max(...tournaments.map((t) => t.id), 0) + 1;
      setTournaments([
        ...tournaments,
        {
          id: newId,
          title: newTournament.title,
          sport: selectedSport,
          date: newTournament.date,
          location: newTournament.location,
          type: "Torneio",
          maxTeams: newTournament.maxTeams,
          registeredTeams: 0,
        },
      ]);
      setNewTournament({ title: "", date: "", location: "", maxTeams: 16 });
      setShowCreateTournament(false);
      alert("Torneio criado com sucesso!");
    } else {
      alert("Por favor, preencha todos os campos.");
    }
  };

  const handleConfirmAmateurGame = (gameId: number) => {
    setUserConfirmations({ ...userConfirmations, [gameId]: true });
    alert("Confirmado! Voce esta registado para este jogo.");
  };

  const handleCancelAmateurGame = (gameId: number) => {
    setUserConfirmations({ ...userConfirmations, [gameId]: false });
    alert("Cancelado! Voce foi removido da lista de jogadores.");
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
                          <h3 className="mb-2 text-lg font-display font-bold">{tournament.title}</h3>
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
                              Tipo: <strong>{tournament.type}</strong>
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
                              <MapPin className="h-4 w-4" /> {location.address}
                            </div>
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4" /> {location.city}
                            </div>
                            <div className="text-xs">Distancia: {location.distance}</div>
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
            <h2 className="text-2xl font-display font-bold">Jogos Amadores</h2>
            <div className="grid gap-4">
              {filteredAmateurGames.length > 0 ? (
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
                          {selectedSport === "futebol" && (
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
