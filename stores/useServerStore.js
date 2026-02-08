// stores/useServerStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const SERVERS = [
  { value: 'europe', label: 'Europe', flag: '🇪🇺' },
  { value: 'west', label: 'Americas', flag: '🇺🇸' },
  { value: 'east', label: 'Asia', flag: '🇸🇬' },
];

export const useServerStore = create(
  persist(
    (set) => ({
      selectedServer: 'europe',
      setSelectedServer: (server) => set({ selectedServer: server }),
    }),
    {
      name: 'albion-server-storage', // localStorage key
    }
  )
);