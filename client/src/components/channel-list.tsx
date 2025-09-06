import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { xtreamApi, type Channel } from "@/lib/xtream-api";

interface ChannelListProps {
  sessionId: string;
  onChannelSelect: (channel: Channel) => void;
  selectedChannelId?: string;
}

export function ChannelList({ sessionId, onChannelSelect, selectedChannelId }: ChannelListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: channelsData, isLoading: channelsLoading } = useQuery({
    queryKey: ["/api/channels", sessionId],
    queryFn: () => xtreamApi.getChannels(sessionId),
    enabled: !!sessionId,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["/api/categories", sessionId],
    queryFn: () => xtreamApi.getCategories(sessionId),
    enabled: !!sessionId,
  });

  const channels = channelsData?.channels || [];
  const categories = categoriesData?.categories || [];

  const filteredChannels = useMemo(() => {
    return channels.filter(channel => {
      const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || channel.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [channels, searchTerm, selectedCategory]);

  const categoryTabs = [
    { id: "all", name: "Todos" },
    ...categories.map(cat => ({ id: cat.category_id, name: cat.category_name }))
  ];

  if (channelsLoading) {
    return (
      <Card className="border border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border" data-testid="channel-list-container">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground flex items-center">
            <Tv className="mr-2 text-primary" />
            Canais
          </h3>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              data-testid="button-search"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              data-testid="button-filter"
            >
              <Filter className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <Input
            type="text"
            placeholder="Buscar canais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
            data-testid="input-channel-search"
          />
        </div>

        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {categoryTabs.slice(0, 5).map(category => (
            <Button
              key={category.id}
              size="sm"
              variant={selectedCategory === category.id ? "default" : "secondary"}
              onClick={() => setSelectedCategory(category.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              }`}
              data-testid={`button-category-${category.id}`}
            >
              {category.name}
            </Button>
          ))}
        </div>

        <ScrollArea className="max-h-96 channel-list-scroll">
          <div className="space-y-2" data-testid="channel-list">
            {filteredChannels.length === 0 ? (
              <div className="text-center py-8">
                <Tv className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? "Nenhum canal encontrado" : "Nenhum canal disponível"}
                </p>
              </div>
            ) : (
              filteredChannels.map((channel) => (
                <div
                  key={channel.id}
                  className={`channel-card p-3 rounded-lg cursor-pointer transition-all ${
                    selectedChannelId === channel.id
                      ? "bg-primary/20 border border-primary"
                      : "bg-secondary/50 hover:bg-secondary"
                  }`}
                  onClick={() => onChannelSelect(channel)}
                  data-testid={`channel-item-${channel.streamId}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-8 bg-muted rounded flex items-center justify-center flex-shrink-0">
                      {channel.logo ? (
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <Tv className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate" data-testid={`text-channel-name-${channel.streamId}`}>
                        {channel.name}
                      </h4>
                      <p className="text-xs text-muted-foreground" data-testid={`text-channel-category-${channel.streamId}`}>
                        {channel.categoryName || "Outros"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">HD</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
