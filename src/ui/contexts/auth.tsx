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

  // Auto login se token estiver salvo
  useEffect(() => {
    const autoLogin = async () => {
      const res = await client.modules.tokenStorage.getToken({
        body: { service: 'atask', account: 'jwt' },
      })

      console.log('TOKEN JA EXISTENTE', res)

      if (!res.isSuccess || !res.data) {
        setIsAuthenticated(false)
        setUser(null)
        return
      }

      client.modules.headers.setDefaultHeaders({
        authorization: `Bearer ${res.data}`,
      })

      setIsAuthenticated(true)
      setUser({
        id: 230,
        admin: false,
        firstname: 'JOAOZINHO',
        lastname: 'LOGADO',
        last_login_on: '2025-04-05',
        api_key: '123123',
        created_on: '2025-04-05',
        custom_fields: [],
        login: 'usuario.que.ja.esta.logado',
      }) // TODO: Pegar os dados reais do token futuramente
    }

    autoLogin()
  }, [])

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

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
