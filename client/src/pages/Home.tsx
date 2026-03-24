import Layout from "@/components/Layout";
import { fetchSportsNews } from "@/services/newsService";
import { Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  source: string;
  category: "futebol" | "basquete" | "volei" | "geral";
  url: string;
}

const DEMO_NEWS: NewsArticle[] = [
  {
    id: "1",
    title: "Benfica vence Sporting em classico emocionante",
    description:
      "O Benfica conquistou uma vitoria importante contra o Sporting no derbi lisboeta, com golo decisivo aos 87 minutos.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=450&fit=crop",
    date: "28 de Fevereiro de 2026",
    source: "Sport Connect",
    category: "futebol",
    url: "#",
  },
  {
    id: "2",
    title: "Selecao Portuguesa de Basquete em preparacao para Europeu",
    description:
      "A selecao portuguesa de basquete intensifica os treinos em preparacao para o Campeonato Europeu que se realiza em Junho.",
    image: "https://images.unsplash.com/photo-1546519638-68711109d298?w=800&h=450&fit=crop",
    date: "27 de Fevereiro de 2026",
    source: "Sport Connect",
    category: "basquete",
    url: "#",
  },
  {
    id: "3",
    title: "Superliga de Voleibol: Porto mantem lideranca",
    description:
      "O Futebol Clube do Porto reforca a sua posicao de lider na Superliga de Voleibol com mais uma vitoria convincente.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=450&fit=crop",
    date: "26 de Fevereiro de 2026",
    source: "Sport Connect",
    category: "volei",
    url: "#",
  },
  {
    id: "4",
    title: "Novo recorde de participacao em torneios amadores",
    description:
      "A plataforma Sport Connect regista um novo recorde de participacao em torneios amadores de futebol em Lisboa.",
    image: "https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=800&h=450&fit=crop",
    date: "25 de Fevereiro de 2026",
    source: "Sport Connect",
    category: "geral",
    url: "#",
  },
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=450&fit=crop";
const NEWS_REFRESH_INTERVAL_MS = 30000;
const FEATURED_ROTATION_INTERVAL_MS = 8000;

function getCategoryColor(category: string): string {
  switch (category) {
    case "futebol":
      return "text-green-500";
    case "basquete":
      return "text-orange-500";
    case "volei":
      return "text-blue-500";
    default:
      return "text-primary";
  }
}

function normalizeNews(article: NewsArticle): NewsArticle {
  return {
    ...article,
    image: article.image || FALLBACK_IMAGE,
    description: article.description || article.title,
    url: article.url || "#",
  };
}

function getSortableTimestamp(date: string): number {
  const parsed = Date.parse(date);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sortNewsByNewest(items: NewsArticle[]): NewsArticle[] {
  return [...items].sort((a, b) => getSortableTimestamp(b.date) - getSortableTimestamp(a.date));
}

export default function Home() {
  const [news, setNews] = useState<NewsArticle[]>(DEMO_NEWS);
  const [loading, setLoading] = useState(true);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadNews(isInitialLoad = false) {
      if (isInitialLoad) setLoading(true);
      try {
        const realNews = await fetchSportsNews();
        if (!cancelled && realNews.length > 0) {
          setNews(sortNewsByNewest(realNews.map(normalizeNews)));
        }
      } catch (error) {
        console.error("Erro ao carregar noticias:", error);
      } finally {
        if (!cancelled && isInitialLoad) setLoading(false);
      }
    }

    loadNews(true);
    const refreshId = window.setInterval(() => {
      loadNews(false);
    }, NEWS_REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(refreshId);
    };
  }, []);

  useEffect(() => {
    if (news.length <= 1) {
      setFeaturedIndex(0);
      return;
    }

    const rotationId = window.setInterval(() => {
      setFeaturedIndex((current) => (current + 1) % news.length);
    }, FEATURED_ROTATION_INTERVAL_MS);

    return () => {
      window.clearInterval(rotationId);
    };
  }, [news]);

  const featuredNews = news[featuredIndex] ?? news[0];
  const secondaryNews = news.length > 1 ? news[(featuredIndex + 1) % news.length] : undefined;
  const gridNews = news.filter((_, index) => index !== featuredIndex).slice(0, 4);

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Zap className="mx-auto mb-4 h-12 w-12 animate-pulse text-primary" />
            <p className="font-display uppercase text-muted-foreground">A carregar noticias...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-12">
        <section className="relative">
          <div className="mb-8 flex items-center gap-2">
            <Zap className="animate-pulse text-primary" />
            <h2 className="font-display text-2xl font-bold uppercase tracking-widest text-primary">
              Transmissao ao Vivo
            </h2>
          </div>

          {featuredNews && (
            <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="group cursor-pointer overflow-hidden rounded-lg">
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img
                      src={featuredNews.image}
                      alt={featuredNews.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent p-6">
                      <span className={`mb-2 text-xs font-bold uppercase ${getCategoryColor(featuredNews.category)}`}>
                        {featuredNews.category}
                      </span>
                      <h3 className="mb-2 font-display text-2xl font-bold text-white">{featuredNews.title}</h3>
                      <p className="text-sm text-gray-200">
                        {featuredNews.date} • {featuredNews.source}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="mb-4 flex items-center gap-2 font-display font-bold uppercase text-primary">
                    <Zap className="h-4 w-4" /> Tendencias
                  </h3>
                  <div className="space-y-4">
                    <p className="cursor-pointer text-sm font-medium transition-colors hover:text-primary">
                      #SuperligaVolei: Finais confirmadas para Marco
                    </p>
                    <p className="cursor-pointer text-sm font-medium transition-colors hover:text-primary">
                      #MercadoDaBola: Nova promessa portuguesa na Europa
                    </p>
                    <p className="cursor-pointer text-sm font-medium transition-colors hover:text-primary">
                      #BasquetePro: Selecao inicia treinos para o Mundial
                    </p>
                  </div>
                </div>

                {secondaryNews && (
                  <div className="group cursor-pointer overflow-hidden rounded-lg border border-border">
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img
                        src={secondaryNews.image}
                        alt={secondaryNews.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <span className={`text-xs font-bold uppercase ${getCategoryColor(secondaryNews.category)}`}>
                        {secondaryNews.category}
                      </span>
                      <h4 className="mt-2 line-clamp-2 font-display text-sm font-bold transition-colors group-hover:text-primary">
                        {secondaryNews.title}
                      </h4>
                      <p className="mt-2 text-xs text-muted-foreground">{secondaryNews.date}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <section>
          <div className="mb-8 flex items-center justify-between border-b-2 border-border pb-4">
            <h2 className="text-3xl font-display font-bold uppercase text-foreground">
              Cobertura <span className="text-primary">Global</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {gridNews.map((article) => (
              <div key={article.id} className="group cursor-pointer">
                <div className="relative mb-4 aspect-video overflow-hidden rounded-lg bg-muted">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <span className={`text-xs font-bold uppercase ${getCategoryColor(article.category)}`}>
                  {article.category}
                </span>
                <h4 className="mt-2 line-clamp-2 font-display text-base font-bold leading-tight transition-colors group-hover:text-primary">
                  {article.title}
                </h4>
                <p className="mt-2 text-xs text-muted-foreground">{article.date}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
