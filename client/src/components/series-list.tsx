import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, PlayCircle, Calendar, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { xtreamApi, type Series } from "@/lib/xtream-api";

interface SeriesListProps {
  sessionId: string;
  onSeriesSelect: (series: Series) => void;
  selectedSeriesId?: string;
}

export function SeriesList({ sessionId, onSeriesSelect, selectedSeriesId }: SeriesListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: seriesData, isLoading: seriesLoading } = useQuery({
    queryKey: ["/api/series", sessionId],
    queryFn: () => xtreamApi.getSeries(),
    enabled: !!sessionId,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["/api/series-categories", sessionId],
    queryFn: () => xtreamApi.getCategories('series'),
    enabled: !!sessionId,
  });

  const series = seriesData?.series || [];
  const categories = categoriesData?.categories || [];

  // Filter series based on search and category
  const filteredSeries = series.filter((serie) => {
    const matchesSearch = serie.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || serie.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (seriesLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando séries...</p>
        </div>
      </div>
    );
  }

  if (!seriesData?.success) {
    return (
      <div className="text-center py-16">
        <PlayCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Erro ao carregar séries</h3>
        <p className="text-muted-foreground">{seriesData?.error || "Tente novamente mais tarde"}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" data-testid="series-list">
      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar séries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-series"
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

      {/* Series Grid */}
      <ScrollArea className="flex-1">
        {filteredSeries.length === 0 ? (
          <div className="text-center py-16">
            <PlayCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma série encontrada</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Tente um termo de busca diferente" : "Nenhuma série disponível nesta categoria"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSeries.map((serie) => (
              <Card
                key={serie.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedSeriesId === serie.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => onSeriesSelect(serie)}
                data-testid={`series-card-${serie.id}`}
              >
                <CardContent className="p-4">
                  {/* Series Poster */}
                  <div className="aspect-[2/3] mb-3 bg-muted rounded-lg overflow-hidden">
                    {serie.logo ? (
                      <img
                        src={serie.logo}
                        alt={serie.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${serie.logo ? 'hidden' : ''}`}>
                      <PlayCircle className="h-12 w-12 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Series Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm line-clamp-2" title={serie.name}>
                      {serie.name}
                    </h3>
                    
                    {serie.releaseDate && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{serie.releaseDate}</span>
                      </div>
                    )}

                    {serie.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-muted-foreground">{serie.rating}</span>
                      </div>
                    )}

                    {serie.genre && (
                      <Badge variant="secondary" className="text-xs">
                        {serie.genre}
                      </Badge>
                    )}

                    {serie.plot && (
                      <p className="text-xs text-muted-foreground line-clamp-2" title={serie.plot}>
                        {serie.plot}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Series Count */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        {filteredSeries.length} de {series.length} séries
      </div>
    </div>
  );
}