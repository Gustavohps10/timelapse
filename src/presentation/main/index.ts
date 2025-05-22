import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { DependencyInjection } from '@Ioc/DependencyInjection'
import { app, BrowserWindow, Menu, screen, shell, Tray } from 'electron'
import { join } from 'path'

import { registerIpcRoutes } from '@/presentation/routes/registerIpcRoutes'
import icon from '@/ui/assets/timer-icon.png'

let tray: Tray | null = null
let secondaryWindow: BrowserWindow | null = null

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true,
    },
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

  mainWindow.webContents.setWindowOpenHandler((d) => {
    shell.openExternal(d.url)
    return { action: 'deny' }
  })

  is.dev && process.env['ELECTRON_RENDERER_URL']
    ? mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    : mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
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

  is.dev && process.env['ELECTRON_RENDERER_URL']
    ? secondaryWindow.loadURL(
        `${process.env['ELECTRON_RENDERER_URL']}/widgets/timer`,
      )
    : secondaryWindow.loadFile(join(__dirname, '../renderer/index.html'))
}

const createTray = () => {
  tray = new Tray(join(__dirname, icon))

  const buildContextMenu = () =>
    Menu.buildFromTemplate([
      {
        label: secondaryWindow?.isVisible()
          ? 'Ocultar Janela Flutuante'
          : 'Habilitar Janela Flutuante',
        click: () => {
          if (!secondaryWindow) {
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

  tray.setToolTip('Chronno')

  tray.on('click', () => {
    const menu = buildContextMenu()
    tray?.popUpContextMenu(menu)
  })

  tray.on('right-click', () => {
    const menu = buildContextMenu()
    tray?.popUpContextMenu(menu)
  })
}

app.whenReady().then(() => {
  DependencyInjection.initialize()
  registerIpcRoutes()

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
