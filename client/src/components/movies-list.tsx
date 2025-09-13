import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Film, Clock, Calendar, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { xtreamApi, type Movie } from "@/lib/xtream-api";

interface MoviesListProps {
  sessionId: string;
  onMovieSelect: (movie: Movie) => void;
  selectedMovieId?: string;
}

export function MoviesList({ sessionId, onMovieSelect, selectedMovieId }: MoviesListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: moviesData, isLoading: moviesLoading } = useQuery({
    queryKey: ["/api/movies", sessionId],
    queryFn: () => xtreamApi.getMovies(),
    enabled: !!sessionId,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["/api/movie-categories", sessionId],
    queryFn: () => xtreamApi.getCategories('movies'),
    enabled: !!sessionId,
  });

  const movies = moviesData?.movies || [];
  const categories = categoriesData?.categories || [];

  // Filter movies based on search and category
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || movie.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (moviesLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando filmes...</p>
        </div>
      </div>
    );
  }

  if (!moviesData?.success) {
    return (
      <div className="text-center py-16">
        <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Erro ao carregar filmes</h3>
        <p className="text-muted-foreground">{moviesData?.error || "Tente novamente mais tarde"}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" data-testid="movies-list">
      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar filmes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-movies"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
            data-testid="category-all"
          >
            Todos
          </Button>
          {categories.map((category) => (
            <Button
              key={category.category_id}
              variant={selectedCategory === category.category_id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.category_id)}
              data-testid={`category-${category.category_id}`}
            >
              {category.category_name}
            </Button>
          ))}
        </div>
      </div>

      {/* Movies Grid */}
      <ScrollArea className="flex-1">
        {filteredMovies.length === 0 ? (
          <div className="text-center py-16">
            <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum filme encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Tente um termo de busca diferente" : "Nenhum filme disponível nesta categoria"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMovies.map((movie) => (
              <Card
                key={movie.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedMovieId === movie.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => onMovieSelect(movie)}
                data-testid={`movie-card-${movie.id}`}
              >
                <CardContent className="p-4">
                  {/* Movie Poster */}
                  <div className="aspect-[2/3] mb-3 bg-muted rounded-lg overflow-hidden">
                    {movie.logo ? (
                      <img
                        src={movie.logo}
                        alt={movie.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${movie.logo ? 'hidden' : ''}`}>
                      <Film className="h-12 w-12 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Movie Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm line-clamp-2" title={movie.name}>
                      {movie.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {movie.releaseDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{movie.releaseDate}</span>
                        </div>
                      )}
                      {movie.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{movie.duration}</span>
                        </div>
                      )}
                    </div>

                    {movie.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-muted-foreground">{movie.rating}</span>
                      </div>
                    )}

                    {movie.genre && (
                      <Badge variant="secondary" className="text-xs">
                        {movie.genre}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Movies Count */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        {filteredMovies.length} de {movies.length} filmes
      </div>
    </div>
  );
}