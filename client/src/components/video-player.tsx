import { useRef, useEffect, useState } from "react";
import { ExternalLink, Expand, Info, Heart, Play, Pause, Volume2, RotateCcw, ChevronLeft, ChevronRight, LogOut, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Channel } from "@/lib/xtream-api";

// Import HLS.js dynamically
declare global {
  interface Window {
    Hls: any;
  }
}

interface VideoPlayerProps {
  currentChannel?: Channel;
  onLogout: () => void;
}

export function VideoPlayer({ currentChannel, onLogout }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showControls, setShowControls] = useState(false);
  const [hlsLoaded, setHlsLoaded] = useState(false);
  const { toast } = useToast();

  // Load HLS.js
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.4.12/dist/hls.min.js';
    script.onload = () => {
      setHlsLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Handle video source changes
  useEffect(() => {
    if (!currentChannel || !hlsLoaded || !videoRef.current) return;

    const video = videoRef.current;
    setIsLoading(true);
    setHasError(false);
    setErrorMessage("");

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: false,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      
      hlsRef.current = hls;

      hls.on(window.Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(currentChannel.streamUrl);
      });

      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(err => {
          console.error("Auto-play failed:", err);
          setIsLoading(false);
        });
      });

      hls.on(window.Hls.Events.ERROR, (event: any, data: any) => {
        console.error("HLS Error:", data);
        setIsLoading(false);
        setHasError(true);
        
        if (data.fatal) {
          switch (data.type) {
            case window.Hls.ErrorTypes.NETWORK_ERROR:
              setErrorMessage("Erro de rede - Verifique sua conexão");
              break;
            case window.Hls.ErrorTypes.MEDIA_ERROR:
              setErrorMessage("Erro de mídia - Formato não suportado");
              break;
            default:
              setErrorMessage("Erro desconhecido ao carregar o stream");
              break;
          }
        }
      });

      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = currentChannel.streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().catch(err => {
          console.error("Auto-play failed:", err);
          setIsLoading(false);
        });
      });
    } else {
      setHasError(true);
      setErrorMessage("HLS não suportado neste navegador");
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentChannel, hlsLoaded]);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setHasError(true);
      setErrorMessage("Erro ao reproduzir o vídeo");
      setIsLoading(false);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (video !== document.pictureInPictureElement) {
        await video.requestPictureInPicture();
        toast({
          title: "Picture-in-Picture ativado",
        });
      } else {
        await document.exitPictureInPicture();
        toast({
          title: "Picture-in-Picture desativado",
        });
      }
    } catch (error) {
      toast({
        title: "Picture-in-Picture não suportado",
        variant: "destructive",
      });
    }
  };

  const retryStream = () => {
    if (currentChannel && hlsLoaded) {
      setHasError(false);
      setErrorMessage("");
      // Trigger re-render by updating a dependency
      const video = videoRef.current;
      if (video) {
        video.load();
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-border overflow-hidden" data-testid="video-player-container">
        {/* Player Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-foreground" data-testid="text-current-channel-name">
                {currentChannel ? currentChannel.name : "Selecione um canal"}
              </h4>
              <p className="text-sm text-muted-foreground" data-testid="text-current-channel-description">
                {currentChannel 
                  ? `${currentChannel.categoryName || "Entretenimento"} • Ao vivo`
                  : "Escolha um canal da lista para começar a assistir"
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="secondary"
                className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                title="Informações"
                data-testid="button-channel-info"
              >
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                title="Favoritos"
                data-testid="button-channel-favorite"
              >
                <Heart className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>

        {/* Video Player Container */}
        <div 
          className="relative bg-black aspect-video"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <video
            ref={videoRef}
            className="hls-video w-full h-full"
            controls={false}
            playsInline
            data-testid="video-element"
          />

          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center" data-testid="loading-overlay">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-white">Carregando stream...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center" data-testid="error-overlay">
              <div className="text-center p-8">
                <AlertTriangle className="text-destructive text-4xl mb-4 mx-auto" />
                <h3 className="text-white text-xl mb-2">Erro ao carregar o stream</h3>
                <p className="text-gray-300 mb-4">{errorMessage || "Verifique sua conexão ou tente outro canal"}</p>
                <Button
                  onClick={retryStream}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  data-testid="button-retry-stream"
                >
                  Tentar Novamente
                </Button>
              </div>
            </div>
          )}

          {/* Custom Controls Overlay */}
          {showControls && !isLoading && !hasError && currentChannel && (
            <div className="absolute bottom-0 left-0 right-0 video-overlay p-4 transition-opacity">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={togglePlayPause}
                    className="hover:text-primary transition-colors p-1"
                    data-testid="button-play-pause"
                  >
                    {isPlaying ? <Pause className="text-xl" /> : <Play className="text-xl" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:text-primary transition-colors p-1"
                    data-testid="button-volume"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">00:00 / Live</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Select defaultValue="auto">
                    <SelectTrigger className="bg-black/50 border border-white/20 text-white text-sm w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="480p">480p</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={togglePiP}
                    className="p-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors"
                    title="Picture in Picture"
                    data-testid="button-pip"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:text-primary transition-colors p-1"
                    data-testid="button-fullscreen"
                  >
                    <Expand className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Player Footer */}
        {currentChannel && (
          <div className="p-4 bg-secondary/20">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="flex items-center text-green-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  AO VIVO
                </span>
                <span className="text-muted-foreground">Qualidade: HD 1080p</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <span>Streaming</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Additional Controls */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          variant="secondary"
          className="bg-secondary hover:bg-secondary/80 text-secondary-foreground p-3 rounded-lg transition-all text-center"
          data-testid="button-previous-channel"
        >
          <ChevronLeft className="mb-2 text-xl mx-auto" />
          <div className="text-sm">Canal Anterior</div>
        </Button>
        
        <Button
          variant="secondary"
          className="bg-secondary hover:bg-secondary/80 text-secondary-foreground p-3 rounded-lg transition-all text-center"
          data-testid="button-next-channel"
        >
          <ChevronRight className="mb-2 text-xl mx-auto" />
          <div className="text-sm">Próximo Canal</div>
        </Button>
        
        <Button
          variant="secondary"
          onClick={retryStream}
          disabled={!currentChannel}
          className="bg-secondary hover:bg-secondary/80 text-secondary-foreground p-3 rounded-lg transition-all text-center"
          data-testid="button-reload-stream"
        >
          <RotateCcw className="mb-2 text-xl mx-auto" />
          <div className="text-sm">Recarregar</div>
        </Button>
        
        <Button
          variant="destructive"
          onClick={onLogout}
          className="bg-destructive hover:bg-destructive/80 text-destructive-foreground p-3 rounded-lg transition-all text-center"
          data-testid="button-logout"
        >
          <LogOut className="mb-2 text-xl mx-auto" />
          <div className="text-sm">Sair</div>
        </Button>
      </div>
    </div>
  );
}
