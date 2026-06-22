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

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler a imagem."));
    reader.onloadend = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(blob);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

async function compressImageToDataUrl(file: File): Promise<string> {
  // Base64 increases payload size (~33%). Keep the output small to avoid API/proxy limits.
  const MAX_DIMENSION = 512;
  const MAX_BYTES = 250 * 1024; // ~250KB (binary) => ~330KB after Base64 overhead

  // If the original file is already small, keep it as-is.
  if (file.size <= MAX_BYTES) return blobToDataUrl(file);

  const img = new Image();
  const objectUrl = URL.createObjectURL(file);
  img.src = objectUrl;

  try {
    await img.decode();
  } catch {
    URL.revokeObjectURL(objectUrl);
    // If decode fails, fall back to original (still might fail on save if it's too large).
    return blobToDataUrl(file);
  }
  URL.revokeObjectURL(objectUrl);

  const sourceWidth = img.naturalWidth || img.width;
  const sourceHeight = img.naturalHeight || img.height;

  const scale = Math.min(1, MAX_DIMENSION / Math.max(sourceWidth, sourceHeight));
  const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
  const targetHeight = Math.max(1, Math.round(sourceHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return blobToDataUrl(file);

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // JPEG compresses profile photos well and is universally supported.
  let quality = 0.82;
  let blob: Blob | null = null;

  for (let attempt = 0; attempt < 6; attempt++) {
    blob = await canvasToBlob(canvas, "image/jpeg", quality);
    if (blob && blob.size <= MAX_BYTES) break;
    quality = Math.max(0.5, quality - 0.1);
  }

  if (!blob) return blobToDataUrl(file);
  return blobToDataUrl(blob);
}

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

  const applications: Array<{
    id: number;
    name: string;
    sport: string;
    position: string;
    message: string;
  }> = [];

  const teamPlayers: Array<{
    id: number;
    name: string;
    position: string;
    sport: string;
    age: number;
    status: string;
    photo: string;
    bio: string;
    experience: string;
    preferredFoot: string;
  }> = [];

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

    // Compress before saving (prevents oversized JSON payloads and proxy failures).
    compressImageToDataUrl(file)
      .then((dataUrl) => {
        setFormData((prev) => ({ ...prev, profilePhoto: dataUrl }));
      })
      .catch((err) => {
        console.error(err);
        alert("Nao foi possivel processar a imagem. Tente outra foto.");
      });
  };

  const handleSave = async () => {
    if (!authUser) return;

    if (!formData.name || !formData.email) {
      alert("Por favor, preencha o nome e e-mail.");
      return;
    }

    // Extra guard: if the data URL is still too large, don't even try calling the API
    // (Vite proxy / hosting may reset the connection on oversized request bodies).
    if (formData.profilePhoto && formData.profilePhoto.length > 800_000) {
      alert("A foto esta muito grande. Escolha outra imagem (mais pequena) e tente novamente.");
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
      const rawMessage = error instanceof Error ? error.message : "";
      const message =
        rawMessage.includes("Unexpected end of JSON input") || rawMessage.includes("Failed to fetch")
          ? "Nao foi possivel guardar o perfil (API sem resposta). Se estiver a enviar uma foto, tente uma imagem menor e confirme se o backend esta online."
          : rawMessage || "Nao foi possivel guardar o perfil.";
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
                  {teamPlayers.length > 0 ? (
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
                                  {player.position} • {player.age} anos
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Desporto:{" "}
                                  <span className="font-medium text-foreground">{player.sport}</span>
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
                  ) : (
                    <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                      Nenhum jogador falso ou exemplo esta a ser mostrado aqui.
                    </div>
                  )}
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
                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex-1">
                          <p className="font-semibold">{app.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {app.sport} • {app.position}
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
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                    Sem candidaturas falsas ou de exemplo para mostrar.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

