import '@trackpoint/ui/globals.css'

import { App } from '@trackpoint/ui'
import React from 'react'
import ReactDOM from 'react-dom/client'

import { desktopClient } from './client'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App client={desktopClient} />
  </React.StrictMode>,
)
