import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { fetchAuthSession } from 'aws-amplify/auth'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

// Creamos la instancia de axios
const apiClient = axios.create({
  baseURL: apiBaseUrl,
})

// Interceptor para inyectar el token automáticamente
apiClient.interceptors.request.use(async (config) => {
  const session = await fetchAuthSession()
  const token = session.tokens?.accessToken?.toString()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Exportamos el cliente y los endpoints
export default {
  client: apiClient,
  endpoints: {
    allUsers: () => `/users`,
    user: (id: string) => `/users/${id}`,
    users: (page: number, pageSize: number) => `/users/?page=${page}&pageSize=${pageSize}`,
  },
}
