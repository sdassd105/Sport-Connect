import { trpc } from "@/lib/trpc";

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content?: string;
  image: string;
  date: string;
  source: string;
  category: "futebol" | "basquete" | "volei" | "geral";
  url: string;
}

// Mapeamento de palavras-chave para categorização (ainda útil para o Make ou para categorização no frontend se necessário)
const CATEGORY_KEYWORDS = {
  futebol: ["futebol", "football", "soccer", "liga", "champions", "premier league", "laliga", "serie a", "ligue 1"],
  basquete: ["basquete", "basketball", "nba", "aba", "eurobasket"],
  volei: ["vôlei", "volei", "volleyball", "superliga", "nba"],
};

export function categorizeNews(title: string, description: string): "futebol" | "basquete" | "volei" | "geral" {
  const text = (title + " " + (description || "")).toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category as "futebol" | "basquete" | "volei" | "geral";
    }
  }
  
  return "geral";
}

export async function fetchSportsNews(): Promise<NewsArticle[]> {
  try {
    const news = await trpc.news.getNewsBySport.query({ sport: "geral" });
    return news;
  } catch (error) {
    console.error("Erro ao buscar notícias via tRPC:", error);
    return [];
  }
}

export async function fetchNewsByCategory(category: "futebol" | "basquete" | "volei"): Promise<NewsArticle[]> {
  try {
    const news = await trpc.news.getNewsBySport.query({ sport: category });
    return news;
  } catch (error) {
    console.error(`Erro ao buscar notícias de ${category} via tRPC:`, error);
    return [];
  }
}

// A função onNewsReceived não é mais necessária no frontend, pois o backend receberá do Make
// e o frontend buscará do DB via tRPC.
// A simulação de webhook foi removida.
