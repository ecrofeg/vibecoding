import { useQuery } from '@tanstack/react-query'
import { authApi } from '../api/authApi'

export function useAuth() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}
