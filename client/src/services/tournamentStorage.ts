export type TournamentSport = "futebol" | "basquete" | "volei";
export type TournamentType = "amador" | "profissional";

export type StoredTournament = {
  id: number;
  name: string;
  sport: TournamentSport;
  type: TournamentType;
  date: string;
  location: string;
  address: string;
  maxTeams: number;
  registeredTeams: number;
  organizer?: string;
  createdAt: string;
};

const STORAGE_KEY = "sportconnect_tournaments";

export function loadStoredTournaments(): StoredTournament[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredTournaments(tournaments: StoredTournament[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tournaments));
}

export function nextTournamentId(tournaments: StoredTournament[]) {
  return Math.max(0, ...tournaments.map((tournament) => tournament.id)) + 1;
}
