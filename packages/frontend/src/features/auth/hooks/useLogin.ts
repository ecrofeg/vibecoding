import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi, type LoginRequest } from '../api/authApi'

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], { username: data.username })
    },
  })
}
