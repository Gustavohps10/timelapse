'use client'

import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react'

import { User } from '@/@types/session/User'
import { useWorkspace } from '@/hooks'
import { useClient } from '@/hooks/use-client'
import { useSyncActions } from '@/stores/syncStore'

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
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { workspace, isLoading: workspaceIsLoading } = useWorkspace()
  const client = useClient()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<User | null>(null)
  const { init, destroy } = useSyncActions()

  const login = useCallback(
    async (user: User, token: string) => {
      if (!workspace?.id) return
      await client.modules.tokenStorage.saveToken({
        body: { service: 'timelapse', account: `jwt-${workspace.id}`, token },
      })
      client.modules.headers.setDefaultHeaders({
        authorization: `Bearer ${token}`,
      })
      setIsAuthenticated(true)
      setUser(user)
    },
    [client, workspace?.id],
  )

  const changeAvatar = useCallback((avatarUrl: string) => {
    setUser((currentUser) =>
      currentUser ? { ...currentUser, avatarUrl } : null,
    )
  }, [])

  const logout = useCallback(async () => {
    if (!workspace?.id) return
    await client.modules.tokenStorage.deleteToken({
      body: { service: 'timelapse', account: `jwt-${workspace.id}` },
    })
    setIsAuthenticated(false)
    setUser(null)
  }, [client, workspace?.id])

  useEffect(() => {
    if (!workspace?.id) return

    const autoLogin = async () => {
      try {
        const res = await client.modules.tokenStorage.getToken({
          body: { service: 'timelapse', account: `jwt-${workspace.id}` },
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
          body: { workspaceId: workspace.id },
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
  }, [workspace?.id, client])

  useEffect(() => {
    const handleForceLogout = () => logout()
    window.addEventListener('force-logout', handleForceLogout)
    return () => {
      window.removeEventListener('force-logout', handleForceLogout)
    }
  }, [logout])

  useEffect(() => {
    if (isLoading || workspaceIsLoading) return

    if (isAuthenticated) {
      init()
    } else {
      destroy()
    }
  }, [isAuthenticated, isLoading, workspaceIsLoading, init, destroy])

  return (
    <AuthContext.Provider
      value={{
        isLoading: isLoading || workspaceIsLoading,
        isAuthenticated,
        user,
        login,
        logout,
        changeAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
