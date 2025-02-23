import { ipcMain } from 'electron';
import Keytar from 'keytar';
import { CurrentUser } from '../api/current-user.js';

export const registerHandlers = () => {
  ipcMain.handle('currentUser', async (_e, d) => CurrentUser(d));
  ipcMain.handle('keytar:savePassword', async (_e, d) => Keytar.setPassword(d.service, d.account, d.password));
  ipcMain.handle('keytar:getPassword', async (_e, d) => Keytar.getPassword(d.service, d.account));
  ipcMain.handle('keytar:deletePassword', async (_e, d) => Keytar.deletePassword(d.service, d.account));
  ipcMain.on('ping', () => console.log('pong'));
};