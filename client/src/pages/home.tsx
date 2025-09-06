import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Tv, HelpCircle, Shield, Key, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { xtreamApi, type Channel } from "@/lib/xtream-api";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { LoginForm } from "@/components/login-form";
import { ChannelList } from "@/components/channel-list";
import { VideoPlayer } from "@/components/video-player";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [userInfo, setUserInfo] = useState<any>(null);
  const [serverInfo, setServerInfo] = useState<any>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | undefined>();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: () => xtreamApi.logout(sessionId),
    onSuccess: () => {
      setIsLoggedIn(false);
      setSessionId("");
      setUserInfo(null);
      setServerInfo(null);
      setSelectedChannel(undefined);
      
      // Clear all cached data
      queryClient.clear();
      
      toast({
        title: "Desconectado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao fazer logout",
        variant: "destructive",
      });
    },
  });

  const handleLoginSuccess = (newSessionId: string, newUserInfo: any, newServerInfo: any) => {
    setSessionId(newSessionId);
    setUserInfo(newUserInfo);
    setServerInfo(newServerInfo);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    toast({
      title: "Canal selecionado",
      description: channel.name,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Tv className="text-primary-foreground text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">IPTV Player</h1>
                <p className="text-muted-foreground text-sm">Streaming de Qualidade</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-help"
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Ajuda</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <DisclaimerBanner />

        {!isLoggedIn ? (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Channel List */}
              <div className="lg:col-span-1">
                <ChannelList
                  sessionId={sessionId}
                  onChannelSelect={handleChannelSelect}
                  selectedChannelId={selectedChannel?.id}
                />
              </div>

              {/* Video Player */}
              <div className="lg:col-span-2">
                <VideoPlayer
                  currentChannel={selectedChannel}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          </div>
        )}

        {/* Service Information Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-border">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-primary text-xl" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Apenas um Player</h3>
                <p className="text-muted-foreground text-sm">
                  Este serviço é apenas um reprodutor de mídia. <strong>NÃO VENDEMOS</strong> nem fornecemos listas IPTV ou qualquer conteúdo.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="text-primary text-xl" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Credenciais Necessárias</h3>
                <p className="text-muted-foreground text-sm">
                  Você precisa adquirir suas próprias credenciais de um provedor IPTV autorizado.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="text-primary text-xl" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Suporte Técnico</h3>
                <p className="text-muted-foreground text-sm">
                  Para questões sobre conteúdo, entre em contato diretamente com seu provedor IPTV.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              © 2024 IPTV Web Player. Este é um reprodutor de mídia independente.
            </p>
            <p className="text-xs text-muted-foreground">
              Aviso Legal: Este software não fornece, cria ou distribui conteúdo de mídia. 
              É responsabilidade do usuário garantir que possui autorização legal para acessar qualquer conteúdo reproduzido.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
