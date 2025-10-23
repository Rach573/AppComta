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

  // Handlers manquants pour income, cashflow, auto, test
  try {
    // Utiliser require pour éviter await dans une fonction non async
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ComptaService = require('./ComptaService');
    ipcMain.handle('compta:income', async () => ComptaService.generateIncomeStatement());
    ipcMain.handle('compta:cashflow', async () => ComptaService.generateCashflow());
    ipcMain.handle('compta:auto', async (_event, input) => ComptaService.enregistrerEcritureAuto(input));
  } catch (e) {
    // Si le module n'existe pas, ignorer (dev mode)
  }
  ipcMain.handle('compta:test', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const TestModule = require('./testLogiqueComptable');
    return TestModule.testLogiqueComptable();
  });

  ipcRegistered = true;
}
