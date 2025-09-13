import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tv, Film, PlayCircle } from "lucide-react";
import { ChannelList } from "@/components/channel-list";
import { MoviesList } from "./movies-list";
import { SeriesList } from "./series-list";
import type { ContentType, Playable } from "@/lib/xtream-api";

interface ContentTabsProps {
  sessionId: string;
  onContentSelect: (content: Playable) => void;
  selectedContentId?: string;
}

export function ContentTabs({ sessionId, onContentSelect, selectedContentId }: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<ContentType>('live');

  return (
    <div className="w-full" data-testid="content-tabs">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContentType)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger 
            value="live" 
            className="flex items-center space-x-2"
            data-testid="tab-live"
          >
            <Tv className="h-4 w-4" />
            <span>TV ao Vivo</span>
          </TabsTrigger>
          <TabsTrigger 
            value="movies" 
            className="flex items-center space-x-2"
            data-testid="tab-movies"
          >
            <Film className="h-4 w-4" />
            <span>Filmes</span>
          </TabsTrigger>
          <TabsTrigger 
            value="series" 
            className="flex items-center space-x-2"
            data-testid="tab-series"
          >
            <PlayCircle className="h-4 w-4" />
            <span>Séries</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-0">
          <ChannelList 
            sessionId={sessionId}
            onChannelSelect={onContentSelect}
            selectedChannelId={selectedContentId}
          />
        </TabsContent>

        <TabsContent value="movies" className="mt-0">
          <MoviesList 
            sessionId={sessionId}
            onMovieSelect={onContentSelect}
            selectedMovieId={selectedContentId}
          />
        </TabsContent>

        <TabsContent value="series" className="mt-0">
          <SeriesList 
            sessionId={sessionId}
            onEpisodeSelect={onContentSelect}
            selectedSeriesId={selectedContentId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}