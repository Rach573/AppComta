import { ipcRenderer } from 'electron';
import type {
  BalanceSheetSummary,
  ComptaEntry,
  RegisterComptaPayload,
} from '@shared/types/compta';

export const comptaRepository = {
  list: async (): Promise<ComptaEntry[]> => ipcRenderer.invoke('compta:list'),
  register: async (payload: RegisterComptaPayload): Promise<ComptaEntry> =>
    ipcRenderer.invoke('compta:register', payload),
  remove: async (id: string): Promise<boolean> => ipcRenderer.invoke('compta:delete', id),
  balance: async (): Promise<BalanceSheetSummary> => ipcRenderer.invoke('compta:balance'),
};
