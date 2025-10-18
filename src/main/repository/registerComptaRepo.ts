import { ipcMain } from 'electron';
import type { RegisterComptaPayload } from '@shared/types/compta';
import {
  generateBalanceSheet,
  getComptaEntries,
  registerComptaEntry,
  deleteComptaEntry,
} from './comptaRepositories';

let ipcRegistered = false;

export function registerComptaIpcHandlers(): void {
  if (ipcRegistered) {
    return;
  }

  ipcMain.handle('compta:list', async () => getComptaEntries());
  ipcMain.handle(
    'compta:register',
    async (_event, payload: RegisterComptaPayload) => registerComptaEntry(payload),
  );
  ipcMain.handle('compta:delete', async (_event, id: string) => deleteComptaEntry(id));
  ipcMain.handle('compta:balance', async () => generateBalanceSheet());

  ipcRegistered = true;
}
