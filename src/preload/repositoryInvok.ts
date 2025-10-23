import { ipcRenderer } from 'electron';
import type {
  BalanceSheetSummary,
  ComptaEntry,
  RegisterComptaPayload,
  IncomeStatementSummary,
  CashflowSummary,
} from '@shared/types/compta';
import type { AutoClassifyInput } from '@shared/autoClassifier';

export const comptaRepository = {
  list: async (): Promise<ComptaEntry[]> => ipcRenderer.invoke('compta:list'),
  register: async (payload: RegisterComptaPayload): Promise<ComptaEntry> =>
    ipcRenderer.invoke('compta:register', payload),
  remove: async (id: string): Promise<boolean> => ipcRenderer.invoke('compta:delete', id),
  balance: async (): Promise<BalanceSheetSummary> => ipcRenderer.invoke('compta:balance'),
  income: async (): Promise<IncomeStatementSummary> => ipcRenderer.invoke('compta:income'),
  cashflow: async (): Promise<CashflowSummary> => ipcRenderer.invoke('compta:cashflow'),
  cloture: async (): Promise<any> => ipcRenderer.invoke('compta:cloture'),
  test: async (): Promise<any> => ipcRenderer.invoke('compta:test'),
  testEcoBois: async (): Promise<any> => ipcRenderer.invoke('compta:testEcoBois'),
  auto: async (input: AutoClassifyInput): Promise<ComptaEntry[]> => ipcRenderer.invoke('compta:auto', input),
};
