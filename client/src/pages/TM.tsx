import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Shield, MessageSquare, Trophy, Users, Send, Mail, Check, X, Plus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

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

export default function TM() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(user?.role === "treinador" ? "recrutamento" : "candidaturas");
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [candidatureMessage, setCandidatureMessage] = useState("");
  const [showCreateVacancy, setShowCreateVacancy] = useState(false);

  // Jogadores procurando equipa
  const [playersSeekingTeams] = useState<Player[]>([
    { id: 1, name: "Lucas 'Spider'", sport: "Basquete", position: "Armador", level: "Avançado", age: 22, city: "Lisboa", email: "lucas@email.com" },
    { id: 2, name: "Ana Volley", sport: "Vôlei", position: "Levantadora", level: "Intermédio", age: 26, city: "Porto", email: "ana@email.com" },
    { id: 3, name: "Marcos Gol", sport: "Futebol", position: "Guarda-redes", level: "Profissional", age: 29, city: "Setúbal", email: "marcos@email.com" },
  ]);

  // Equipas procurando jogadores
  const [teamsSeekingPlayers] = useState<Team[]>([
    { 
      id: 1, 
      name: "Falcons BC", 
      sport: "Basquete", 
      position: "Pivot", 
      level: "Competitivo", 
      city: "Lisboa",
      description: "Equipa competitiva de basquete à procura de pivôs experientes. Treinos 3x por semana.",
      email: "falconsbc@email.com"
    },
    { 
      id: 2, 
      name: "Vila Nova FC", 
      sport: "Futebol", 
      position: "Defesa Central", 
      level: "Amador", 
      city: "Covilhã",
      description: "Equipa amadora de futebol com tradição. Procuramos defesas centrais para reforçar o plantel.",
      email: "vilanova@email.com"
    },
    { 
      id: 3, 
      name: "Smash Volei", 
      sport: "Vôlei", 
      position: "Ponta", 
      level: "Intermédio", 
      city: "Braga",
      description: "Clube de vôlei em crescimento. Buscamos pontas de qualidade para a próxima época.",
      email: "smashvolei@email.com"
    },
  ]);

  // Candidaturas recebidas (para Treinadores)
  const [receivedApplications, setReceivedApplications] = useState<Application[]>([
    { id: 1, name: "Lucas 'Spider'", sport: "Basquete", position: "Armador", message: "Gostaria de fazer um teste na equipa!", status: "pendente", email: "lucas@email.com" },
    { id: 2, name: "Marcos Gol", sport: "Futebol", position: "Guarda-redes", message: "Tenho experiência em torneios regionais.", status: "pendente", email: "marcos@email.com" },
  ]);

  // Minhas candidaturas (para Atletas)
  const [myApplications, setMyApplications] = useState<Application[]>([
    { id: 1, name: "Falcons BC", sport: "Basquete", position: "Armador", message: "Enviei candidatura para esta equipa.", status: "pendente", email: "falconsbc@email.com" },
  ]);

  const handleSendCandidature = (teamId: number) => {
    if (!candidatureMessage.trim()) {
      alert("⚠️ Por favor, escreva uma mensagem de candidatura.");
      return;
    }
    const team = teamsSeekingPlayers.find(t => t.id === teamId);
    if (team) {
      const newApp: Application = {
        id: myApplications.length + 1,
        name: team.name,
        sport: team.sport,
        position: team.position,
        message: candidatureMessage,
        status: "pendente",
        email: team.email,
      };
      setMyApplications([...myApplications, newApp]);
      alert(`✅ Candidatura enviada para ${team.name}!`);
      setCandidatureMessage("");
      setSelectedTeam(null);
    }
  };

  const handleAcceptApplication = (appId: number) => {
    setReceivedApplications(
      receivedApplications.map(app =>
        app.id === appId ? { ...app, status: "aceite" } : app
      )
    );
    alert("✅ Candidatura aceite com sucesso! O jogador foi notificado.");
  };

  const handleRejectApplication = (appId: number) => {
    setReceivedApplications(
      receivedApplications.map(app =>
        app.id === appId ? { ...app, status: "rejeitado" } : app
      )
    );
    alert("❌ Candidatura rejeitada.");
  };

  const handleViewProfile = (playerId: number) => {
    const player = playersSeekingTeams.find(p => p.id === playerId);
    if (player) {
      alert(`📋 Perfil de ${player.name}\n\nDesporto: ${player.sport}\nPosição: ${player.position}\nNível: ${player.level}\nIdade: ${player.age}\nCidade: ${player.city}\nE-mail: ${player.email}`);
    }
  };

  const handleContactViaEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-card border-l-8 border-primary p-8 shadow-lg rounded-lg">
          <h1 className="text-4xl font-display font-bold uppercase text-foreground mb-2">
            T&M <span className="text-primary">Recrutamento</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            A ligação perfeita entre talento e oportunidade. Encontre a sua próxima equipa ou o jogador que falta para a sua equipa.
          </p>
        </div>

        {/* Abas Diferenciadas por Tipo de Utilizador */}
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

          {/* Aba: Procurar Jogadores (Treinadores) */}
          {user?.role === "treinador" && (
            <TabsContent value="recrutamento" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-display font-bold">Jogadores Disponíveis</h2>
                <Button onClick={() => setShowCreateVacancy(!showCreateVacancy)} className="gap-2">
                  <Plus className="h-4 w-4" /> Criar Anúncio de Vaga
                </Button>
              </div>

              {/* Formulário de Criação de Vaga */}
              {showCreateVacancy && (
                <Card className="bg-card border-2 border-primary">
                  <CardHeader>
                    <CardTitle>Criar Anúncio de Vaga</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Posição Procurada</label>
                      <input type="text" className="w-full mt-1 p-2 border rounded bg-background" placeholder="ex: Armador" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Nível</label>
                      <select className="w-full mt-1 p-2 border rounded bg-background">
                        <option>Amador</option>
                        <option>Intermédio</option>
                        <option>Competitivo</option>
                        <option>Profissional</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Descrição da Vaga</label>
                      <textarea className="w-full mt-1 p-2 border rounded bg-background min-h-20" placeholder="Descreva a oportunidade..." />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => { setShowCreateVacancy(false); alert("✅ Anúncio criado com sucesso!"); }} className="flex-1">Criar</Button>
                      <Button onClick={() => setShowCreateVacancy(false)} variant="outline" className="flex-1">Cancelar</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lista de Jogadores */}
              <div className="grid gap-4">
                {playersSeekingTeams.map((player) => (
                  <Card key={player.id} className="hover:border-primary transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-display font-bold text-lg mb-2">{player.name}</h3>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>Desporto: <strong>{player.sport}</strong></p>
                            <p>Posição: <strong>{player.position}</strong></p>
                            <p>Nível: <strong>{player.level}</strong></p>
                            <p>Idade: <strong>{player.age}</strong> | Cidade: <strong>{player.city}</strong></p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button 
                            onClick={() => handleViewProfile(player.id)}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            Ver Perfil
                          </Button>
                          <Button 
                            onClick={() => handleContactViaEmail(player.email)}
                            size="sm"
                            className="gap-2"
                          >
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

          {/* Aba: Candidaturas Recebidas (Treinadores) */}
          {user?.role === "treinador" && (
            <TabsContent value="candidaturas" className="space-y-6">
              <h2 className="text-2xl font-display font-bold">Candidaturas Recebidas</h2>
              <div className="grid gap-4">
                {receivedApplications.length > 0 ? (
                  receivedApplications.map((app) => (
                    <Card key={app.id} className={`${app.status === "aceite" ? "border-green-500" : app.status === "rejeitado" ? "border-red-500" : ""}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-display font-bold text-lg">{app.name}</h3>
                              <span className={`text-xs font-bold px-2 py-1 rounded ${
                                app.status === "aceite" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                                app.status === "rejeitado" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              }`}>
                                {app.status === "aceite" ? "✅ Aceite" : app.status === "rejeitado" ? "❌ Rejeitado" : "⏳ Pendente"}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground mb-3">
                              <p>Desporto: <strong>{app.sport}</strong> | Posição: <strong>{app.position}</strong></p>
                              <p className="italic">"{app.message}"</p>
                              <p>E-mail: <strong>{app.email}</strong></p>
                            </div>
                          </div>
                          {app.status === "pendente" && (
                            <div className="flex flex-col gap-2">
                              <Button 
                                onClick={() => handleAcceptApplication(app.id)}
                                size="sm"
                                className="gap-2 bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4" /> Aceitar
                              </Button>
                              <Button 
                                onClick={() => handleRejectApplication(app.id)}
                                size="sm"
                                variant="outline"
                                className="gap-2"
                              >
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

          {/* Aba: Procurar Equipas (Atletas) */}
          {user?.role === "atleta" && (
            <TabsContent value="candidaturas" className="space-y-6">
              <h2 className="text-2xl font-display font-bold">Equipas Procurando Jogadores</h2>
              <div className="grid gap-4">
                {teamsSeekingPlayers.map((team) => (
                  <Card key={team.id} className="hover:border-primary transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-display font-bold text-lg mb-2">{team.name}</h3>
                          <div className="space-y-2 text-sm text-muted-foreground mb-3">
                            <p>Desporto: <strong>{team.sport}</strong> | Posição: <strong>{team.position}</strong></p>
                            <p>Nível: <strong>{team.level}</strong> | Cidade: <strong>{team.city}</strong></p>
                            <p className="mt-2 italic">"{team.description}"</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setSelectedTeam(team.id)}
                          className="gap-2"
                        >
                          Candidatar-se
                        </Button>
                      </div>

                      {/* Formulário de Candidatura */}
                      {selectedTeam === team.id && (
                        <div className="mt-6 pt-6 border-t space-y-4">
                          <textarea
                            value={candidatureMessage}
                            onChange={(e) => setCandidatureMessage(e.target.value)}
                            placeholder="Escreva uma mensagem de candidatura..."
                            className="w-full p-2 border rounded bg-background min-h-20"
                          />
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleSendCandidature(team.id)}
                              className="flex-1"
                            >
                              Enviar Candidatura
                            </Button>
                            <Button 
                              onClick={() => setSelectedTeam(null)}
                              variant="outline"
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}

          {/* Aba: Minhas Candidaturas (Atletas) */}
          {user?.role === "atleta" && (
            <TabsContent value="minhas-candidaturas" className="space-y-6">
              <h2 className="text-2xl font-display font-bold">Minhas Candidaturas</h2>
              <div className="grid gap-4">
                {myApplications.length > 0 ? (
                  myApplications.map((app) => (
                    <Card key={app.id} className={`${app.status === "aceite" ? "border-green-500" : app.status === "rejeitado" ? "border-red-500" : ""}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-display font-bold text-lg">{app.name}</h3>
                              <span className={`text-xs font-bold px-2 py-1 rounded ${
                                app.status === "aceite" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                                app.status === "rejeitado" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              }`}>
                                {app.status === "aceite" ? "✅ Aceite" : app.status === "rejeitado" ? "❌ Rejeitado" : "⏳ Pendente"}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>Posição: <strong>{app.position}</strong></p>
                              <p>Mensagem: <em>"{app.message}"</em></p>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleContactViaEmail(app.email)}
                            size="sm"
                            className="gap-2"
                          >
                            <Mail className="h-4 w-4" /> Contactar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      Ainda não enviou nenhuma candidatura.
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}
