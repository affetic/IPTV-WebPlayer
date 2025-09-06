import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, Server, User, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { xtreamApi } from "@/lib/xtream-api";
import { xtreamAuthSchema, type XtreamAuth } from "@shared/schema";

interface LoginFormProps {
  onLoginSuccess: (sessionId: string, userInfo: any, serverInfo: any) => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const { toast } = useToast();
  
  const form = useForm<XtreamAuth>({
    resolver: zodResolver(xtreamAuthSchema),
    defaultValues: {
      host: "",
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: xtreamApi.authenticate,
    onSuccess: (data) => {
      if (data.success && data.sessionId && data.userInfo && data.serverInfo) {
        toast({
          title: "Conectado com sucesso!",
          description: "Carregando canais...",
        });
        onLoginSuccess(data.sessionId, data.userInfo, data.serverInfo);
      } else {
        toast({
          title: "Erro na autenticação",
          description: data.error || "Credenciais inválidas",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar ao servidor. Verifique as credenciais e tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: XtreamAuth) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="max-w-md mx-auto animate-slide-up" data-testid="login-section">
      <Card className="border border-border shadow-xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-primary text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Acesse sua conta</h2>
            <p className="text-muted-foreground">Entre com suas credenciais Xtream Codes</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm font-medium text-foreground">
                      <Server className="mr-2 h-4 w-4" />
                      Servidor Host
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="http://seu-servidor.com:8080"
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                        data-testid="input-host"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm font-medium text-foreground">
                      <User className="mr-2 h-4 w-4" />
                      Nome de usuário
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Seu usuário"
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                        data-testid="input-username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm font-medium text-foreground">
                      <Lock className="mr-2 h-4 w-4" />
                      Senha
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Sua senha"
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                        data-testid="input-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105 focus:ring-2 focus:ring-ring"
                data-testid="button-login"
              >
                <LogIn className="mr-2 h-4 w-4" />
                {loginMutation.isPending ? "Conectando..." : "Entrar"}
              </Button>
            </form>
          </Form>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              Não possui uma conta?{" "}
              <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                Entre em contato com seu provedor IPTV
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
