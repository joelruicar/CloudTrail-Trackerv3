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
import { clearCredentialCache } from './oteador'

interface AuthUserState {
  username: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUserState | null,
    accessToken: null as string | null,
    token: null as string | null | undefined
  }),

  getters: {
    isProfessor: (state) =>
      state.user?.username?.toLowerCase().startsWith('alucloud189') ||
      state.user?.username?.toLowerCase().startsWith('alucloud46'),
    isStudent: (state) => state.user?.username?.toLowerCase().startsWith('alucloud'),
    username(): string {
      return this.user?.username || ''
    },
  },

  actions: {
async refreshUser() {
  try {
    const session = await fetchAuthSession()
    const { username } = await getCurrentUser()
    
    this.token = session.tokens?.idToken?.toString()
    this.user = { username }
    if (this.token) {
      const sessionData = {
        user: {
          username: username,
          token: this.token
        }
      }
      window.localStorage.setItem('session', JSON.stringify(sessionData))
    }
  } catch (error) {
    this.user = null
    this.token = null
    window.localStorage.removeItem('session') 
  }
},
async login(email: string, password: string) {
  try {
    await signIn({ username: email, password })
    await this.refreshUser()
    if (this.user && this.token) {
      const sessionData = {
        user: {
          username: this.user.username, 
          token: this.token
        }
      }
      window.localStorage.setItem('session', JSON.stringify(sessionData))
    }

    return true
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
},
  async logout() {
    try {
      await signOut() 
      this.user = null
      this.token = null
      this.accessToken = null
      window.localStorage.removeItem('session')
      window.localStorage.removeItem('EC2 instances_regions')
      clearCredentialCache()
      return true
    } catch (error) {
      console.error('Logout error:', error)
      this.user = null
      window.localStorage.removeItem('session')
      throw error
    }
  },
    async changePassword(oldPass: string, newPass: string) {
      try {
        await updatePassword({
          oldPassword: oldPass,
          newPassword: newPass,
        })
        return { success: true }
      } catch (error) {
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
