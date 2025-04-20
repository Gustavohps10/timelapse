import { useContext } from 'react'

import { AuthContext, AuthContextType } from '@/ui/contexts/auth'

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('use Auth must be used within an AuthProvider')
  }
  return context
}
