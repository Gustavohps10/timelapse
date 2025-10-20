import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react'

import { User } from '@/contexts/session/User'
import { useClient } from '@/hooks/use-client'
import { useSync } from '@/hooks/use-sync'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export interface AuthContextType {
  isLoading: boolean
  isAuthenticated: boolean
  user: User | null
  login: (user: User, token: string) => void
  logout: () => void
  changeAvatar: (avatarUrl: string) => void
}

interface AuthProviderProps {
  children: ReactNode
  workspaceId: string
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  workspaceId,
}) => {
  const client = useClient()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<User | null>(null)
  const { startAllReplications, stopAllReplications } = useSync()

  const login = useCallback(
    async (user: User, token: string) => {
      await client.modules.tokenStorage.saveToken({
        body: { service: 'timelapse', account: `jwt-${workspaceId}`, token },
      })
      client.modules.headers.setDefaultHeaders({
        authorization: `Bearer ${token}`,
      })
      setIsAuthenticated(true)
      setUser(user)
    },
    [client, workspaceId],
  )

  const changeAvatar = useCallback((avatarUrl: string) => {
    setUser((currentUser) =>
      currentUser ? { ...currentUser, avatarUrl } : null,
    )
  }, [])

  const logout = useCallback(async () => {
    await client.modules.tokenStorage.deleteToken({
      body: { service: 'timelapse', account: `jwt-${workspaceId}` },
    })
    setIsAuthenticated(false)
    setUser(null)
  }, [client, workspaceId])

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const res = await client.modules.tokenStorage.getToken({
          body: { service: 'timelapse', account: `jwt-${workspaceId}` },
        })

        if (!res.isSuccess || !res.data) {
          setIsAuthenticated(false)
          setUser(null)
          return
        }

        client.modules.headers.setDefaultHeaders({
          authorization: `Bearer ${res.data}`,
        })

        const response = await client.services.session.getCurrentUser({
          body: { workspaceId },
        })

        if (response.isSuccess && response.data) {
          setIsAuthenticated(true)
          setUser(response.data)
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch {
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    autoLogin()
  }, [workspaceId, client])

  useEffect(() => {
    const handleForceLogout = () => logout()
    window.addEventListener('force-logout', handleForceLogout)
    return () => {
      window.removeEventListener('force-logout', handleForceLogout)
    }
  }, [logout])

  useEffect(() => {
    if (isAuthenticated) {
      startAllReplications()
      return
    }

    stopAllReplications()
  }, [isAuthenticated, startAllReplications, stopAllReplications])

  return (
    <AuthContext.Provider
      value={{ isLoading, isAuthenticated, user, login, logout, changeAvatar }}
    >
      {children}
    </AuthContext.Provider>
  )
}
