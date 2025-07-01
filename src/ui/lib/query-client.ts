import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'

import { ViewModel } from '@/presentation/view-models/ViewModel'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onSettled: (data) => {
      const response = data as ViewModel<unknown>
      if (response?.isSuccess === false && response?.statusCode === 401) {
        window.dispatchEvent(new Event('force-logout'))
      }
    },
  }),
  mutationCache: new MutationCache({
    onSettled: (data) => {
      const response = data as ViewModel<unknown>
      if (response?.isSuccess === false && response?.statusCode === 401) {
        window.dispatchEvent(new Event('force-logout'))
      }
    },
  }),
})
