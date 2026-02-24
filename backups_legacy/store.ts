import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'store' | 'tailor' | 'user';
  rank?: string;
  military_number?: string;
  unit?: string;
  store_id?: string;
  tailor_id?: string;
}

interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, // Start with no user
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
