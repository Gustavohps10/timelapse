import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react'

import { MemberViewModel } from '@/presentation/view-models/MemberViewModel'
import { client } from '@/ui/client/client'

export interface AuthContextType {
  isAuthenticated: boolean
  user: MemberViewModel | null
  login: (user: MemberViewModel, token: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<MemberViewModel | null>(null)

  // Login com user e token
  const login = useCallback(async (user: MemberViewModel, token: string) => {
    const response = await client.modules.tokenStorage.saveToken({
      body: {
        service: 'atask',
        account: 'jwt',
        token,
      },
    })

    if (!response.isSuccess) {
      setIsAuthenticated(false)
      setUser(null)
      return
    }

    client.modules.headers.setDefaultHeaders({
      authorization: `Bearer ${token}`,
    })

    setIsAuthenticated(true)
    setUser(user)
  }, [])

  // Logout
  const logout = useCallback(async () => {
    await client.modules.tokenStorage.deleteToken({
      body: { service: 'atask', account: 'jwt' },
    })
    setIsAuthenticated(false)
    setUser(null)
  }, [])

  // Auto login se token estiver salvo
  useEffect(() => {
    const autoLogin = async () => {
      const res = await client.modules.tokenStorage.getToken({
        body: { service: 'atask', account: 'jwt' },
      })

      if (!res.isSuccess || !res.data) {
        setIsAuthenticated(false)
        setUser(null)
        return
      }

      client.modules.headers.setDefaultHeaders({
        authorization: `Bearer ${res.data}`,
      })

      const response = await client.services.session.getCurrentUser()

      if (!response.data) return

      setIsAuthenticated(true)
      setUser(response.data)
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
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
