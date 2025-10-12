import type {
  BalanceSheetSummary,
  ComptaEntry,
  RegisterComptaPayload,
} from '../compta';

export interface ComptaElectronBridge {
  list: () => Promise<ComptaEntry[]>;
  register: (payload: RegisterComptaPayload) => Promise<ComptaEntry>;
  remove: (id: string) => Promise<boolean>;
  balance: () => Promise<BalanceSheetSummary>;
}

export default interface IElectronServices {
  compta: ComptaElectronBridge;
}

declare global {
  interface Window {
    electronService: IElectronServices;
  }
}
