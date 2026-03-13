import { defineStore } from 'pinia'
import {
  getCurrentUser,
  fetchAuthSession,
  signIn,
  signOut,
  updatePassword,
  confirmResetPassword,
  resetPassword,
} from 'aws-amplify/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    accessToken: null as string | null,
  }),

  getters: {
    isProfessor: (state) =>
      state.user?.username?.toLowerCase().startsWith('gmolto') ||
      state.user?.username?.toLowerCase().startsWith('admin'),
    isStudent: (state) => state.user?.username?.toLowerCase().startsWith('alucloud'),
    username(): string {
      return this.user?.username
    },
  },

  actions: {
    async refreshUser() {
      try {
        const currentUser = await getCurrentUser()
        const session = await fetchAuthSession()

        this.user = currentUser
        this.accessToken = session.tokens?.accessToken?.toString() || null
      } catch (error) {
        this.user = null
        this.accessToken = null
      }
    },
    async login(email: string, password: string) {
      try {
        await signIn({ username: email, password })
        await this.refreshUser()
        return true
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },
    async logout() {
      try {
        await signOut()
      } catch (error) {
        console.error('Error al cerrar sesión en Amplify:', error)
      } finally {
        this.user = null
        this.accessToken = null
      }
    },
    async changePassword(oldPass: string, newPass: string) {
      try {
        await updatePassword({
          oldPassword: oldPass,
          newPassword: newPass,
        })
        return { success: true }
      } catch (error: any) {
        console.error('Error al actualizar la contraseña:', error)
        throw error
      }
    },
    async confirmResetPassword(username: string, code: string, newPass: string) {
      await confirmResetPassword({
        username,
        confirmationCode: code,
        newPassword: newPass,
      })
      return { success: true }
    },
    async resetPassword(username: string) {
      await resetPassword({ username })
      return { success: true }
    },
  },
})
