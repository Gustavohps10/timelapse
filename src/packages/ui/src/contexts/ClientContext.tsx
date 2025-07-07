import { createContext } from 'react'

import { IClient } from '@/client'

export const ClientContext = createContext<IClient | null>(null)

ClientContext.displayName = 'ClientContext'
