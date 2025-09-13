import type { XtreamAuth } from "@shared/schema";

export interface XtreamAuthResponse {
  success: boolean;
  sessionId?: string;
  userInfo?: any;
  serverInfo?: any;
  credentials?: XtreamAuth;
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
  contentType: 'live' | 'movie' | 'series';
}

export interface Movie {
  id: string;
  streamId: string;
  name: string;
  categoryId: string;
  categoryName: string;
  streamUrl: string;
  logo: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  releaseDate: string;
  rating: string;
  duration: string;
  added: string | null;
}

export interface Series {
  id: string;
  seriesId: string;
  name: string;
  categoryId: string;
  categoryName: string;
  logo: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  releaseDate: string;
  rating: string;
  lastModified: string;
}

export interface Episode {
  id: string;
  streamId: string;
  episodeNum: string;
  title: string;
  plot: string;
  duration: string;
  releaseDate: string;
  rating: string;
  season: string;
  streamUrl: string;
  added: string | null;
  containerExtension: string;
}

export interface ChannelsResponse {
  success: boolean;
  channels?: Channel[];
  error?: string;
}

export interface MoviesResponse {
  success: boolean;
  movies?: Movie[];
  error?: string;
}

export interface SeriesResponse {
  success: boolean;
  series?: Series[];
  error?: string;
}

export interface EpisodesResponse {
  success: boolean;
  episodes?: Episode[];
  seriesInfo?: any;
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

export type ContentType = 'live' | 'movies' | 'series';

// Unified type for playable content
export type Playable = Channel | Movie | Episode;

// Store current session data
let currentSession: {
  sessionId: string;
  host: string;
  username: string;
  password: string;
  userInfo: any;
  serverInfo: any;
} | null = null;

export const xtreamApi = {
  // Restore session from credentials (for localStorage restored sessions)
  restoreSession(credentials: XtreamAuth, userInfo: any, serverInfo: any, sessionId?: string): void {
    const cleanHost = credentials.host.replace(/\/$/, '');
    currentSession = {
      sessionId: sessionId || `${credentials.username}_${Date.now()}`,
      host: cleanHost,
      username: credentials.username,
      password: credentials.password,
      userInfo,
      serverInfo
    };
  },

  async authenticate(credentials: XtreamAuth): Promise<XtreamAuthResponse> {
    try {
      const { host, username, password } = credentials;
      const cleanHost = host.replace(/\/$/, '');
      
      // Direct request for GitHub Pages deployment (no server proxy)
      const authUrl = `${cleanHost}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
      
      const response = await fetch(authUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
          sessionId: `${username}_${Date.now()}`,
          host: cleanHost,
          username,
          password,
          userInfo: data.user_info,
          serverInfo: data.server_info
        };

        return {
          success: true,
          sessionId: currentSession.sessionId,
          userInfo: data.user_info,
          serverInfo: data.server_info,
          credentials
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
      // Direct request for GitHub Pages deployment
      const channelsUrl = `${currentSession.host}/player_api.php?username=${encodeURIComponent(currentSession.username)}&password=${encodeURIComponent(currentSession.password)}&action=get_live_streams`;
      
      const response = await fetch(channelsUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
          sessionId: currentSession!.sessionId,
          streamId: stream.stream_id?.toString() || '',
          name: stream.name || 'Canal sem nome',
          categoryId: stream.category_id?.toString() || '',
          categoryName: stream.category_name || 'Outros',
          streamUrl: `${currentSession!.host}/live/${currentSession!.username}/${currentSession!.password}/${stream.stream_id}.m3u8`,
          logo: stream.stream_icon || '',
          epgChannelId: stream.epg_channel_id || '',
          added: stream.added ? new Date(parseInt(stream.added) * 1000).toISOString() : null,
          isNsfw: stream.is_adult === "1",
          contentType: 'live' as const
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

  async getMovies(): Promise<MoviesResponse> {
    if (!currentSession) {
      return {
        success: false,
        error: "Sessão não encontrada. Faça login novamente."
      };
    }

    try {
      const moviesUrl = `${currentSession.host}/player_api.php?username=${encodeURIComponent(currentSession.username)}&password=${encodeURIComponent(currentSession.password)}&action=get_vod_streams`;
      
      const response = await fetch(moviesUrl, {
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
        const movies = data.map((movie: any) => ({
          id: `movie_${movie.stream_id}`,
          streamId: movie.stream_id?.toString() || '',
          name: movie.name || 'Filme sem nome',
          categoryId: movie.category_id?.toString() || '',
          categoryName: movie.category_name || 'Outros',
          streamUrl: `${currentSession!.host}/movie/${currentSession!.username}/${currentSession!.password}/${movie.stream_id}.${movie.container_extension || 'mp4'}`,
          logo: movie.stream_icon || '',
          plot: movie.plot || '',
          cast: movie.cast || '',
          director: movie.director || '',
          genre: movie.genre || '',
          releaseDate: movie.releasedate || '',
          rating: movie.rating || '',
          duration: movie.duration || '',
          added: movie.added ? new Date(parseInt(movie.added) * 1000).toISOString() : null,
        }));

        return {
          success: true,
          movies
        };
      } else {
        return {
          success: false,
          error: "Formato de resposta inválido do servidor IPTV"
        };
      }
    } catch (error: any) {
      console.error('Movies error:', error);
      return {
        success: false,
        error: `Erro ao buscar filmes: ${error.message}`
      };
    }
  },

  async getSeries(): Promise<SeriesResponse> {
    if (!currentSession) {
      return {
        success: false,
        error: "Sessão não encontrada. Faça login novamente."
      };
    }

    try {
      const seriesUrl = `${currentSession.host}/player_api.php?username=${encodeURIComponent(currentSession.username)}&password=${encodeURIComponent(currentSession.password)}&action=get_series`;
      
      const response = await fetch(seriesUrl, {
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
        const series = data.map((serie: any) => ({
          id: `series_${serie.series_id}`,
          seriesId: serie.series_id?.toString() || '',
          name: serie.name || 'Série sem nome',
          categoryId: serie.category_id?.toString() || '',
          categoryName: serie.category_name || 'Outros',
          logo: serie.cover || '',
          plot: serie.plot || '',
          cast: serie.cast || '',
          director: serie.director || '',
          genre: serie.genre || '',
          releaseDate: serie.releaseDate || '',
          rating: serie.rating || '',
          lastModified: serie.last_modified || '',
        }));

        return {
          success: true,
          series
        };
      } else {
        return {
          success: false,
          error: "Formato de resposta inválido do servidor IPTV"
        };
      }
    } catch (error: any) {
      console.error('Series error:', error);
      return {
        success: false,
        error: `Erro ao buscar séries: ${error.message}`
      };
    }
  },

  async getSeriesInfo(seriesId: string): Promise<EpisodesResponse> {
    if (!currentSession) {
      return {
        success: false,
        error: "Sessão não encontrada. Faça login novamente."
      };
    }

    try {
      const seriesInfoUrl = `${currentSession.host}/player_api.php?username=${encodeURIComponent(currentSession.username)}&password=${encodeURIComponent(currentSession.password)}&action=get_series_info&series_id=${seriesId}`;
      
      const response = await fetch(seriesInfoUrl, {
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
      
      if (data && data.episodes) {
        const episodes: Episode[] = [];
        
        // Process episodes from all seasons
        Object.keys(data.episodes).forEach(seasonNum => {
          const seasonEpisodes = data.episodes[seasonNum];
          if (Array.isArray(seasonEpisodes)) {
            seasonEpisodes.forEach((episode: any) => {
              episodes.push({
                id: `episode_${episode.id}`,
                streamId: episode.id?.toString() || '',
                episodeNum: episode.episode_num?.toString() || '',
                title: episode.title || `Episódio ${episode.episode_num}`,
                plot: episode.plot || '',
                duration: episode.duration || '',
                releaseDate: episode.releasedate || '',
                rating: episode.rating || '',
                season: seasonNum,
                streamUrl: `${currentSession!.host}/series/${currentSession!.username}/${currentSession!.password}/${episode.id}.${episode.container_extension || 'mp4'}`,
                added: episode.added ? new Date(parseInt(episode.added) * 1000).toISOString() : null,
                containerExtension: episode.container_extension || 'mp4'
              });
            });
          }
        });

        return {
          success: true,
          episodes,
          seriesInfo: data.info || null
        };
      } else {
        return {
          success: false,
          error: "Nenhum episódio encontrado para esta série"
        };
      }
    } catch (error: any) {
      console.error('Series info error:', error);
      return {
        success: false,
        error: `Erro ao buscar episódios: ${error.message}`
      };
    }
  },

  async getCategories(contentType: ContentType = 'live'): Promise<CategoriesResponse> {
    if (!currentSession) {
      return {
        success: false,
        error: "Sessão não encontrada. Faça login novamente."
      };
    }

    try {
      // Direct request for GitHub Pages deployment (all content types)
      let action = 'get_live_categories';
      if (contentType === 'movies') {
        action = 'get_vod_categories';
      } else if (contentType === 'series') {
        action = 'get_series_categories';
      }

      const categoriesUrl = `${currentSession.host}/player_api.php?username=${encodeURIComponent(currentSession.username)}&password=${encodeURIComponent(currentSession.password)}&action=${action}`;
      
      const response = await fetch(categoriesUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
