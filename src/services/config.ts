export const API_CONFIG = {
  GENERAL: import.meta.env.VITE_API_URL_GENERAL,
  OTEADOR: import.meta.env.VITE_API_URL_OTEADOR,
}

export const COGNITO_CONFIG = {
  REGION: import.meta.env.VITE_COGNITO_REGION,
  CLIENT_ID: import.meta.env.VITE_COGNITO_CLIENT_ID,
  IDENTITY_POOL_ID: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID,
  USER_POOL_ID: import.meta.env.VITE_COGNITO_USER_POOL_ID,
}
