import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '@/ui/hooks/use-auth'

interface ProtectedRouteProps {
  element: React.ReactElement
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const { isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return element
}
