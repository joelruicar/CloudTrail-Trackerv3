import axios from 'axios'
import { fetchAuthSession } from 'aws-amplify/auth'
import { API_CONFIG } from './config'
import router from '../router'
import { useAuthStore } from '../stores/auth'

const apiClient = axios.create({
  baseURL: API_CONFIG.GENERAL,
})
const oteadorClient = axios.create({
  baseURL: API_CONFIG.OTEADOR,
})

const addAuthHeader = async (config: any) => {
  const session = await fetchAuthSession()
  const token = session.tokens?.idToken?.toString()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

const handleAuthError = async (error: any) => {
  const status = error?.response?.status

  if (status === 401) {
    const authStore = useAuthStore()
    await authStore.logout().catch(() => null)

    if (router.currentRoute.value.name !== 'login') {
      await router.replace({ name: 'login' }).catch(() => null)
    }
  }

  return Promise.reject(error)
}
// Interceptor para inyectar el token automáticamente
apiClient.interceptors.request.use(addAuthHeader)
oteadorClient.interceptors.request.use(addAuthHeader)
apiClient.interceptors.response.use((response) => response, handleAuthError)
oteadorClient.interceptors.response.use((response) => response, handleAuthError)

export default {
  client: apiClient,
  oteadorClient,
  endpoints: {
    allUsers: () => `/users`,
    user: (id: string) => `/users/${id}`,
    users: (page: number, pageSize: number) => `/users/?page=${page}&pageSize=${pageSize}`,
  },
}
