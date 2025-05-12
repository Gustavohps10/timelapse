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
    // client.modules.tokenStorage
    //   .getToken({ body: { service: 'atask', account: 'userKey' } })
    //   .then((res) => {
    //     if (!res.isSuccess || !res.data) {
    //       setIsAuthenticated(false)
    //       setUser(null)
    //       return
    //     }
    //     // client.services.auth
    //     //   .currentUser({ key: res.data })
    //     //   .then((currentUserData) => {
    //     //     setIsAuthenticated(true)
    //     //     setUser(currentUserData.user)
    //     //   })
    //     //   .catch(() => {
    //     //     setIsAuthenticated(false)
    //     //     setUser(null)
    //     //   })
    //   })
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

    console.log(token)

    client.modules.headers.setDefaultHeaders({
      authorization: `Bearer ${token}`,
    })

    setIsAuthenticated(true)
    setUser(user)
  }, [])

  const logout = useCallback(() => {
    client.modules.tokenStorage
      .deleteToken({ body: { service: 'atask', account: 'userKey' } })
      .then(() => {
        setIsAuthenticated(false)
        setUser(null)
      })
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
