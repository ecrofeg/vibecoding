import { api, endpoints } from '@/shared/api'

export type LoginRequest = {
  username: string
  password: string
}

export type LoginResponse = {
  success: boolean
  username: string
}

export type AuthUser = {
  username: string
}

export const authApi = {
  login: (credentials: LoginRequest) =>
    api.post<LoginResponse>(endpoints.auth.login, credentials),

  logout: () => api.post<{ success: boolean }>(endpoints.auth.logout, {}),

  me: () => api.get<AuthUser>(endpoints.auth.me),
}
