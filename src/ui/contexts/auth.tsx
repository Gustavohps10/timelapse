import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react'

import { client } from '@/ui/client/client'
import { User } from '@/ui/contexts/session/User'

export interface AuthContextType {
  isLoading: boolean
  isAuthenticated: boolean
  user: User | null
  login: (user: User, token: string) => void
  logout: () => void
  changeAvatar: (avatarUrl: string) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback(async (user: User, token: string) => {
    await client.modules.tokenStorage.saveToken({
      body: { service: 'atask', account: 'jwt', token },
    })
    client.modules.headers.setDefaultHeaders({
      authorization: `Bearer ${token}`,
    })
    setIsAuthenticated(true)
    setUser(user)
  }, [])

  const changeAvatar = useCallback((avatarUrl: string) => {
    setUser((currentUser) => {
      if (!currentUser) return null
      return {
        ...currentUser,
        avatarUrl: avatarUrl,
      }
    })
  }, [])

  const logout = useCallback(async () => {
    await client.modules.tokenStorage.deleteToken({
      body: { service: 'atask', account: 'jwt' },
    })
    setIsAuthenticated(false)
    setUser(null)
  }, [])

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const res = await client.modules.tokenStorage.getToken({
          body: { service: 'atask', account: 'jwt' },
        })

        if (!res.isSuccess || !res.data) return

        client.modules.headers.setDefaultHeaders({
          authorization: `Bearer ${res.data}`,
        })

        const response = await client.services.session.getCurrentUser()

        if (response.isSuccess && response.data) {
          setIsAuthenticated(true)
          setUser(response.data)
        }
      } catch {
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    autoLogin()
  }, [])

  useEffect(() => {
    const handleForceLogout = () => {
      logout()
    }
    window.addEventListener('force-logout', handleForceLogout)
    return () => {
      window.removeEventListener('force-logout', handleForceLogout)
    }
  }, [logout])

  return (
    <AuthContext.Provider
      value={{ isLoading, isAuthenticated, user, login, logout, changeAvatar }}
    >
      {children}
    </AuthContext.Provider>
  )
}
