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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
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

  const logout = useCallback(async () => {
    if (!workspace?.id) return
    // Importante: Primeiro limpamos o estado para interromper a sincronização
    setIsAuthenticated(false)
    setUser(null)

    await client.modules.tokenStorage.deleteToken({
      body: { service: 'timelapse', account: `jwt-${workspace.id}` },
    })

    // O destroy do banco deve ser chamado aqui explicitamente para garantir a ordem
    await destroy()
  }, [client, workspace?.id, destroy])

  const changeAvatar = useCallback((avatarUrl: string) => {
    setUser((currentUser) =>
      currentUser ? { ...currentUser, avatarUrl } : null,
    )
  }, [])

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
          setUser(response.data)
          setIsAuthenticated(true)
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
    return () => window.removeEventListener('force-logout', handleForceLogout)
  }, [logout])

  // ORQUESTRADOR DE SYNC SEGURO
  useEffect(() => {
    // Só prossegue se terminou de carregar o workspace e a sessão
    if (isLoading || workspaceIsLoading) return

    let isMounted = true

    const manageSync = async () => {
      if (isAuthenticated) {
        // Aguarda um frame para garantir que qualquer fechamento anterior processou no Main
        await new Promise((r) => setTimeout(r, 100))
        if (isMounted) await init()
      } else {
        await destroy()
      }
    }

    manageSync()

    return () => {
      isMounted = false
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
