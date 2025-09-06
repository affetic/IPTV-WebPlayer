import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { xtreamAuthSchema } from "@shared/schema";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // Xtream Codes authentication
  app.post("/api/auth/xtream", async (req, res) => {
    try {
      const { host, username, password } = xtreamAuthSchema.parse(req.body);
      
      // Clean host URL - remove trailing slash and ensure proper format
      const cleanHost = host.replace(/\/$/, '');
      
      // Test authentication with Xtream Codes API
      const authUrl = `${cleanHost}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
      
      try {
        const response = await axios.get(authUrl, { timeout: 10000 });
        
        if (response.data && response.data.user_info && response.data.server_info) {
          // Authentication successful
          const { user_info, server_info } = response.data;
          
          // Calculate expiration time
          let expiresAt = null;
          if (user_info.exp_date && user_info.exp_date !== null && user_info.exp_date !== "null") {
            expiresAt = new Date(parseInt(user_info.exp_date) * 1000);
          }
          
          // Store session
          const session = await storage.createXtreamSession({
            sessionId: `${username}_${Date.now()}`,
            host: cleanHost,
            username,
            password,
            userInfo: user_info,
            serverInfo: server_info,
            expiresAt,
          });
          
          res.json({
            success: true,
            sessionId: session.id,
            userInfo: user_info,
            serverInfo: server_info,
          });
        } else {
          res.status(401).json({
            success: false,
            error: "Credenciais inválidas ou servidor não encontrado"
          });
        }
      } catch (apiError) {
        console.error("Xtream API Error:", apiError);
        res.status(401).json({
          success: false,
          error: "Erro ao conectar com o servidor IPTV. Verifique as credenciais e tente novamente."
        });
      }
    } catch (error) {
      console.error("Auth error:", error);
      res.status(400).json({
        success: false,
        error: "Dados de entrada inválidos"
      });
    }
  });

  // Get live streams/channels
  app.get("/api/channels/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getXtreamSession(sessionId);
      
      if (!session || !session.isActive) {
        return res.status(401).json({
          success: false,
          error: "Sessão inválida ou expirada"
        });
      }

      // Check if channels are already cached
      const cachedChannels = await storage.getChannelsBySession(sessionId);
      if (cachedChannels.length > 0) {
        return res.json({
          success: true,
          channels: cachedChannels
        });
      }

      // Fetch channels from Xtream API
      const channelsUrl = `${session.host}/player_api.php?username=${encodeURIComponent(session.username)}&password=${encodeURIComponent(session.password)}&action=get_live_streams`;
      
      try {
        const response = await axios.get(channelsUrl, { timeout: 15000 });
        
        if (response.data && Array.isArray(response.data)) {
          // Transform and store channels
          const channels = response.data.map((stream: any) => ({
            sessionId,
            streamId: stream.stream_id?.toString() || '',
            name: stream.name || 'Canal sem nome',
            categoryId: stream.category_id?.toString() || '',
            categoryName: stream.category_name || 'Outros',
            streamUrl: `${session.host}/live/${session.username}/${session.password}/${stream.stream_id}.m3u8`,
            logo: stream.stream_icon || '',
            epgChannelId: stream.epg_channel_id || '',
            added: stream.added ? new Date(parseInt(stream.added) * 1000) : null,
            isNsfw: stream.is_adult === "1" || false,
          }));
          
          // Store in cache
          const storedChannels = await storage.createChannels(channels);
          
          res.json({
            success: true,
            channels: storedChannels
          });
        } else {
          res.status(500).json({
            success: false,
            error: "Formato de resposta inválido do servidor IPTV"
          });
        }
      } catch (apiError) {
        console.error("Channels API Error:", apiError);
        res.status(500).json({
          success: false,
          error: "Erro ao buscar canais do servidor IPTV"
        });
      }
    } catch (error) {
      console.error("Channels error:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno do servidor"
      });
    }
  });

  // Get categories
  app.get("/api/categories/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getXtreamSession(sessionId);
      
      if (!session || !session.isActive) {
        return res.status(401).json({
          success: false,
          error: "Sessão inválida ou expirada"
        });
      }

      const categoriesUrl = `${session.host}/player_api.php?username=${encodeURIComponent(session.username)}&password=${encodeURIComponent(session.password)}&action=get_live_categories`;
      
      try {
        const response = await axios.get(categoriesUrl, { timeout: 10000 });
        
        if (response.data && Array.isArray(response.data)) {
          res.json({
            success: true,
            categories: response.data
          });
        } else {
          res.json({
            success: true,
            categories: []
          });
        }
      } catch (apiError) {
        console.error("Categories API Error:", apiError);
        res.json({
          success: true,
          categories: []
        });
      }
    } catch (error) {
      console.error("Categories error:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno do servidor"
      });
    }
  });

  // Logout
  app.delete("/api/auth/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Delete channels cache
      await storage.deleteChannelsBySession(sessionId);
      
      // Delete session
      await storage.deleteXtreamSession(sessionId);
      
      res.json({
        success: true,
        message: "Logout realizado com sucesso"
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao fazer logout"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
