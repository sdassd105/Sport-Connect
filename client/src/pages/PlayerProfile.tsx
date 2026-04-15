import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Camera,
  Check,
  Edit2,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

type FormState = {
  name: string;
  email: string;
  role: "atleta" | "treinador";
  profilePhoto?: string;
  sport: string;
  position: string;
  age: string;
  yearsOfExperience: string;
  objective: string;
  specialty: string;
  bio: string;
  teamManaged: string;
  trainerCertification: string;
};

export default function PlayerProfile() {
  const { user: authUser, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selectedTeamPlayerId, setSelectedTeamPlayerId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormState>({
    name: authUser?.name || "",
    email: authUser?.email || "",
    role: authUser?.role || "atleta",
    profilePhoto: authUser?.profilePhoto || undefined,
    sport: "",
    position: "",
    age: "",
    yearsOfExperience: "",
    objective: "",
    specialty: "",
    bio: "",
    teamManaged: "",
    trainerCertification: authUser?.trainerCertification || "",
  });

  useEffect(() => {
    if (!authUser) return;
    const currentUser = authUser;

    let cancelled = false;

    async function loadProfile() {
      try {
        const [userBasics, playerProfile] = await Promise.all([
          trpc.profile.getUserBasics.query({ userId: currentUser.id }),
          trpc.profile.getPlayerProfile.query({ userId: currentUser.id }),
        ]);

        if (cancelled) return;

        setFormData((prev) => ({
          ...prev,
          name: userBasics?.name ?? currentUser.name ?? "",
          email: userBasics?.email ?? currentUser.email ?? "",
          role: currentUser.role,
          profilePhoto: userBasics?.profilePhoto ?? currentUser.profilePhoto ?? undefined,
          sport: playerProfile?.sport ?? "",
          position: playerProfile?.position ?? "",
          age: playerProfile?.age ? String(playerProfile.age) : "",
          yearsOfExperience: playerProfile?.yearsOfExperience
            ? String(playerProfile.yearsOfExperience)
            : "",
          objective: playerProfile?.objective ?? "",
          specialty: playerProfile?.specialty ?? "",
          bio: playerProfile?.bio ?? "",
        }));
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Nao foi possivel carregar o perfil.";
          setLoadError(message);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [authUser]);

  const applications = [
    {
      id: 1,
      name: "Lucas 'Spider'",
      sport: "Basquete",
      position: "Armador",
      message: "Gostaria de fazer um teste na equipa!",
    },
    {
      id: 2,
      name: "Marcos Gol",
      sport: "Futebol",
      position: "Guarda-redes",
      message: "Tenho experiencia em torneios regionais.",
    },
  ];

  const teamPlayers = [
    {
      id: 1,
      name: "Joao Santos",
      position: "Defesa Central",
      sport: "Futebol",
      age: 28,
      status: "Ativo",
      photo:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
      bio: "Defesa forte no jogo aereo, com boa leitura tática e liderança dentro de campo.",
      experience: "8 anos",
      preferredFoot: "Direito",
    },
    {
      id: 2,
      name: "Ana Costa",
      position: "Ponta",
      sport: "Volei",
      age: 22,
      status: "Ativo",
      photo:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
      bio: "Ponta explosiva, forte no um contra um e com boa capacidade de finalizacao.",
      experience: "5 anos",
      preferredFoot: "Destro",
    },
    {
      id: 3,
      name: "Miguel Oliveira",
      position: "Medio",
      sport: "Futebol",
      age: 26,
      status: "Lesionado",
      photo:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80",
      bio: "Medio organizador, bom passe longo e excelente controlo do ritmo de jogo.",
      experience: "7 anos",
      preferredFoot: "Esquerdo",
    },
  ];

  const handlePhotoClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um ficheiro de imagem valido.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, profilePhoto: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!authUser) return;

    if (!formData.name || !formData.email) {
      alert("Por favor, preencha o nome e e-mail.");
      return;
    }

    setIsSaving(true);
    setLoadError("");

    try {
      const updatedUser = await trpc.profile.updateUserBasics.mutate({
        id: authUser.id,
        name: formData.name,
        email: formData.email,
        profilePhoto: formData.profilePhoto ?? null,
      });

      if (formData.sport) {
        await trpc.profile.updatePlayerProfile.mutate({
          userId: authUser.id,
          position: formData.position || undefined,
          sport: formData.sport as "futebol" | "basquete" | "volei",
          yearsOfExperience: formData.yearsOfExperience
            ? Number(formData.yearsOfExperience)
            : undefined,
          objective:
            formData.objective === "profissional" || formData.objective === "amador"
              ? formData.objective
              : undefined,
          specialty: formData.specialty || undefined,
          age: formData.age ? Number(formData.age) : undefined,
          bio: formData.bio || undefined,
        });
      }

      updateUser({
        ...authUser,
        name: updatedUser.name ?? formData.name,
        email: updatedUser.email ?? formData.email,
        profilePhoto: updatedUser.profilePhoto ?? formData.profilePhoto,
        bio: formData.bio,
        trainerCertification: formData.trainerCertification,
      });

      setIsEditing(false);
      alert("Perfil guardado com sucesso.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel guardar o perfil.";
      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleTeamPlayerDetails = (playerId: number) => {
    setSelectedTeamPlayerId((current) => (current === playerId ? null : playerId));
  };

  return (
    <Layout>
      <div className="space-y-8 mx-auto max-w-6xl">
        <div className="relative overflow-hidden gap-8 border-b-4 border-primary bg-card p-8 md:flex md:flex-row md:items-center">
          <div className="group relative cursor-pointer" onClick={handlePhotoClick}>
            {formData.profilePhoto ? (
              <img
                src={formData.profilePhoto}
                alt={formData.name}
                className="h-40 w-40 rounded-lg border-4 border-primary object-cover shadow-2xl transition-all group-hover:brightness-50"
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-lg border-4 border-dashed border-primary bg-muted transition-all group-hover:brightness-50">
                <Camera className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            {isEditing && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-8 w-8 text-white" />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h1 className="text-4xl font-display font-bold">{formData.name || "Seu Nome"}</h1>
              {authUser?.role === "treinador" && authUser?.trainerVerified && (
                <ShieldCheck className="h-8 w-8 text-green-500" />
              )}
            </div>
            <p className="mb-4 text-muted-foreground">{formData.email}</p>
            <div className="flex gap-2">
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                  <Edit2 className="h-4 w-4" /> Editar Perfil
                </Button>
              )}
              {isEditing && (
                <>
                  <Button onClick={handleSave} className="gap-2" disabled={isSaving}>
                    <Save className="h-4 w-4" /> {isSaving ? "A guardar..." : "Guardar"}
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" disabled={isSaving}>
                    Cancelar
                  </Button>
                </>
              )}
            </div>
            {loadError && <p className="mt-3 text-sm text-red-600">{loadError}</p>}
          </div>
        </div>

        <Tabs defaultValue={authUser?.role === "treinador" ? "team" : "info"} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informacoes</TabsTrigger>
            {authUser?.role === "treinador" ? (
              <>
                <TabsTrigger value="team">Minha Equipa</TabsTrigger>
                <TabsTrigger value="applications">Candidaturas</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="applications">Minhas Candidaturas</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informacoes Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Nome Completo</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mt-1 w-full rounded border bg-background p-2 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">E-mail</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mt-1 w-full rounded border bg-background p-2 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Idade</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mt-1 w-full rounded border bg-background p-2 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Desporto</label>
                    <select
                      name="sport"
                      value={formData.sport}
                      onChange={handleChange}
                      disabled={!isEditing || authUser?.role !== "atleta"}
                      className="mt-1 w-full rounded border bg-background p-2 disabled:opacity-50"
                    >
                      <option value="">Selecione um desporto</option>
                      <option value="futebol">Futebol</option>
                      <option value="basquete">Basquete</option>
                      <option value="volei">Volei</option>
                    </select>
                  </div>
                </div>

                {authUser?.role === "atleta" && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Posicao</label>
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="ex: Avancado, Defesa"
                        className="mt-1 w-full rounded border bg-background p-2 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Anos de Experiencia</label>
                      <input
                        type="number"
                        name="yearsOfExperience"
                        value={formData.yearsOfExperience}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="mt-1 w-full rounded border bg-background p-2 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Objectivo</label>
                      <select
                        name="objective"
                        value={formData.objective}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="mt-1 w-full rounded border bg-background p-2 disabled:opacity-50"
                      >
                        <option value="">Selecione um objectivo</option>
                        <option value="profissional">Profissional</option>
                        <option value="amador">Amador</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Especialidade</label>
                      <input
                        type="text"
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="ex: Velocidade, Finalizacao"
                        className="mt-1 w-full rounded border bg-background p-2 disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}

                {authUser?.role === "treinador" && (
                  <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Desporto</label>
                        <select
                          name="sport"
                          value={formData.sport}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="mt-1 w-full rounded border bg-background p-2 disabled:opacity-50"
                        >
                          <option value="">Selecione um desporto</option>
                          <option value="futebol">Futebol</option>
                          <option value="basquete">Basquete</option>
                          <option value="volei">Volei</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Anos de Experiencia</label>
                        <input
                          type="number"
                          name="yearsOfExperience"
                          value={formData.yearsOfExperience}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="mt-1 w-full rounded border bg-background p-2 disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Equipa Gerida</label>
                        <input
                          type="text"
                          name="teamManaged"
                          value={formData.teamManaged}
                          onChange={handleChange}
                          disabled
                          placeholder="Ainda nao persistido na base"
                          className="mt-1 w-full rounded border bg-background p-2 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-500" />
                        <div className="flex-1">
                          <h4 className="mb-2 font-semibold text-yellow-900 dark:text-yellow-200">
                            Verificacao de Treinador
                          </h4>
                          <p className="mb-3 text-sm text-yellow-800 dark:text-yellow-300">
                            O que ja fica guardado na base e nome, e-mail, foto, desporto, anos de
                            experiencia e bio. Os campos de equipa e certificacao ainda nao estao
                            persistidos na base atual.
                          </p>
                          <input
                            type="text"
                            name="trainerCertification"
                            value={formData.trainerCertification}
                            onChange={handleChange}
                            disabled
                            placeholder="Ainda nao persistido na base"
                            className="w-full rounded border bg-background p-2 text-sm disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-sm font-medium">Bio / Descricao</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Descreva-se em poucas palavras..."
                    className="mt-1 min-h-24 w-full rounded border bg-background p-2 disabled:opacity-50"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {authUser?.role === "treinador" && (
            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Jogadores da Equipa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamPlayers.map((player) => (
                      <div key={player.id} className="rounded-lg border">
                        <button
                          type="button"
                          onClick={() => toggleTeamPlayerDetails(player.id)}
                          className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/30"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={player.photo}
                              alt={player.name}
                              className="h-14 w-14 rounded-full border-2 border-primary object-cover"
                            />
                            <div>
                              <p className="font-semibold">{player.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {player.position} â€¢ {player.age} anos
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Desporto: <span className="font-medium text-foreground">{player.sport}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded px-3 py-1 text-sm font-medium ${
                                player.status === "Ativo"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}
                            >
                              {player.status}
                            </span>
                          </div>
                        </button>

                        {selectedTeamPlayerId === player.id && (
                          <div className="border-t bg-muted/20 p-4">
                            <div className="grid gap-4 md:grid-cols-3">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                  Experiencia
                                </p>
                                <p className="mt-1 text-sm">{player.experience}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                  Pe Preferido
                                </p>
                                <p className="mt-1 text-sm">{player.preferredFoot}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                  Estado
                                </p>
                                <p className="mt-1 text-sm">{player.status}</p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                Perfil do Jogador
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">{player.bio}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {authUser?.role === "treinador" ? "Candidaturas Recebidas" : "Minhas Candidaturas"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex-1">
                        <p className="font-semibold">{app.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.sport} â€¢ {app.position}
                        </p>
                        <p className="mt-2 text-sm">"{app.message}"</p>
                      </div>
                      {authUser?.role === "treinador" && (
                        <div className="flex gap-2">
                          <Button size="sm" className="gap-1">
                            <Check className="h-4 w-4" /> Aceitar
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1">
                            <X className="h-4 w-4" /> Rejeitar
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

