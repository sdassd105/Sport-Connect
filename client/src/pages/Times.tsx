import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users, Star } from "lucide-react";
import { useState } from "react";

export default function Times() {
  const [searchTerm, setSearchTerm] = useState("");

  const teams = [
    { id: 1, name: "Flamengo", sport: "Futebol", fans: "42M", titles: 58, color: "bg-red-600" },
    { id: 2, name: "Corinthians", sport: "Futebol", fans: "30M", titles: 45, color: "bg-slate-900" },
    { id: 3, name: "Lakers", sport: "Basquete", fans: "25M", titles: 17, color: "bg-yellow-500" },
    { id: 4, name: "Warriors", sport: "Basquete", fans: "18M", titles: 7, color: "bg-blue-600" },
    { id: 5, name: "Sada Cruzeiro", sport: "Vôlei", fans: "8M", titles: 35, color: "bg-blue-800" },
    { id: 6, name: "Minas Tênis", sport: "Vôlei", fans: "5M", titles: 22, color: "bg-blue-400" },
    { id: 7, name: "Palmeiras", sport: "Futebol", fans: "16M", titles: 52, color: "bg-green-600" },
    { id: 8, name: "São Paulo", sport: "Futebol", fans: "18M", titles: 48, color: "bg-red-700" },
  ];

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.sport.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold uppercase text-foreground mb-2">
            Times & <span className="text-primary">Elencos</span>
          </h1>
          <p className="text-muted-foreground font-sans">Encontre informações sobre suas equipes favoritas.</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="BUSCAR TIME OU ESPORTE..." 
            className="pl-10 bg-card border-border focus:border-primary font-display uppercase tracking-wide"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredTeams.map((team) => (
          <Card key={team.id} className="group border-0 bg-card hover:bg-accent/5 transition-colors duration-300">
            <CardHeader className="relative p-0 h-32 overflow-hidden">
              <div className={`absolute inset-0 ${team.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display font-bold text-4xl text-white uppercase tracking-tighter opacity-20 scale-150 select-none">
                  {team.name.substring(0, 3)}
                </span>
              </div>
              <div className="absolute bottom-4 left-4">
                <span className="bg-black/50 text-white px-2 py-1 text-xs font-bold uppercase rounded backdrop-blur-sm">
                  {team.sport}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="font-display font-bold text-2xl uppercase mb-4 group-hover:text-primary transition-colors">
                {team.name}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-bold">{team.fans}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-bold">{team.titles} Títulos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-20 bg-card border border-border border-dashed">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground text-lg font-display uppercase">Nenhum time encontrado</p>
        </div>
      )}
    </Layout>
  );
}
