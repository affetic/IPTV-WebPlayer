import { apiRequest } from "./queryClient";
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

export const xtreamApi = {
  async authenticate(credentials: XtreamAuth): Promise<XtreamAuthResponse> {
    const response = await apiRequest("POST", "/api/auth/xtream", credentials);
    return await response.json();
  },

  async getChannels(sessionId: string): Promise<ChannelsResponse> {
    const response = await apiRequest("GET", `/api/channels/${sessionId}`);
    return await response.json();
  },

  async getCategories(sessionId: string): Promise<CategoriesResponse> {
    const response = await apiRequest("GET", `/api/categories/${sessionId}`);
    return await response.json();
  },

  async logout(sessionId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await apiRequest("DELETE", `/api/auth/${sessionId}`);
    return await response.json();
  }
};
