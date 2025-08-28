import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { ContainerBuilder, PlatformDependencies } from '@trackalize/container'
import { JSONWorkspacesRepository } from '@trackalize/infra/data'
import { KeytarTokenStorage } from '@trackalize/infra/storage'
import { app, BrowserWindow, Menu, screen, shell, Tray } from 'electron'
import { join } from 'path'

import {
  AuthHandler,
  SessionHandler,
  TaskHandler,
  TimeEntriesHandler,
  TokenHandler,
} from '@/main/handlers'
import { WorkspacesHandler } from '@/main/handlers/WorkspacesHandler'
import { openIpcRoutes } from '@/main/routes/openIpcRoutes'

import timerIcon from './assets/timer-icon.png'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let secondaryWindow: BrowserWindow | null = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true,
    },
  })

  mainWindow.on('ready-to-show', () => mainWindow!.show())

  mainWindow.webContents.setWindowOpenHandler((d) => {
    shell.openExternal(d.url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

export type IHandlersScope = {
  authHandler: typeof AuthHandler
  sessionHandler: typeof SessionHandler
  taskHandler: typeof TaskHandler
  timeEntriesHandler: typeof TimeEntriesHandler
  tokenHandler: typeof TokenHandler
  workspacesHandler: typeof WorkspacesHandler
}

const createSecondaryWindow = () => {
  secondaryWindow = new BrowserWindow({
    width: 400,
    height: 420,
    show: false,
    frame: false,
    transparent: true,
    skipTaskbar: true,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      sandbox: false,
    },
  })

  secondaryWindow.once('ready-to-show', () => {
    const { width } = screen.getPrimaryDisplay().workAreaSize
    const x = width - 280
    const y = 160
    secondaryWindow!.setBounds({ x, y, width: 220, height: 420 })
    secondaryWindow!.show()
  })

  secondaryWindow.on('closed', () => {
    secondaryWindow = null
  })

  is.dev && process.env['ELECTRON_RENDERER_URL']
    ? secondaryWindow.loadURL(
        `${process.env['ELECTRON_RENDERER_URL']}/widgets/timer`,
      )
    : secondaryWindow.loadFile(join(__dirname, '../renderer/index.html'))
}

const createTray = () => {
  tray = new Tray(join(__dirname, timerIcon))

  const buildContextMenu = () =>
    Menu.buildFromTemplate([
      {
        label: secondaryWindow?.isVisible()
          ? 'Ocultar Janela Flutuante'
          : 'Habilitar Janela Flutuante',
        click: () => {
          if (!secondaryWindow || secondaryWindow.isDestroyed()) {
            createSecondaryWindow()
          } else {
            secondaryWindow.isVisible()
              ? secondaryWindow.hide()
              : secondaryWindow.show()
          }
        },
      },
      { type: 'separator' },
      { label: 'Sair', role: 'quit' },
    ])

  tray.setToolTip('Trackalize')

  tray.on('click', () => {
    const menu = buildContextMenu()
    tray?.popUpContextMenu(menu)
  })

  tray.on('right-click', () => {
    const menu = buildContextMenu()
    tray?.popUpContextMenu(menu)
  })
}

app.whenReady().then(async () => {
  const platformDeps: PlatformDependencies = {
    credentialsStorage: new KeytarTokenStorage(),
    workspacesRepository: new JSONWorkspacesRepository(app.getPath('userData')),
  }

  const serviceProvider = new ContainerBuilder()
    .addPlatformDependencies(platformDeps)
    .addInfrastructure()
    .addApplicationServices()
    // .addFromPath('out/main/handlers')
    .addScoped<IHandlersScope>({
      authHandler: AuthHandler,
      sessionHandler: SessionHandler,
      taskHandler: TaskHandler,
      timeEntriesHandler: TimeEntriesHandler,
      tokenHandler: TokenHandler,
      workspacesHandler: WorkspacesHandler,
    })
    .build()

  openIpcRoutes(serviceProvider)

  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, w) => optimizer.watchWindowShortcuts(w))

  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
