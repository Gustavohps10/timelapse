import React from 'react'
import { createRoot } from 'react-dom/client'

import { AppDesktop } from '@/renderer/App'

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppDesktop />
  </React.StrictMode>,
)
