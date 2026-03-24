import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, ArrowRight } from "lucide-react";

interface NewsCardProps {
  title: string;
  category: "Futebol" | "Basquete" | "Vôlei" | "Geral";
  image: string;
  date: string;
  excerpt: string;
  featured?: boolean;
  className?: string;
}

export default function NewsCard({ title, category, image, date, excerpt, featured = false, className }: NewsCardProps) {
  const categoryColor = {
    "Futebol": "text-soccer border-soccer",
    "Basquete": "text-basketball border-basketball",
    "Vôlei": "text-volleyball border-volleyball",
    "Geral": "text-primary border-primary"
  };

  const categoryBg = {
    "Futebol": "bg-soccer",
    "Basquete": "bg-basketball",
    "Vôlei": "bg-volleyball",
    "Geral": "bg-primary"
  };

  return (
    <Card className={cn(
      "group overflow-hidden border-0 bg-card rounded-none transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 flex flex-col h-full",
      featured ? "md:col-span-2 md:row-span-2" : "",
      className
    )}>
      <div className="relative overflow-hidden aspect-video w-full">
        <div className={cn(
          "absolute top-4 left-4 z-10 px-3 py-1 font-display font-bold uppercase text-xs tracking-wider text-black transform -skew-x-12",
          categoryBg[category]
        )}>
          {category}
        </div>
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" />
      </div>
      
      <CardHeader className="p-6 pb-2 flex-grow relative">
        <div className="flex items-center text-xs text-muted-foreground mb-3 font-sans">
          <Clock className="w-3 h-3 mr-1" />
          {date}
        </div>
        <h3 className={cn(
          "font-display font-bold uppercase leading-none tracking-tight text-foreground group-hover:text-primary transition-colors",
          featured ? "text-4xl mb-4" : "text-2xl mb-2"
        )}>
          {title}
        </h3>
      </CardHeader>
      
      <CardContent className="p-6 pt-0 pb-4">
        <p className="text-muted-foreground font-sans text-sm line-clamp-3 leading-relaxed">
          {excerpt}
        </p>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 mt-auto">
        <button className="flex items-center text-sm font-bold uppercase tracking-widest text-primary group-hover:translate-x-2 transition-transform duration-300">
          Ler Mais <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </CardFooter>
    </Card>
  );
}
