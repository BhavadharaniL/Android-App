import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@careerverse_token';
const USER_KEY = '@careerverse_user';
const API_URL_KEY = '@careerverse_api_url';
const CACHED_OPPORTUNITIES_KEY = '@careerverse_cache_opps';
const CACHED_NEWS_KEY = '@careerverse_cache_news';

export const storage = {
  // Auth Token
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken: async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.warn('Storage setToken error:', e);
    }
  },
  removeToken: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Storage removeToken error:', e);
    }
  },

  // User Profile
  getUser: async (): Promise<any | null> => {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setUser: async (user: any): Promise<void> => {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Storage setUser error:', e);
    }
  },
  removeUser: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (e) {
      console.warn('Storage removeUser error:', e);
    }
  },

  // Configurable API URL for Android Physical Device Testing
  getApiUrl: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(API_URL_KEY);
    } catch {
      return null;
    }
  },
  setApiUrl: async (url: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(API_URL_KEY, url);
    } catch (e) {
      console.warn('Storage setApiUrl error:', e);
    }
  },

  // Offline Cached Feeds
  getCachedOpportunities: async (): Promise<any[]> => {
    try {
      const data = await AsyncStorage.getItem(CACHED_OPPORTUNITIES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  setCachedOpportunities: async (items: any[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(CACHED_OPPORTUNITIES_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Storage setCachedOpportunities error:', e);
    }
  },
  getCachedNews: async (): Promise<any[]> => {
    try {
      const data = await AsyncStorage.getItem(CACHED_NEWS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  setCachedNews: async (items: any[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(CACHED_NEWS_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Storage setCachedNews error:', e);
    }
  },

  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch (e) {
      console.warn('Storage clearAll error:', e);
    }
  }
};
