
import type {
  BalanceSheetSummary,
  ComptaEntry,
  RegisterComptaPayload,
  IncomeStatementSummary,
  CashflowSummary,
} from '../compta';
import type { AutoClassifyInput } from '../../autoClassifier';

export interface ComptaElectronBridge {
  list: () => Promise<ComptaEntry[]>;
  register: (payload: RegisterComptaPayload) => Promise<ComptaEntry>;
  remove: (id: string) => Promise<boolean>;
  balance: () => Promise<BalanceSheetSummary>;
  income: () => Promise<IncomeStatementSummary>;
  cashflow: () => Promise<CashflowSummary>;
  cloture: () => Promise<any>;
  test: () => Promise<any>;
  testEcoBois: () => Promise<any>;
  auto: (input: AutoClassifyInput) => Promise<ComptaEntry[]>;
}

export default interface IElectronServices {
  compta: ComptaElectronBridge;
}

declare global {
  interface Window {
    electronService: IElectronServices;
  }
}
