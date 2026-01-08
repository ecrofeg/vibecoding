const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export class ApiError extends Error {
  public constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (response.status === 401) {
    const currentPath = window.location.pathname
    if (currentPath !== '/login') {
      window.location.href = '/login'
    }
    throw new ApiError('Unauthorized', 401)
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new ApiError(
      errorBody.error || `API Error: ${response.status}`,
      response.status,
      errorBody.details
    )
  }

  return response.json()
}

export const api = {
  get: <T>(endpoint: string) => apiClient<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body: unknown) =>
    apiClient<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown) =>
    apiClient<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) => apiClient<T>(endpoint, { method: 'DELETE' }),

  upload: <T>(endpoint: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {},
    })
  },
}
