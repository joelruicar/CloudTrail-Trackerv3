import axios from 'axios'
import { fetchAuthSession } from 'aws-amplify/auth'
import { API_CONFIG } from './config'

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
// Interceptor para inyectar el token automáticamente
apiClient.interceptors.request.use(addAuthHeader)
oteadorClient.interceptors.request.use(addAuthHeader)

export default {
  client: apiClient,
  oteadorClient,
  endpoints: {
    allUsers: () => `/users`,
    user: (id: string) => `/users/${id}`,
    users: (page: number, pageSize: number) => `/users/?page=${page}&pageSize=${pageSize}`,
  },
}
