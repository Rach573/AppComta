import { ipcMain } from 'electron';
import type { RegisterComptaPayload } from '@shared/types/compta';
import {
  generateBalanceSheet,
  getComptaEntries,
  registerComptaEntry,
  deleteComptaEntry,
  generateIncomeStatement,
  generateCashflow,
} from './ComptaService';

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
  ipcMain.handle('compta:income', async () => generateIncomeStatement());
  ipcMain.handle('compta:cashflow', async () => generateCashflow());
  ipcMain.handle('compta:cloture', async () => {
    const { cloturerExercice } = await import('./ComptaService');
    return cloturerExercice();
  });
  ipcMain.handle('compta:test', async () => {
    const { testLogiqueComptable } = await import('./testLogiqueComptable');
    return testLogiqueComptable();
  });
  ipcMain.handle('compta:testEcoBois', async () => {
    const { testEcoBois } = await import('./testEcoBois');
    return testEcoBois();
  });
  ipcMain.handle('ajouter-ecriture', async (_event, description: string, montant: number) => {
    const { ajouterEcritureAuto } = await import('./ComptaService');
    return ajouterEcritureAuto(description, montant);
  });
  ipcMain.handle('compta:auto', async (_event, input) => {
    const { enregistrerEcritureAuto } = await import('./ComptaService');
    return enregistrerEcritureAuto(input);
  });

  ipcRegistered = true;
}
