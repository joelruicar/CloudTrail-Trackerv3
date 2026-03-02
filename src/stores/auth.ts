import { defineStore } from 'pinia';
import { getCurrentUser, fetchAuthSession, signIn } from 'aws-amplify/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    accessToken: null as string | null,
  }),

  getters: {
    isProfessor: (state) => state.user?.username?.toLowerCase().startsWith('gmolto'),
    isStudent: (state) => state.user?.username?.toLowerCase().startsWith('alucloud'),
    roleName(): string  {
      if (this.isProfessor) return 'Profesor';
      if (this.isStudent) return 'Estudiante';
      return 'undefined';
    },
  },

  actions: {
    async refreshUser() {
      try {
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();
        
        this.user = currentUser;
        this.accessToken = session.tokens?.accessToken?.toString() || null;
      } catch (error) {
        this.user = null;
        this.accessToken = null;
      }
    },
    async login(email: string, password: string) {
      try {
        await signIn({ username: email, password });
        await this.refreshUser(); 
        return true;
      } catch (error) {
        console.error('Login error:', error);
        throw error; 
      }
    },
    logout() {
      this.user = null;
      this.accessToken = null;
      // Aquí invocarías signOut() de amplify
    }
  },
});