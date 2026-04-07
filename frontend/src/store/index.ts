import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Material, User } from '@/services/api';

// ── AUTH ──────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null, token: null,
      setAuth: (user, token) => { localStorage.setItem('facade_token', token); set({ user, token }); },
      logout: () => { localStorage.removeItem('facade_token'); set({ user: null, token: null }); },
      isAuthenticated: () => !!get().token,
    }),
    { name: 'facade-auth', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
);

// ── CONFIGURATOR ──────────────────────────────────────────────────────────────

export interface ConfiguratorConfig {
  category: 'kitchen' | 'wardrobe' | 'panel';
  selectedMaterial: Material | null;
  width: number;
  height: number;
  doors: number;
  drawers: number;
  cameraAngle: 'front' | 'perspective' | 'top' | 'left' | 'right';
}

interface ConfiguratorState {
  config: ConfiguratorConfig;
  setMaterial: (m: Material) => void;
  setDimensions: (w: number, h: number) => void;
  setDoors: (n: number) => void;
  setDrawers: (n: number) => void;
  setCategory: (c: 'kitchen' | 'wardrobe' | 'panel') => void;
  setCameraAngle: (a: ConfiguratorConfig['cameraAngle']) => void;
  reset: () => void;
}

const defaultConfig: ConfiguratorConfig = {
  category: 'kitchen', selectedMaterial: null,
  width: 3.6, height: 2.4, doors: 5, drawers: 5,
  cameraAngle: 'perspective',
};

export const useConfiguratorStore = create<ConfiguratorState>()((set) => ({
  config: defaultConfig,
  setMaterial:    (m) => set(s => ({ config: { ...s.config, selectedMaterial: m } })),
  setDimensions:  (w, h) => set(s => ({ config: { ...s.config, width: w, height: h } })),
  setDoors:       (n) => set(s => ({ config: { ...s.config, doors: n } })),
  setDrawers:     (n) => set(s => ({ config: { ...s.config, drawers: n } })),
  setCategory:    (c) => set(s => ({ config: { ...s.config, category: c } })),
  setCameraAngle: (a) => set(s => ({ config: { ...s.config, cameraAngle: a } })),
  reset:          () => set({ config: defaultConfig }),
}));
