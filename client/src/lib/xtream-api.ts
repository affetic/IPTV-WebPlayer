import type { XtreamAuth } from "@shared/schema";

export interface XtreamAuthResponse {
  success: boolean;
  sessionId?: string;
  userInfo?: any;
  serverInfo?: any;
  error?: string;
}

export interface Channel {
  id: string;
  sessionId: string;
  streamId: string;
  name: string;
  categoryId: string;
  categoryName: string;
  streamUrl: string;
  logo: string;
  epgChannelId: string;
  added: string | null;
  isNsfw: boolean;
}

export interface ChannelsResponse {
  success: boolean;
  channels?: Channel[];
  error?: string;
}

export interface Category {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface CategoriesResponse {
  success: boolean;
  categories?: Category[];
  error?: string;
}

// Store current session data
let currentSession: {
  host: string;
  username: string;
  password: string;
  userInfo: any;
  serverInfo: any;
} | null = null;

export const xtreamApi = {
  async authenticate(credentials: XtreamAuth): Promise<XtreamAuthResponse> {
    try {
      const { host, username, password } = credentials;
      const cleanHost = host.replace(/\/$/, '');
      
      // Make direct request from browser to bypass Cloudflare
      const authUrl = `${cleanHost}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
      
      const response = await fetch(authUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'VLC/3.0.11 LibVLC/3.0.11'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data && data.user_info && data.server_info) {
        // Store session data for future requests
        currentSession = {
          host: cleanHost,
          username,
          password,
          userInfo: data.user_info,
          serverInfo: data.server_info
        };

        return {
          success: true,
          sessionId: `${username}_${Date.now()}`,
          userInfo: data.user_info,
          serverInfo: data.server_info
        };
      } else {
        return {
          success: false,
          error: "Credenciais inválidas ou servidor não encontrado"
        };
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: `Erro ao conectar: ${error.message || 'Verifique suas credenciais e conexão'}`
      };
    }
  },

  async getChannels(): Promise<ChannelsResponse> {
    if (!currentSession) {
      return {
        success: false,
        error: "Sessão não encontrada. Faça login novamente."
      };
    }

    try {
      const channelsUrl = `${currentSession.host}/player_api.php?username=${encodeURIComponent(currentSession.username)}&password=${encodeURIComponent(currentSession.password)}&action=get_live_streams`;
      
      const response = await fetch(channelsUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'VLC/3.0.11 LibVLC/3.0.11'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        const channels = data.map((stream: any) => ({
          id: `channel_${stream.stream_id}`,
          sessionId: 'client_session',
          streamId: stream.stream_id?.toString() || '',
          name: stream.name || 'Canal sem nome',
          categoryId: stream.category_id?.toString() || '',
          categoryName: stream.category_name || 'Outros',
          streamUrl: `${currentSession!.host}/live/${currentSession!.username}/${currentSession!.password}/${stream.stream_id}.m3u8`,
          logo: stream.stream_icon || '',
          epgChannelId: stream.epg_channel_id || '',
          added: stream.added ? new Date(parseInt(stream.added) * 1000).toISOString() : null,
          isNsfw: stream.is_adult === "1"
        }));

        return {
          success: true,
          channels
        };
      } else {
        return {
          success: false,
          error: "Formato de resposta inválido do servidor IPTV"
        };
      }
    } catch (error: any) {
      console.error('Channels error:', error);
      return {
        success: false,
        error: `Erro ao buscar canais: ${error.message}`
      };
    }
  },

  async getCategories(): Promise<CategoriesResponse> {
    if (!currentSession) {
      return {
        success: false,
        error: "Sessão não encontrada. Faça login novamente."
      };
    }

    try {
      const categoriesUrl = `${currentSession.host}/player_api.php?username=${encodeURIComponent(currentSession.username)}&password=${encodeURIComponent(currentSession.password)}&action=get_live_categories`;
      
      const response = await fetch(categoriesUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'VLC/3.0.11 LibVLC/3.0.11'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        categories: Array.isArray(data) ? data : []
      };
    } catch (error: any) {
      console.error('Categories error:', error);
      return {
        success: true,
        categories: []
      };
    }
  },

  async logout(): Promise<{ success: boolean; message?: string; error?: string }> {
    currentSession = null;
    return {
      success: true,
      message: "Logout realizado com sucesso"
    };
  }
};
