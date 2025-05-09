import { electronApp, is, optimizer } from '@electron-toolkit/utils'
// Aqui importamos a injeção de dependência
import { DependencyInjection } from '@Ioc/DependencyInjection'
import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'

import { AuthHandler, TaskHandler } from '@/presentation/handlers'
import { TimeEntriesHandler } from '@/presentation/handlers/TimeEntriesHandler'
import { TokenHandler } from '@/presentation/handlers/TokenHandler'

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
    },
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())
  mainWindow.webContents.setWindowOpenHandler(
    (d) => (shell.openExternal(d.url), { action: 'deny' }),
  )
  is.dev && process.env['ELECTRON_RENDERER_URL']
    ? mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    : mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
}

app.whenReady().then(() => {
  DependencyInjection.initialize()

  AuthHandler.register()
  TaskHandler.register()
  TokenHandler.register()
  TimeEntriesHandler.register()

  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, w) => optimizer.watchWindowShortcuts(w))
  createWindow()
  app.on(
    'activate',
    () => BrowserWindow.getAllWindows().length === 0 && createWindow(),
  )
})

app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit())
